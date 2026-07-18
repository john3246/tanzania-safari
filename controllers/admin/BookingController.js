const bookingService = require('../../services/BookingService');

class BookingController {
    async list(req, res) {
        try {
            const data = await bookingService.getBookingsWithDetails();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            let finalStatusId = req.body.status_id;

            // Map string 'status' (e.g. "confirmed") from frontend to status_id dynamically
            if (req.body.status && !finalStatusId) {
                const db = require('../../config/db');
                // Format to match DB exactly, e.g. "Confirmed"
                const statusStr = req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1).toLowerCase();
                const statusRes = await db.query('SELECT status_id FROM booking_statuses WHERE status_name = $1', [statusStr]);
                if (statusRes.rows.length > 0) {
                    finalStatusId = statusRes.rows[0].status_id;
                }
            }

            if (!finalStatusId) {
                return res.status(400).json({ success: false, message: 'status_id or valid status string is required' });
            }
            await bookingService.updateStatus(req.params.id, parseInt(finalStatusId));
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new BookingController();
