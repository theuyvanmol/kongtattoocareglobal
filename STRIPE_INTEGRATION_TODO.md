# Kong Tattoo Care — Stripe Integration TODO

This is your single source of truth for completing the Stripe payment integration.
Work through each section in order before going live.

---

## ✅ Configured Parameters (Already Set)

These were configured in Checkout Studio and are already applied in the code.

**Files:** [`api/create-checkout-session.js`](api/create-checkout-session.js), [`server.js`](server.js)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `ui_mode` | `form` | Embedded checkout form in your page |
| `billing_address_collection` | `auto` | Collects billing address automatically |
| `phone_number_collection.enabled` | `false` | Phone not collected at checkout |
| `automatic_tax.enabled` | `false` | No automatic tax calculation |
| `submit_type` | `auto` | Stripe selects best submit button label |
| `integration_identifier` | `custom_embedded_web_0002` | Checkout Studio identifier |
| `mode` | `payment` | One-time payments (Kong products are not subscriptions) |
| Stripe API version | `2026-08-26.dahlia; custom_checkout_payment_form_preview=v1` | Required for embedded form |

---

## 🔧 Values to Replace Before Going Live

### 1. Stripe API Keys

**Files:** [`.env`](.env), [`checkout.html`](checkout.html)

| Location | Placeholder | What to Set |
|----------|-------------|-------------|
| `.env` → `STRIPE_SECRET_KEY` | `sk_test_51UHzxh…` | Your **live** secret key from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `.env` → `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Your **live** publishable key |
| `checkout.html` line ~183 | `{{STRIPE_PUBLISHABLE_KEY}}` | Same live publishable key |
| `.env` → `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From [dashboard.stripe.com/workbench/webhooks](https://dashboard.stripe.com/workbench/webhooks) |
| `.env` → `DOMAIN` | `http://localhost:4242` | Your production domain, e.g. `https://kongtattoocare.com` |

> ⚠️ The secret key in your message (`sk_test_51UHzxh…`) is a **test key** and is now visible in this file. It is good practice to rotate it at [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) → Roll key.

---

### 2. Stripe Price IDs — One Per Product

**File:** [`checkout.html`](checkout.html) → `PRICE_MAP` object (around line 140)

Create a Price for each Kong product in the Stripe Dashboard:
👉 [dashboard.stripe.com/products](https://dashboard.stripe.com/products) → Add product → Add price

| Product | Placeholder | Price to Create |
|---------|-------------|-----------------|
| KONG Rapid Spray | `{{PRICE_ID_NUMB_SPRAY}}` | £17.99 one-time |
| KONG Rapid Cream 30g | `{{PRICE_ID_NUMB_CREAM}}` | £12.99 one-time |
| Foam Cleanser | `{{PRICE_ID_GLOW_FOAM}}` | £13.19 one-time |
| Tattoo Balm | `{{PRICE_ID_GLOW_BALM}}` | £17.99 one-time |
| Tattoo Care Stick | `{{PRICE_ID_GLOW_STICK}}` | £14.39 one-time |
| Care Stick Roll-On | `{{PRICE_ID_GLOW_ROLL}}` | £12.79 one-time |
| Tattoo Glide | `{{PRICE_ID_GLOW_GLIDE}}` | £15.99 one-time |
| Renew Supreme Butter | `{{PRICE_ID_RENEW_BUTTER}}` | £18.00 one-time |
| Defend Sun Lotion SPF50 | `{{PRICE_ID_DEFEND_SPF}}` | £19.19 one-time |

Then update `PRICE_MAP` in `checkout.html`:
```js
var PRICE_MAP = {
  'numb-spray':   'price_xxxxxxxxxxxxxxxxxxxxxx',  // real ID here
  'glow-foam':    'price_xxxxxxxxxxxxxxxxxxxxxx',
  // ... etc
};
```

---

### 3. Stripe `line_items` fallback

**Files:** [`api/create-checkout-session.js`](api/create-checkout-session.js), [`server.js`](server.js)

The fallback `{{ PRICE_ID }}` in the `line_items` array (used when no cart items are sent) should be replaced with a real default Price ID, or removed entirely once `PRICE_MAP` is set up in the frontend.

---

## 🚀 Setup Steps

### Step 1 — Install dependencies
```bash
cd kong-website
npm install
```

### Step 2 — Create your `.env` file
```bash
cp .env.example .env
# Then edit .env with your real keys
```

### Step 3 — Set environment variables in Vercel
Go to: [vercel.com](https://vercel.com) → Your project → Settings → Environment Variables

Add:
- `STRIPE_SECRET_KEY` → your live secret key
- `STRIPE_WEBHOOK_SECRET` → from Stripe Dashboard webhooks
- `DOMAIN` → your Vercel deployment URL

> The publishable key goes directly in `checkout.html` (it is safe client-side).

### Step 4 — Register the webhook in Stripe
1. Go to [dashboard.stripe.com/workbench/webhooks](https://dashboard.stripe.com/workbench/webhooks)
2. Add endpoint: `https://yourdomain.vercel.app/api/webhook`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

### Step 5 — Local testing with Stripe CLI
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:4242/api/webhook

# In another terminal:
npm run dev
# Open http://localhost:4242/checkout.html
```

### Step 6 — Test card numbers
| Card | Number | Use for |
|------|--------|---------|
| Visa (success) | `4242 4242 4242 4242` | Successful payment |
| Declined | `4000 0000 0000 0002` | Test decline handling |
| 3D Secure | `4000 0025 0000 3155` | Test authentication |

Use any future expiry date, any 3-digit CVC, any postcode.

---

## 📁 New Files Created

```
kong-website/
├── api/
│   ├── create-checkout-session.js  ← Serverless function: creates Stripe session
│   └── webhook.js                  ← Serverless function: handles Stripe events
├── server.js                       ← Local dev Express server (mirrors /api/)
├── checkout.html                   ← Checkout page with Stripe Embedded Form
├── checkout-success.html           ← Post-payment confirmation page
├── .env.example                    ← Environment variable template
├── vercel.json                     ← Updated with /api/* serverless routes
├── package.json                    ← Updated with stripe + express dependencies
└── STRIPE_INTEGRATION_TODO.md      ← This file
```

---

## 🔄 How the Payment Flow Works

```
Customer clicks "Checkout" in cart
        ↓
checkout.html loads — reads cart from localStorage
        ↓
POST /api/create-checkout-session  (sends cart item Price IDs)
        ↓
Server creates Stripe Checkout Session → returns client_secret
        ↓
Stripe Embedded Form SDK mounts inside #checkout-form
        ↓
Customer enters card details in the Stripe iframe (PCI-compliant)
        ↓
Customer clicks Pay → form.on('confirm') fires
        ↓
Stripe processes payment → redirects to /checkout-success.html?session_id=...
        ↓
Stripe sends webhook → POST /api/webhook → fulfil order
```

---

## 📚 Resources

- Stripe Dashboard: [dashboard.stripe.com](https://dashboard.stripe.com)
- Stripe Docs: [docs.stripe.com](https://docs.stripe.com)
- Embedded Checkout: [docs.stripe.com/payments/checkout/custom-form](https://docs.stripe.com/payments/checkout/custom-form)
- Stripe Support: [support.stripe.com](https://support.stripe.com)
- Stripe MCP Docs: [docs.stripe.com/mcp](https://docs.stripe.com/mcp)
