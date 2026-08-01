const groupDepartureRepo = require('../repositories/GroupDepartureRepository');
const enquiryRepo = require('../repositories/enquiry.repository');
const db = require('../config/db');

let enquiryColumnsReady = false;

async function ensureEnquiryGroupColumns() {
    if (enquiryColumnsReady) return;
    const stmts = [
        `ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS departure_id uuid`,
        `ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS seats_held integer DEFAULT 0`,
        `ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS deposit_percent numeric(5,2) DEFAULT 30`,
        `ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS deposit_amount_usd numeric(12,2)`,
        `ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS deposit_due_at timestamptz`,
        `ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS seats_adjusted boolean DEFAULT false`
    ];
    for (const sql of stmts) {
        try { await db.query(sql); } catch (e) { console.warn('ensureEnquiryGroupColumns:', e.message); }
    }
    try {
        await db.query(`
            ALTER TABLE contact_enquiries DROP CONSTRAINT IF EXISTS contact_enquiries_enquiry_status_check;
            ALTER TABLE contact_enquiries
              ADD CONSTRAINT contact_enquiries_enquiry_status_check
              CHECK (enquiry_status::text = ANY (ARRAY[
                'New'::text, 'In Progress'::text, 'Approved'::text,
                'Responded'::text, 'Converted'::text, 'Closed'::text
              ]));
        `);
    } catch (e) { console.warn('ensureEnquiryGroupColumns status check:', e.message); }
    try {
        await db.query(`
            DO $$ BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'contact_enquiries_departure_fk'
              ) THEN
                ALTER TABLE contact_enquiries
                  ADD CONSTRAINT contact_enquiries_departure_fk
                  FOREIGN KEY (departure_id)
                  REFERENCES public.group_departures(departure_id)
                  ON DELETE SET NULL;
              END IF;
            END $$;
        `);
    } catch (e) { console.warn('ensureEnquiryGroupColumns FK:', e.message); }
    enquiryColumnsReady = true;
}

class GroupSafariController {
    async listDepartures(req, res) {
        try {
            const limit = parseInt(req.query.limit, 10) || 100;
            const upcomingOnly = req.query.upcoming !== 'false';
            const year = req.query.year ? parseInt(req.query.year, 10) : null;
            const month = req.query.month ? parseInt(req.query.month, 10) : null;
            const data = await groupDepartureRepo.listPublic({ limit, upcomingOnly, year, month });
            res.json({ success: true, data });
        } catch (error) {
            console.error('listDepartures error:', error);
            res.status(500).json({ success: false, message: 'Error fetching group departures' });
        }
    }

    async getDeparture(req, res) {
        try {
            const data = await groupDepartureRepo.getBySlug(req.params.slug);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Departure not found' });
            }
            res.json({ success: true, data });
        } catch (error) {
            console.error('getDeparture error:', error);
            res.status(500).json({ success: false, message: 'Error fetching departure' });
        }
    }

    async requestTrip(req, res) {
        try {
            await ensureEnquiryGroupColumns();

            const departure = await groupDepartureRepo.getBySlug(req.params.slug);
            if (!departure) {
                return res.status(404).json({ success: false, message: 'Departure not found' });
            }
            if (departure.status === 'full' || departure.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'This departure is not available for requests'
                });
            }
            if (Number(departure.seats_left) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No seats left on this departure'
                });
            }

            const { full_name, email, phone, country, travelers, message } = req.body;
            if (!full_name || !email) {
                return res.status(400).json({ success: false, message: 'Name and email are required' });
            }

            const seatsRequested = Math.max(1, Math.min(parseInt(travelers, 10) || 1, Number(departure.seats_left) || 1));
            const pricePerPerson = Number(departure.sale_price_usd || departure.price_usd || 0);
            const depositPercent = 30;
            const depositAmount = Math.round(pricePerPerson * seatsRequested * (depositPercent / 100));
            const depositDueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const travelDate = departure.start_date
                ? new Date(departure.start_date).toISOString().slice(0, 10)
                : null;

            const note = [
                (message || '').trim(),
                '',
                `[Group safari request]`,
                `Departure: ${departure.title}`,
                `Slug: ${departure.departure_slug}`,
                `Departure ID: ${departure.departure_id}`,
                `Dates: ${travelDate} → ${departure.end_date ? new Date(departure.end_date).toISOString().slice(0, 10) : ''}`,
                `Travelers / seats: ${seatsRequested}`,
                `Price/person: $${pricePerPerson}`,
                `Deposit to secure seat: ${depositPercent}% = $${depositAmount} USD`,
                `Deposit due within 24 hours (by ${depositDueAt.toISOString()})`,
                `Remaining balance after approval: $${Math.max(0, (pricePerPerson * seatsRequested) - depositAmount)} USD`
            ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n');

            // Sanitize IP for inet column (optional)
            let ip = req.ip || req.headers['x-forwarded-for'] || null;
            if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
            if (ip === '::1') ip = '127.0.0.1';

            const created = await enquiryRepo.createGroupRequest({
                full_name: String(full_name).trim(),
                email: String(email).trim(),
                phone: phone ? String(phone).trim() : null,
                country: country ? String(country).trim() : null,
                enquiry_type: 'Group',
                package_id: departure.package_id,
                departure_id: departure.departure_id,
                travel_date: travelDate,
                travelers: seatsRequested,
                seats_held: seatsRequested,
                deposit_percent: depositPercent,
                deposit_amount_usd: depositAmount,
                deposit_due_at: depositDueAt.toISOString(),
                message: note || `Group safari request for ${departure.title}`,
                ip_address: ip
            }).catch(async (err) => {
                console.warn('createGroupRequest failed, falling back:', err.message);
                // Fallback without new columns so the request still reaches admin
                return enquiryRepo.create({
                    full_name: String(full_name).trim(),
                    email: String(email).trim(),
                    phone: phone ? String(phone).trim() : null,
                    country: country ? String(country).trim() : null,
                    enquiry_type: 'Group',
                    package_id: departure.package_id,
                    travel_date: travelDate,
                    travelers: seatsRequested,
                    message: note || `Group safari request for ${departure.title}`,
                    ip_address: ip
                });
            });

            // Notify admins (best-effort)
            try {
                const notificationService = require('../services/NotificationService');
                if (notificationService?.create) {
                    await notificationService.create({
                        type: 'enquiry',
                        title: 'New group safari request',
                        message: `${full_name} requested ${seatsRequested} seat(s) on ${departure.title}`,
                        relatedId: String(created.enquiry_id)
                    });
                }
            } catch (_) { /* optional */ }

            res.json({
                success: true,
                data: {
                    enquiry_id: created.enquiry_id,
                    seats_requested: seatsRequested,
                    deposit_percent: depositPercent,
                    deposit_amount_usd: depositAmount,
                    deposit_due_at: depositDueAt.toISOString()
                },
                message: `Request received! To secure your seat, please pay a ${depositPercent}% deposit ($${depositAmount} USD) within 24 hours. Our team will confirm payment details shortly.`
            });
        } catch (error) {
            console.error('requestTrip error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error submitting request'
            });
        }
    }
}

module.exports = new GroupSafariController();
