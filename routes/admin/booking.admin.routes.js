const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyAdmin } = require('../../middleware/auth.middleware');
const emailService = require('../../services/email');

router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const query = await db.query(`
            SELECT b.*, sp.package_name, u.first_name, u.last_name, u.email,
                   COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), 'Guest') as full_name,
                   bs.status_name
            FROM bookings b
            LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
            ORDER BY b.created_at DESC
        `);
        res.json({ success: true, data: query.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bookings' });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { status_id } = req.body;
        
        // Get current booking details before update
        const currentBooking = await db.query(`
            SELECT b.*, sp.package_name, u.first_name, u.last_name, u.email,
                   COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), b.full_name) as full_name,
                   bs.status_name as current_status
            FROM bookings b
            LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
            WHERE b.booking_id = $1
        `, [req.params.id]);

        if (currentBooking.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Get new status name
        const newStatusResult = await db.query('SELECT status_name FROM booking_statuses WHERE status_id = $1', [status_id]);
        const newStatusName = newStatusResult.rows[0]?.status_name;

        // Update booking status
        await db.query('UPDATE bookings SET status_id = $1, updated_at = NOW() WHERE booking_id = $2', [status_id, req.params.id]);

        // Send email notification based on status change
        const booking = currentBooking.rows[0];
        booking.status_name = newStatusName;

        try {
            if (newStatusName === 'Confirmed') {
                await emailService.sendBookingApproved(booking);
            } else if (newStatusName === 'Rejected') {
                await emailService.sendBookingRejected(booking);
            } else if (newStatusName === 'Cancelled') {
                await emailService.sendBookingCancelled(booking);
            }
        } catch (emailError) {
            console.error('Failed to send booking status email:', emailError.message);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating booking status' });
    }
});

module.exports = router;
