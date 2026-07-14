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
            
            // Background email tasks (do not block the response)
            Promise.all([
                // 1. Send confirmation to the client/booker
                emailService.sendEmail({
                    to: bookingData.email,
                    subject: 'Your Tanzania Safari Magic Booking is Confirmed!',
                    html: getClientBookingEmailHTML(bookingData)
                }).catch(e => console.error('Failed to send client booking email:', e)),
                
                // 2. Send notification to Admin
                emailService.sendEmail({
                    to: process.env.ADMIN_EMAIL || 'info@tanzaniasafarimagic.com',
                    subject: `New Safari Booking: ${bookingData.customer_name}`,
                    html: getAdminBookingEmailHTML(bookingData)
                }).catch(e => console.error('Failed to send admin booking email:', e))
            ]);
            
            res.status(201).json({
                success: true,
                message: 'Booking request submitted successfully',
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
