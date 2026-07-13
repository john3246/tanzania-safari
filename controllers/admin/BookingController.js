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
            const { status_id } = req.body;
            if (!status_id) {
                return res.status(400).json({ success: false, message: 'status_id is required' });
            }
            await bookingService.updateStatus(req.params.id, parseInt(status_id));
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new BookingController();
