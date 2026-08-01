/**
 * Stripe Checkout provider (blueprint).
 * Does not call Stripe until ONLINE_PAYMENTS_ENABLED=true and STRIPE_SECRET_KEY is set.
 * Install when going live: npm install stripe
 */

const { getStripeConfig } = require('./payment.config');

let stripeClient = null;

function getStripe() {
  const { secretKey } = getStripeConfig();
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripeClient) {
    // Lazy require so the app boots without the stripe package installed
    // eslint-disable-next-line global-require
    const Stripe = require('stripe');
    stripeClient = new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' });
  }
  return stripeClient;
}

/**
 * @param {{ amountCents: number, currency?: string, customerEmail?: string, metadata?: object, description?: string }} opts
 */
async function createCheckoutSession(opts) {
  const cfg = getStripeConfig();
  const stripe = getStripe();
  const amount = Math.round(Number(opts.amountCents));
  if (!amount || amount < 50) {
    throw new Error('Amount must be at least 50 cents');
  }

  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: opts.customerEmail || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: opts.currency || cfg.currency,
          unit_amount: amount,
          product_data: {
            name: opts.description || 'Safari deposit — Tanzania Safari Magic'
          }
        }
      }
    ],
    success_url: cfg.successUrl,
    cancel_url: cfg.cancelUrl,
    metadata: opts.metadata || {}
  });
}

/**
 * Verify webhook signature and return the event.
 * @param {Buffer|string} rawBody
 * @param {string} signature
 */
function constructWebhookEvent(rawBody, signature) {
  const cfg = getStripeConfig();
  if (!cfg.webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return getStripe().webhooks.constructEvent(rawBody, signature, cfg.webhookSecret);
}

module.exports = {
  createCheckoutSession,
  constructWebhookEvent,
  getStripe
};
