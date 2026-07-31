const groupDepartureRepo = require('../repositories/GroupDepartureRepository');
const enquiryRepo = require('../repositories/enquiry.repository');

class GroupSafariController {
    async listDepartures(req, res) {
        try {
            const limit = parseInt(req.query.limit, 10) || 50;
            const upcomingOnly = req.query.upcoming !== 'false';
            const data = await groupDepartureRepo.listPublic({ limit, upcomingOnly });
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

            const { full_name, email, phone, country, travelers, message } = req.body;
            if (!full_name || !email) {
                return res.status(400).json({ success: false, message: 'Name and email are required' });
            }

            const travelDate = departure.start_date
                ? new Date(departure.start_date).toISOString().slice(0, 10)
                : null;
            const note = [
                message || '',
                '',
                `[Group safari request]`,
                `Departure: ${departure.title}`,
                `Slug: ${departure.departure_slug}`,
                `Dates: ${travelDate} → ${departure.end_date ? new Date(departure.end_date).toISOString().slice(0, 10) : ''}`,
                `Departure ID: ${departure.departure_id}`,
                `Price/person: $${departure.sale_price_usd}`
            ].filter(Boolean).join('\n');

            await enquiryRepo.create({
                full_name,
                email,
                phone,
                country,
                enquiry_type: 'Group Safari',
                package_id: departure.package_id,
                travel_date: travelDate,
                travelers: travelers || 1,
                message: note,
                ip_address: req.ip
            });

            res.json({
                success: true,
                message: 'Thank you! Our team will confirm your seat and send trip details shortly.'
            });
        } catch (error) {
            console.error('requestTrip error:', error);
            res.status(500).json({ success: false, message: 'Error submitting request' });
        }
    }
}

module.exports = new GroupSafariController();
