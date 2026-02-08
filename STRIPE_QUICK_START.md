# 🚀 Stripe Subscription Billing - Quick Setup Guide

## 5-Minute Setup

### Step 1: Stripe Account
1. Create account: https://stripe.com
2. Go to Developers > API Keys
3. Copy Secret Key: `sk_test_...`
4. Create webhook: Settings > Webhooks
   - URL: `https://yourdomain.com/api/billing/webhook`
   - Events: `customer.subscription.*`, `invoice.payment_*`

### Step 2: Create Products & Prices

Go to Products section and create:

**Starter Plan**
- Amount: $29
- Billing: Monthly
- Copy Price ID

**Pro Plan**
- Amount: $99
- Billing: Monthly
- Copy Price ID

**Agency Plan**
- Amount: $299
- Billing: Monthly
- Copy Price ID

### Step 3: Environment Variables

```bash
# .env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_AGENCY_PRICE_ID=price_xxxxx
```

### Step 4: Test Integration

```bash
# Backend
npm run dev

# Frontend  
npm run dev

# Test payment
# Card: 4242 4242 4242 4242
# Expiry: Any future date
# CVC: Any 3 digits
```

---

## Features Implemented

### ✅ Plans
- Free, Starter, Pro, Agency
- Tiered feature access
- Usage limits per plan

### ✅ Trial Period
- 14-day free Pro trial
- Auto-convert to paid
- No card required to start

### ✅ Usage Limits
- Instagram accounts
- Automation rules
- AI replies
- Monthly messages

### ✅ Webhooks
- Subscription created/updated
- Payment succeeded/failed
- Auto-update user subscription

### ✅ Upgrade/Downgrade
- Mid-cycle plan changes
- Automatic proration
- Instant access

### ✅ Cancellation
- Cancel immediately
- Cancel at period end
- Grace period option

### ✅ Secure Payments
- PCI compliant via Stripe
- Tokenized payments
- Encrypted secrets

---

## API Endpoints

### Public
- `GET /api/billing/plans` - List plans
- `POST /api/billing/webhook` - Stripe events

### Authenticated
- `POST /api/billing/checkout` - Start payment
- `GET /api/billing/subscription` - Current plan
- `GET /api/billing/usage` - Usage stats
- `GET /api/billing/quota` - Monthly quota
- `POST /api/billing/upgrade` - Upgrade plan
- `POST /api/billing/downgrade` - Downgrade plan
- `POST /api/billing/trial/start` - Start trial
- `POST /api/billing/cancel` - Cancel now
- `POST /api/billing/cancel-at-period-end` - Cancel later
- `GET /api/billing/invoices` - Invoice history
- `POST /api/billing/portal` - Stripe portal

---

## Frontend Components

### Billing Component
Located at: `frontend/components/Billing.tsx`

Features:
- 4 plan cards with features
- Usage dashboard with progress bars
- Invoice history table
- Payment method management
- Cancel subscription modal

### Tabs
1. **Plans** - View/change plans
2. **Usage** - Resource usage
3. **Invoices** - Billing history
4. **Payment** - Payment methods

---

## Backend Services

### Stripe Service
File: `src/services/stripe.js`

Functions:
- `createCheckoutSession()` - Checkout flow
- `upgradeSubscription()` - Plan upgrade
- `cancelSubscriptionImmediate()` - Cancel now
- `cancelSubscriptionAtPeriodEnd()` - Cancel later
- `startFreeTrial()` - 14-day trial
- `getSubscriptionDetails()` - Get status
- `getUserInvoices()` - Billing history

### Usage Tracking Service
File: `src/services/usageTracking.js`

Functions:
- `checkUsageLimit()` - Verify quota
- `incrementUsage()` - Track usage
- `getUsageReport()` - Usage dashboard
- `resetMonthlyUsage()` - Monthly reset
- `getRemainingQuota()` - Quota left

### Middleware
File: `src/middleware/usageLimits.js`

Protections:
- `checkInstagramAccountLimit` - Account limit
- `checkAutomationRuleLimit` - Rule limit
- `checkAIReplyLimit` - AI limit
- `checkMonthlyMessageLimit` - Message limit
- `checkPaidPlan` - Paid-only features
- `checkMinimumPlan(plan)` - Minimum tier

---

## Usage Tracking

### Limit Types
```javascript
{
  instagramAccounts: 1-50,
  automationRules: 5-500,
  aiReplies: 100-200000,
  monthlyMessages: 1000-1000000
}
```

### Check Before Action
```javascript
const { canUse } = await checkUsageLimit(userId, 'monthlyMessages');
if (!canUse) {
  return res.status(403).json({ error: 'Limit reached' });
}
```

### Track Usage
```javascript
await incrementUsage(userId, 'monthlyMessages', 1);
```

### Apply Middleware
```javascript
router.post('/messages/send',
  auth,
  checkMonthlyMessageLimit,
  handler
);
```

---

## Testing Checklist

- [ ] Create free account (no card)
- [ ] View plans on billing page
- [ ] Start 14-day trial
- [ ] See usage limits
- [ ] Try upgrade (test card 4242...)
- [ ] Check subscription status
- [ ] View invoices
- [ ] Update payment method
- [ ] Cancel subscription
- [ ] Downgrade plan

---

## Production Checklist

- [ ] Use live Stripe keys
- [ ] Set WEBHOOK_URL to production
- [ ] Enable HTTPS everywhere
- [ ] Test payment with real card
- [ ] Set up email notifications
- [ ] Monitor Stripe logs
- [ ] Configure analytics
- [ ] Set up alerts for failures
- [ ] Document billing process
- [ ] Train support team

---

## Webhook Verification (Production)

Your webhook is automatically verified. Stripe signature checking is enabled:

```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

Test with Stripe CLI:
```bash
stripe listen --forward-to localhost:5001/api/billing/webhook
stripe trigger charge.succeeded
```

---

## Common Issues

### "Price ID not found"
- Verify STRIPE_*_PRICE_ID in .env
- Confirm prices exist in Stripe
- Check correct environment (test/live)

### "Webhook not received"
- Ensure webhook URL is accessible
- Check STRIPE_WEBHOOK_SECRET correct
- Verify event types selected
- Check application logs

### "Usage limits not working"
- Verify middleware added to routes
- Check incrementUsage called
- Verify User model fields exist
- Check database connection

### "Payment fails"
- Use test card 4242 4242 4242 4242
- Verify STRIPE_SECRET_KEY
- Check webhook handling
- Review Stripe logs

---

## Support Resources

1. **Stripe Docs:** https://stripe.com/docs
2. **Stripe API Reference:** https://stripe.com/docs/api
3. **Stripe CLI:** https://stripe.com/docs/stripe-cli
4. **Test Cards:** https://stripe.com/docs/testing

---

## Next Steps

1. Complete Stripe setup
2. Test payment flow
3. Customize plans
4. Deploy to production
5. Monitor subscription metrics
6. Gather customer feedback

---

**Version:** 1.0.0  
**Last Updated:** January 27, 2026  
**Status:** ✅ Production Ready
