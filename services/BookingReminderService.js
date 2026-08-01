/**
 * After a booking/quote is received, send follow-up reminders
 * every 6 hours for 24 hours (at T+6, T+12, T+18, T+24).
 */
const db = require('../config/db');
const emailService = require('../src/utils/emailService');
const {
  getClientBookingReminderHTML
} = require('../src/utils/bookingTemplates');

const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const SLOTS = [6, 12, 18, 24]; // hours after booking
const POLL_MS = 5 * 60 * 1000; // check every 5 minutes

let started = false;

async function ensureReminderTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS booking_reminders (
      id bigserial PRIMARY KEY,
      booking_id uuid NOT NULL,
      hours_offset integer NOT NULL,
      email varchar(255) NOT NULL,
      sent_at timestamptz DEFAULT NOW(),
      UNIQUE (booking_id, hours_offset)
    )
  `).catch(() => {});
}

function buildReminderHtml(booking, hoursOffset) {
  try {
    if (typeof getClientBookingReminderHTML === 'function') {
      return getClientBookingReminderHTML(booking, hoursOffset);
    }
  } catch (_) {}

  const name = booking.customer_name || booking.full_name || 'Traveler';
  const pkg = booking.package_name || 'your Tanzania safari';
  const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
  return `
  <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5ebe3;border-radius:16px;overflow:hidden">
    <div style="background:#263E22;padding:24px;text-align:center;color:#fff">
      <img src="${site}/images/logo.png" width="48" height="48" style="border-radius:8px;background:#fff;padding:4px" alt="">
      <h1 style="margin:10px 0 0;font-size:20px">Safari quote follow-up</h1>
    </div>
    <div style="height:4px;background:#FF6F00"></div>
    <div style="padding:28px;color:#475569;font-size:15px;line-height:1.6">
      <p>Hi ${name},</p>
      <p>This is a friendly reminder (${hoursOffset}h after your request) that we received your quote enquiry for <strong>${pkg}</strong>.</p>
      <p>Our Team in Arusha is preparing your itinerary. Reply to this email or WhatsApp us if you have preferred dates, lodge style, or budget notes.</p>
      <p style="margin-top:20px">
        <a href="https://wa.me/255695108009" style="display:inline-block;background:#FF6F00;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700">WhatsApp Our Team</a>
      </p>
      <p style="font-size:13px;color:#94a3b8">Reminder ${hoursOffset} of 24 hours · Tanzania Safari Magic</p>
    </div>
  </div>`;
}

async function fetchEligibleBookings() {
  const since = new Date(Date.now() - WINDOW_MS - INTERVAL_MS);
  try {
    const result = await db.query(
      `SELECT booking_id, email, customer_name, full_name, package_name, package_id,
              start_date, travel_date, number_of_adults, number_of_children,
              phone, created_at, booking_status, status
       FROM bookings
       WHERE created_at >= $1
         AND email IS NOT NULL AND TRIM(email) <> ''
       ORDER BY created_at ASC
       LIMIT 200`,
      [since]
    );
    return result.rows;
  } catch (e) {
    const result = await db.query(
      `SELECT * FROM bookings
       WHERE created_at >= $1 AND email IS NOT NULL
       ORDER BY created_at ASC LIMIT 200`,
      [since]
    );
    return result.rows;
  }
}

function statusSkipsReminders(booking) {
  const s = String(booking.booking_status || booking.status || '').toLowerCase();
  return ['cancelled', 'rejected', 'completed', 'confirmed'].includes(s);
}

async function processReminders() {
  await ensureReminderTable();
  const bookings = await fetchEligibleBookings();
  const now = Date.now();

  for (const booking of bookings) {
    if (statusSkipsReminders(booking)) continue;
    const created = new Date(booking.created_at).getTime();
    if (!created || Number.isNaN(created)) continue;
    const ageMs = now - created;
    if (ageMs < INTERVAL_MS || ageMs > WINDOW_MS + 30 * 60 * 1000) continue;

    for (const hours of SLOTS) {
      const dueAt = created + hours * 60 * 60 * 1000;
      if (now < dueAt) continue;
      if (now > dueAt + INTERVAL_MS) continue; // miss window for this slot; skip

      let claimed = false;
      try {
        await db.query(
          `INSERT INTO booking_reminders (booking_id, hours_offset, email)
           VALUES ($1, $2, $3)`,
          [booking.booking_id, hours, booking.email]
        );
        claimed = true;
      } catch (_) {
        continue; // already sent this slot
      }

      if (!claimed) continue;

      try {
        const subject = hours >= 24
          ? 'Last follow-up on your Tanzania safari quote'
          : `Reminder: your Tanzania safari quote request (${hours}h)`;

        await emailService.sendEmail({
          to: booking.email,
          subject,
          html: buildReminderHtml(booking, hours)
        });
        console.log(`[booking-reminder] sent ${hours}h to ${booking.email} booking=${booking.booking_id}`);
      } catch (e) {
        console.error(`[booking-reminder] failed ${booking.email}:`, e.message);
      }
    }
  }
}

function startBookingReminderJob() {
  if (started) return;
  started = true;
  ensureReminderTable().catch(() => {});
  // Initial delay so DB is ready
  setTimeout(() => {
    processReminders().catch(e => console.error('booking reminder tick:', e.message));
    setInterval(() => {
      processReminders().catch(e => console.error('booking reminder tick:', e.message));
    }, POLL_MS);
  }, 20000);
  console.log('[booking-reminder] job started (every 6h for 24h after booking)');
}

module.exports = {
  startBookingReminderJob,
  processReminders,
  ensureReminderTable,
  SLOTS
};
