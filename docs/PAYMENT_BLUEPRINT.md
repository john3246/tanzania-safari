# Online payment blueprint (hidden from clients)

Tanzania Safari Magic remains a **quote + offline deposit** business until you flip the feature flag and ship UI.

## Current public behaviour

- Booking form = **Request Free Quote** (no card fields).
- Group departures = request a seat; deposit is arranged **offline** after approval.
- Footer / legal pages state quotes & offline deposits.
- Admin can still **record** payments manually (`PaymentRepository` / booking add-payment).

## Feature flag

```env
ONLINE_PAYMENTS_ENABLED=false
```

When `false` (default):

- `POST /api/payments/checkout-session` returns **503**.
- Stripe webhook returns **503**.
- Public `/api/payments/status` always reports `clientCheckoutAvailable: false`.
- No pay buttons on the website.

Set to `true` only after Stripe keys, webhook, and a tested admin/pay flow exist.

## Stripe env (commented until go-live)

```env
# ONLINE_PAYMENTS_ENABLED=true
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# STRIPE_CURRENCY=usd
# STRIPE_SUCCESS_URL=https://tanzaniasafarimagic.com/thank-you?from=payment
# STRIPE_CANCEL_URL=https://tanzaniasafarimagic.com/booking
```

Install SDK when enabling: `npm install stripe`

## Code map

| Piece | Path |
|--------|------|
| Flag + Stripe config | `services/payments/payment.config.js` |
| Stripe Checkout + webhook verify | `services/payments/stripeProvider.js` |
| Orchestration + DB record | `services/payments/PaymentService.js` |
| Routes (admin checkout, webhook) | `routes/api/payments.routes.js` |
| Manual payments (live today) | `repositories/PaymentRepository.js`, admin `addPayment` |

## Recommended go-live sequence

1. Create Stripe account + product for “Safari deposit”.
2. Add keys to production env; keep `ONLINE_PAYMENTS_ENABLED=false`.
3. Point Stripe webhook to `https://tanzaniasafarimagic.com/api/payments/webhook/stripe` (`checkout.session.completed`).
4. Ensure Express uses **raw body** for that route (already `express.raw` on the route; if a global JSON parser runs first, register the webhook before `express.json` or use `verify` callback).
5. Test admin `POST /api/payments/checkout-session` with a real booking id.
6. Add a private “Pay deposit” link in confirmation emails / admin only — still no homepage CTA.
7. Flip `ONLINE_PAYMENTS_ENABLED=true`.
8. Later: optional public pay page with booking token (not in this blueprint UI).

## Security notes

- Never put secret keys in the browser.
- Checkout creation is **admin-auth only** until a signed guest token flow exists.
- Keep Privacy/Terms updated when live card processing starts (PCI via Stripe Checkout; no card data on your servers).
