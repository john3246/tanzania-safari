/**
 * Online payments feature flag — keep disabled until Stripe is live.
 * Public UI must not advertise checkout while ONLINE_PAYMENTS_ENABLED !== 'true'.
 */
function isOnlinePaymentsEnabled() {
  return String(process.env.ONLINE_PAYMENTS_ENABLED || '').toLowerCase() === 'true';
}

function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: (process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
    successUrl: process.env.STRIPE_SUCCESS_URL || `${process.env.SITE_URL || 'https://tanzaniasafarimagic.com'}/thank-you?from=payment`,
    cancelUrl: process.env.STRIPE_CANCEL_URL || `${process.env.SITE_URL || 'https://tanzaniasafarimagic.com'}/booking`
  };
}

module.exports = {
  isOnlinePaymentsEnabled,
  getStripeConfig
};
