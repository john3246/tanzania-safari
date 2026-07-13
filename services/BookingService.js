const BaseService = require('./BaseService');
const bookingRepository = require('../repositories/BookingRepository');
const emailService = require('./email'); // Using existing email queueing service

class BookingService extends BaseService {
    constructor() {
        super(bookingRepository);
    }

    async getBookingsWithDetails() {
        return await this.repository.getBookingsWithDetails();
    }

    async updateStatus(bookingId, statusId) {
        const booking = await this.repository.getBookingDetails(bookingId);
        if (!booking) throw new Error('Booking not found');

        const newStatusName = await this.repository.getStatusName(statusId);
        if (!newStatusName) throw new Error('Invalid status ID');

        // Update status in DB
        await this.repository.update(bookingId, { status_id: statusId });

        // Update localized object status for email trigger
        booking.status_name = newStatusName;

        // Try dispatching email asynchronously
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

        return booking;
    }
}

module.exports = new BookingService();
