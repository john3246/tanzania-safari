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
