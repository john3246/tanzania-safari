const bookingService = require('../services/booking.service');
const emailService = require('../src/utils/emailService');
const { getClientBookingEmailHTML, getAdminBookingEmailHTML } = require('../src/utils/bookingTemplates');

class BookingController {
    async createBooking(req, res) {
        try {
            // userId is now optional to allow guest bookings
            const userId = req.user ? req.user.user_id : null;
            
            const bookingData = { 
                ...req.body, 
                user_id: userId 
            };
            
            const result = await bookingService.createBooking(bookingData);

            // CRM + in-app notification (non-blocking)
            Promise.resolve().then(async () => {
                try {
                    const CustomerRepository = require('../repositories/CustomerRepository');
                    const NotificationRepository = require('../repositories/NotificationRepository');
                    await CustomerRepository.upsertFromBooking({
                        name: bookingData.customer_name || bookingData.full_name,
                        email: bookingData.email,
                        phone: bookingData.phone
                    });
                    const bookingId = result?.booking_id || result?.id || result?.data?.booking_id;
                    await NotificationRepository.create({
                        type: 'booking',
                        title: 'New booking',
                        message: `${bookingData.customer_name || bookingData.full_name || 'Guest'} submitted a booking`,
                        relatedId: bookingId ? String(bookingId) : null,
                        actionUrl: '/admin/bookings'
                    });
                    if (global.__chatIo) {
                        global.__chatIo.to('admin_room').emit('admin_notification', {
                            type: 'booking',
                            title: 'New booking',
                            message: `${bookingData.customer_name || 'Guest'} submitted a booking`
                        });
                    }
                } catch (e) {
                    console.error('Booking CRM/notification error:', e.message);
                }
            });
            
            // Background email tasks (do not block the response)
            Promise.all([
                // 1. Send confirmation to the client/booker
                emailService.sendEmail({
                    to: bookingData.email,
                    subject: 'We received your Tanzania safari quote request',
                    html: getClientBookingEmailHTML(bookingData)
                }).catch(e => console.error('Failed to send client booking email:', e)),
                
                // 2. Send notification to Admin
                emailService.sendEmail({
                    to: process.env.ADMIN_EMAIL || 'info@tanzaniasafarimagic.com',
                    subject: `New safari quote request: ${bookingData.customer_name || bookingData.full_name || 'Guest'}`,
                    html: getAdminBookingEmailHTML(bookingData)
                }).catch(e => console.error('Failed to send admin booking email:', e))
            ]);
            
            res.status(201).json({
                success: true,
                message: 'Quote request received. Our Team will reply with next steps — no payment was taken online.',
                data: result
            });
        } catch (error) {
            console.error('Booking creation error:', error);
            res.status(500).json({ success: false, message: 'Error processing your booking' });
        }
    }

    async getAllBookings(req, res) {
        try {
            const bookings = await bookingService.getAllBookings();
            res.json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching bookings' });
        }
    }

    async getBookingById(req, res) {
        try {
            const booking = await bookingService.getBookingById(req.params.id);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching booking' });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            await bookingService.updateBookingStatus(req.params.id, status);
            res.json({ success: true, message: 'Booking status updated' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new BookingController();
