const BaseRepository = require('./BaseRepository');

class PaymentRepository extends BaseRepository {
    constructor() {
        super('booking_payments', 'payment_id');
    }

    async getPaymentsByBookingId(bookingId) {
        return await this.findAll({ booking_id: bookingId }, { orderBy: 'payment_date', orderDirection: 'DESC' });
    }
}

module.exports = new PaymentRepository();
