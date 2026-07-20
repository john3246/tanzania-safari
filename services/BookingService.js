const BaseService = require('./BaseService');
const bookingRepository = require('../repositories/BookingRepository');
const paymentRepository = require('../repositories/PaymentRepository');
const communicationRepository = require('../repositories/CommunicationRepository');
const emailService = require('./email');

class BookingService extends BaseService {
    constructor() {
        super(bookingRepository);
    }

    async getBookingsWithDetails() {
        return await this.repository.getBookingsWithDetails();
    }

    async getBookingFullDetails(bookingId) {
        const booking = await this.repository.getBookingDetails(bookingId);
        if (!booking) return null;

        const payments = await paymentRepository.getPaymentsByBookingId(bookingId);
        const communications = await communicationRepository.getCommunicationsByBookingId(bookingId);

        return {
            ...booking,
            payments,
            communications
        };
    }

    async addPayment(bookingId, paymentData, userId) {
        const payment = await paymentRepository.create({
            booking_id: bookingId,
            ...paymentData,
            recorded_by: userId
        });

        // Log this action
        await this.logCommunication(bookingId, 'system', 'Payment Logged', `A payment of ${paymentData.amount} ${paymentData.currency || 'USD'} was logged.`, 'internal', userId);

        return payment;
    }

    async logCommunication(bookingId, type, subject, content, direction, senderId = null) {
        return await communicationRepository.create({
            booking_id: bookingId,
            type,
            subject,
            content,
            direction,
            sender_id: senderId
        });
    }

    async updateStatus(bookingId, statusId, userId) {
        const booking = await this.repository.getBookingDetails(bookingId);
        if (!booking) throw new Error('Booking not found');

        const newStatusName = await this.repository.getStatusName(statusId);
        if (!newStatusName) throw new Error('Invalid status ID');

        const oldStatusName = booking.current_status;

        // Update status in DB
        await this.repository.update(bookingId, { status_id: statusId });

        // Log communication
        await this.logCommunication(
            bookingId, 
            'status_change', 
            `Status changed to ${newStatusName}`, 
            `Booking status was updated from ${oldStatusName} to ${newStatusName}.`, 
            'internal', 
            userId
        );

        // Update localized object status for email trigger
        booking.status_name = newStatusName;

        // Try dispatching email asynchronously
        try {
            if (newStatusName === 'Confirmed') {
                await emailService.sendBookingApproved(booking);
                await this.logCommunication(bookingId, 'system', 'Approval Email Sent', 'Automated approval email dispatched.', 'outbound', userId);
            } else if (newStatusName === 'Rejected') {
                await emailService.sendBookingRejected(booking);
                await this.logCommunication(bookingId, 'system', 'Rejection Email Sent', 'Automated rejection email dispatched.', 'outbound', userId);
            } else if (newStatusName === 'Cancelled') {
                await emailService.sendBookingCancelled(booking);
                await this.logCommunication(bookingId, 'system', 'Cancellation Email Sent', 'Automated cancellation email dispatched.', 'outbound', userId);
            }
        } catch (emailError) {
            console.error('Failed to send booking status email:', emailError.message);
        }

        return booking;
    }
}

module.exports = new BookingService();
