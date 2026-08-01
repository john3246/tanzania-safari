/**
 * Online payment API — hidden from clients while ONLINE_PAYMENTS_ENABLED is not true.
 * Create-checkout requires admin auth. Webhook is Stripe-only when enabled.
 */

const express = require('express');
const router = express.Router();
const paymentService = require('../../services/payments/PaymentService');
const verifyAdmin = require('../../middleware/verifyAdmin');

/** Public-safe status (always 200; does not advertise checkout UI). */
router.get('/status', (req, res) => {
  const status = paymentService.getBlueprintStatus();
  res.json({
    success: true,
    data: {
      onlinePaymentsEnabled: status.onlinePaymentsEnabled,
      // Never tell the public that checkout is available for browsing
      clientCheckoutAvailable: false
    }
  });
});

/** Admin-only: create a Checkout session (for future internal use / testing). */
router.post('/checkout-session', verifyAdmin, async (req, res) => {
  try {
    const { booking_id, amount_usd, customer_email, description } = req.body || {};
    const result = await paymentService.createDepositCheckout({
      bookingId: booking_id,
      amountUsd: amount_usd,
      customerEmail: customer_email,
      description
    });
    res.json({ success: true, data: result });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.message || 'Could not create checkout session',
      code: err.code
    });
  }
});

/** Admin-only blueprint diagnostics. */
router.get('/blueprint', verifyAdmin, (req, res) => {
  res.json({ success: true, data: paymentService.getBlueprintStatus() });
});

/**
 * Stripe webhook — only processes when payments are enabled.
 * Note: for signature verification in production, mount raw body for this path
 * (see docs/PAYMENT_BLUEPRINT.md). Until then, disabled path returns 503.
 */
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.body;
    const result = await paymentService.handleStripeWebhook(rawBody, signature);
    res.json(result);
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

module.exports = router;
