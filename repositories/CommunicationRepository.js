const BaseRepository = require('./BaseRepository');

class CommunicationRepository extends BaseRepository {
    constructor() {
        super('booking_communications', 'communication_id');
    }

    async getCommunicationsByBookingId(bookingId) {
        return await this.findAll({ booking_id: bookingId }, { orderBy: 'created_at', orderDirection: 'DESC' });
    }
}

module.exports = new CommunicationRepository();
