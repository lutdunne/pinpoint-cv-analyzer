# Payment Setup Instructions

## 1. Install Stripe
```bash
npm install stripe
```

## 2. Get Stripe Keys
1. Go to https://dashboard.stripe.com/register
2. Get your API keys from https://dashboard.stripe.com/test/apikeys
3. Add them to your .env file:

```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 3. Setup Stripe Webhook (for production)
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.com/api/webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook secret to STRIPE_WEBHOOK_SECRET

## 4. Test Webhook Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook
```

## 5. Run Database Migration
```bash
cd app
npx prisma migrate dev --name add_payment_fields
```

## 6. Test Cards
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Any future expiry date and CVC

## Implementation Details

### Free Preview (First Scan)
- Score + summary ✅
- First 2 strengths
- First 2 improvements  
- First 2 action items

### Locked Behind Payment (£7.99)
- Full strengths list
- Full improvements list
- Full action plan
- ATS optimization tips
- Missing keywords analysis
- Interview questions

### Psychology
✅ User sees their score (creates urgency)
✅ "You're missing 6 key skills" (FOMO)
✅ Blurred preview of locked content
✅ One-time payment, no subscription
✅ Limited time 47% OFF badge
✅ Clear value proposition

### Conversion Flow
1. User uploads CV (free)
2. Gets score + 2 items per section
3. Sees "Unlock All X items" buttons
4. Clicks → Payment modal
5. Pays £7.99 → Stripe checkout
6. Returns → Full report unlocked
