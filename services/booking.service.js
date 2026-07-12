const bookingRepository = require('../repositories/booking.repository');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email');
const db = require('../config/db');

class BookingService {
    async createBooking(data) {
        // Look up user by email if not logged in
        if (!data.user_id && data.email) {
            const user = await userRepository.findByEmail(data.email);
            if (user) data.user_id = user.user_id;
        }

        // Generate a unique booking reference if not provided
        if (!data.booking_reference) {
            data.booking_reference = 'TS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }

        const booking = await bookingRepository.create(data);
        
        // Fetch full details for the confirmation email
        const fullBooking = await bookingRepository.getBookingWithUserDetails(booking.booking_id);
        
        try {
            await emailService.sendBookingConfirmation(fullBooking);
            
            // Send admin notification for new booking
            const bookingWithPackage = await db.query(`
                SELECT b.*, sp.package_name, u.first_name, u.last_name, u.email,
                       COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), b.full_name) as full_name
                FROM bookings b
                LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
                LEFT JOIN users u ON b.user_id = u.user_id
                WHERE b.booking_id = $1
            `, [booking.booking_id]);
            
            if (bookingWithPackage.rows.length > 0) {
                await emailService.sendAdminBookingNotification(bookingWithPackage.rows[0]);
            }
        } catch (err) {
            console.error('Failed to send booking confirmation email:', err.message);
        }

        return booking;
    }

    async updateBookingStatus(id, statusCode) {
        const statusId = await bookingRepository.getStatusIdByCode(statusCode);
        if (!statusId) throw new Error('Invalid status code');

        await bookingRepository.updateStatus(id, statusId);

        const booking = await bookingRepository.getBookingWithUserDetails(id);
        if (booking) {
            // Send appropriate email based on status
            try {
                if (statusCode === 'confirmed') {
                    await emailService.sendBookingApproved(booking);
                } else if (statusCode === 'rejected') {
                    await emailService.sendBookingRejected(booking);
                } else if (statusCode === 'cancelled') {
                    await emailService.sendBookingCancelled(booking);
                }
            } catch (err) {
                console.error('Failed to send booking status email:', err.message);
            }
        }

        return booking;
    }

    async getAllBookings() {
        return await bookingRepository.getAll();
    }

    async getBookingById(id) {
        return await bookingRepository.getById(id);
    }
}

module.exports = new BookingService();
