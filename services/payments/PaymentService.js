/**
 * Payment orchestration — online path is behind ONLINE_PAYMENTS_ENABLED.
 * Manual deposits continue via PaymentRepository + admin BookingController.addPayment.
 */

const paymentRepository = require('../../repositories/PaymentRepository');
const { isOnlinePaymentsEnabled } = require('./payment.config');
const stripeProvider = require('./stripeProvider');

class PaymentService {
  isEnabled() {
    return isOnlinePaymentsEnabled();
  }

  /**
   * Create a Stripe Checkout session for a booking deposit (admin / internal only until UI ships).
   * @param {{ bookingId: string|number, amountUsd: number, customerEmail?: string, description?: string }} input
   */
  async createDepositCheckout(input) {
    if (!this.isEnabled()) {
      const err = new Error('Online payments are disabled. Set ONLINE_PAYMENTS_ENABLED=true when ready.');
      err.code = 'PAYMENTS_DISABLED';
      err.status = 503;
      throw err;
    }

    const amountUsd = Number(input.amountUsd);
    if (!amountUsd || amountUsd <= 0) {
      throw Object.assign(new Error('Invalid deposit amount'), { status: 400 });
    }

    const session = await stripeProvider.createCheckoutSession({
      amountCents: Math.round(amountUsd * 100),
      customerEmail: input.customerEmail,
      description: input.description || `Deposit for booking #${input.bookingId}`,
      metadata: {
        booking_id: String(input.bookingId || ''),
        purpose: 'deposit',
        source: 'tanzania_safari_magic'
      }
    });

    return {
      sessionId: session.id,
      url: session.url,
      // Publishable key only returned when payments are enabled (admin tooling)
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null
    };
  }

  /**
   * Handle Stripe webhook events. Records completed payments against bookings.
   */
  async handleStripeWebhook(rawBody, signature) {
    if (!this.isEnabled()) {
      const err = new Error('Online payments are disabled');
      err.status = 503;
      throw err;
    }

    const event = stripeProvider.constructWebhookEvent(rawBody, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.booking_id;
      const amountTotal = (session.amount_total || 0) / 100;

      if (bookingId && amountTotal > 0) {
        await paymentRepository.create({
          booking_id: bookingId,
          amount: amountTotal,
          payment_method: 'stripe_checkout',
          payment_status: 'completed',
          transaction_ref: session.id,
          notes: `Stripe session ${session.id}`
        }).catch(async (e) => {
          // Schema may not have all columns — minimal insert
          console.warn('PaymentRepository.create with extras failed:', e.message);
          await paymentRepository.create({
            booking_id: bookingId,
            amount: amountTotal,
            payment_method: 'stripe_checkout',
            payment_status: 'completed'
          });
        });

        try {
          const db = require('../../config/db');
          await db.query(
            `UPDATE bookings SET paid_amount = COALESCE(paid_amount, 0) + $1 WHERE booking_id = $2`,
            [amountTotal, bookingId]
          );
        } catch (e) {
          console.error('Failed to update booking paid_amount:', e.message);
        }
      }
    }

    return { received: true, type: event.type };
  }

  /** Status for admin diagnostics (never expose secrets). */
  getBlueprintStatus() {
    return {
      onlinePaymentsEnabled: this.isEnabled(),
      provider: 'stripe',
      hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
      hasPublishableKey: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
      hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      clientFacingCheckout: false,
      note: 'Public site stays quote/offline-deposit until you enable the flag and ship UI.'
    };
  }
}

module.exports = new PaymentService();
