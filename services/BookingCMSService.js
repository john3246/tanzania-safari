const BaseService = require('./BaseService');
const bookingCMSRepository = require('../repositories/BookingCMSRepository');
const emailService = require('./email/email.service');

class BookingCMSService extends BaseService {
    constructor() {
        super(bookingCMSRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithDetails(conditions, options);
    }

    async getById(id) {
        const booking = await this.repository.findById(id);
        if (!booking || booking.deleted_at) {
            throw new Error('Booking not found');
        }
        return await this.repository.findByReference(booking.booking_reference);
    }

    async create(data) {
        // Generate booking reference
        const reference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
        data.booking_reference = reference;
        
        const booking = await super.create(data);
        return await this.repository.findByReference(reference);
    }

    async update(id, data) {
        await super.update(id, data);
        return await this.repository.findById(id);
    }

    async findByReference(reference) {
        return await this.repository.findByReference(reference);
    }

    async getByStatus(statusId, options = {}) {
        return await this.repository.getByStatus(statusId, options);
    }

    async getByTour(tourId, options = {}) {
        return await this.repository.getByTour(tourId, options);
    }

    async getByUser(userId, options = {}) {
        return await this.repository.getByUser(userId, options);
    }

    async getByDateRange(startDate, endDate, options = {}) {
        return await this.repository.getByDateRange(startDate, endDate, options);
    }

    async getBookingStats() {
        return await this.repository.getBookingStats();
    }

    async getRevenueByMonth(year) {
        return await this.repository.getRevenueByMonth(year);
    }

    async getTopTours(limit = 10) {
        return await this.repository.getTopTours(limit);
    }

    async softDelete(id) {
        return await this.repository.softDelete(id);
    }

    async restore(id) {
        return await this.repository.restore(id);
    }

    async updateStatus(id, statusId) {
        const booking = await this.repository.findById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        const updatedBooking = await this.repository.updateStatus(id, statusId);
        
        // Send email notification based on status change
        const bookingDetails = await this.repository.findByReference(booking.booking_reference);
        
        // Status IDs: 1=Pending, 2=Confirmed, 3=Cancelled, 4=Completed
        if (statusId === 2) {
            // Confirmed
            await emailService.sendAdminBookingConfirmed(bookingDetails);
        } else if (statusId === 3) {
            // Cancelled
            await emailService.sendAdminBookingCancelled(bookingDetails);
        } else if (statusId === 4) {
            // Completed
            await emailService.sendAdminBookingCompleted(bookingDetails);
        }

        return updatedBooking;
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }
}

module.exports = new BookingCMSService();
