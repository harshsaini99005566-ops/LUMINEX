# Stripe Subscription Billing Implementation

## Overview

Comprehensive subscription billing system with Stripe integration, featuring:
- Multiple tiered plans (Free, Starter, Pro, Agency)
- Free trial periods (14 days)
- Usage tracking and limits enforcement
- Upgrade/downgrade functionality
- Payment method management
- Invoice management
- Webhook handling for events
- Secure payment processing

---

## Environment Variables

Add these to your `.env` file:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_xxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxx
STRIPE_AGENCY_PRICE_ID=price_xxxxxx

# Webhook URL (for Stripe webhook configuration)
WEBHOOK_URL=https://yourdomain.com/api/billing/webhook
```

---

## Plans & Pricing

### Free Plan
- **Price:** $0/month
- **Instagram Accounts:** 1
- **Automation Rules:** 5
- **AI Replies:** 100
- **Monthly Messages:** 1,000

### Starter Plan
- **Price:** $29/month
- **Instagram Accounts:** 3
- **Automation Rules:** 25
- **AI Replies:** 2,000
- **Monthly Messages:** 10,000

### Pro Plan
- **Price:** $99/month
- **Instagram Accounts:** 10
- **Automation Rules:** 100
- **AI Replies:** 20,000
- **Monthly Messages:** 100,000
- **14-day Free Trial Available**

### Agency Plan
- **Price:** $299/month
- **Instagram Accounts:** 50
- **Automation Rules:** 500
- **AI Replies:** 200,000
- **Monthly Messages:** 1,000,000

---

## Backend Services

### Stripe Service (`src/services/stripe.js`)

#### Functions:

**`createCheckoutSession(userId, planKey)`**
- Creates a Stripe checkout session
- Returns checkout URL
- Sets up customer if new

**`upgradeSubscription(userId, newPlan)`**
- Upgrade or downgrade plan
- Handles proration
- Updates user limits

**`getSubscriptionDetails(userId)`**
- Get complete subscription info
- Trial status
- Billing cycle dates

**`cancelSubscriptionAtPeriodEnd(userId)`**
- Schedule cancellation
- Customer keeps access until period end
- Grace period for upsells

**`cancelSubscriptionImmediate(userId)`**
- Immediate cancellation
- Access revoked instantly
- User downgraded to free plan

**`startFreeTrial(userId, trialDays)`**
- Start 14-day free trial
- User gets Pro features
- Stripe handles trial period

**`getUserInvoices(userId, limit)`**
- Fetch invoice history
- Returns formatted invoice data
- PDF URLs included

#### Webhook Events Handled:

- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Plan change
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

---

### Usage Tracking Service (`src/services/usageTracking.js`)

#### Functions:

**`checkUsageLimit(userId, limitType)`**
- Check if user can perform action
- Returns: canUse, current, limit, remaining, percentage

**`incrementUsage(userId, usageType, amount)`**
- Track usage increments
- Called when user creates rule, sends message, etc.

**`resetMonthlyUsage(userId)`**
- Reset monthly message count
- Automatically called on 1st of month

**`getUsageReport(userId)`**
- Comprehensive usage dashboard
- Includes warnings for high usage (80%+)

**`enforceUsageLimits(userId, limitType)`**
- Throws error if limit exceeded
- Used in middleware

**`getRemainingQuota(userId)`**
- Days until reset
- Messages remaining

---

### Usage Limit Middleware (`src/middleware/usageLimits.js`)

#### Middleware Functions:

**`checkInstagramAccountLimit`**
- Prevents adding accounts beyond limit
- Returns 403 if exceeded

**`checkAutomationRuleLimit`**
- Prevents creating rules beyond limit

**`checkAIReplyLimit`**
- Prevents using AI beyond limit

**`checkMonthlyMessageLimit`**
- Prevents sending messages beyond monthly limit
- Warns at 80% usage

**`checkPaidPlan`**
- Feature only for paid plans

**`checkMinimumPlan(plan)`**
- Feature requires minimum plan level

#### Usage Example:

```javascript
const { checkMonthlyMessageLimit } = require('../middleware/usageLimits');

// In your route
router.post('/messages/send', 
  authenticateToken,
  checkMonthlyMessageLimit,
  async (req, res) => {
    // Send message...
  }
);
```

---

## API Endpoints

### Billing Routes (`/api/billing`)

**GET /plans**
- Get all available plans

**POST /checkout**
- Create checkout session
- Body: `{ plan: "starter" }`

**GET /subscription**
- Get current subscription status

**GET /subscription/details**
- Detailed subscription information

**GET /usage**
- Get usage report

**GET /quota**
- Get remaining quota for month

**POST /upgrade**
- Upgrade subscription
- Body: `{ plan: "pro" }`

**POST /downgrade**
- Downgrade subscription
- Body: `{ plan: "starter" }`

**POST /trial/start**
- Start 14-day free trial
- Body: `{ trialDays: 14 }`

**POST /cancel**
- Immediately cancel subscription

**POST /cancel-at-period-end**
- Schedule cancellation

**GET /invoices**
- Get billing history

**GET /payment-method**
- Get current payment method

**POST /payment-method/update**
- Update payment method
- Body: `{ paymentMethodId: "pm_xxx" }`

**POST /portal**
- Create Stripe billing portal session

**POST /webhook** (no auth)
- Stripe webhook receiver

---

## Frontend Components

### Billing Component (`frontend/components/Billing.tsx`)

Features:
- Plan selection with upgrade/downgrade
- Free trial activation
- Usage tracking dashboard
- Invoice history
- Payment method management
- Subscription cancellation

Tabs:
1. **Plans** - View and manage plans
2. **Usage** - Track resource usage
3. **Invoices** - Billing history
4. **Payment** - Payment methods

---

## Security Features

### 1. Webhook Verification
```javascript
const event = stripe.webhooks.constructEvent(
  req.body,
  signature,
  webhookSecret
);
```

### 2. Metadata Validation
- User IDs stored in Stripe metadata
- Verified on webhook events

### 3. Rate Limiting
- Usage limits prevent abuse
- Enforced at middleware level

### 4. Secure Payment Flow
- PCI compliance via Stripe
- No sensitive data stored
- Tokenized payment methods

### 5. Encrypted Secrets
- Secret keys in environment variables
- Never committed to repo

---

## Setup Instructions

### 1. Stripe Account Setup

1. Create account at stripe.com
2. Go to Developers > API Keys
3. Copy Secret Key and Publishable Key
4. Create webhook endpoint:
   - URL: `https://yourdomain.com/api/billing/webhook`
   - Events: subscription.*, invoice.*

### 2. Create Price IDs

1. Go to Stripe Dashboard
2. Create products for each plan
3. Create prices for each product
4. Copy price IDs

### 3. Environment Configuration

```bash
# .env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_AGENCY_PRICE_ID=price_xxxxx
```

### 4. Database Setup

Subscription and usage tracking use existing User and Subscription models.

### 5. Middleware Integration

```javascript
const { checkMonthlyMessageLimit } = require('./middleware/usageLimits');

// Protect routes
app.post('/messages/send', 
  auth,
  checkMonthlyMessageLimit,
  handler
);
```

---

## Usage Examples

### Frontend - Upgrade Plan

```typescript
const handleUpgrade = async (plan: string) => {
  const response = await axios.post(`${API_URL}/api/billing/checkout`, {
    plan,
  });
  
  window.location.href = response.data.url; // Redirect to Stripe
};
```

### Frontend - Check Usage

```typescript
const getUsageReport = async () => {
  const response = await axios.get(`${API_URL}/api/billing/usage`);
  console.log(response.data.percentages);
  // { accountsUsed: 50, rulesUsed: 75, ... }
};
```

### Backend - Increment Usage

```javascript
const { incrementUsage } = require('./services/usageTracking');

// When user sends message
await incrementUsage(userId, 'monthlyMessages', 1);
```

### Backend - Enforce Limits

```javascript
const { checkMonthlyMessageLimit } = require('./middleware/usageLimits');

router.post('/messages/send',
  auth,
  checkMonthlyMessageLimit,
  async (req, res) => {
    // Send message
  }
);
```

---

## Testing

### Stripe Test Cards

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Require 3D:** 4000 0025 0000 3155

Use any future expiry date and any CVC.

### Webhook Testing

```bash
# Using Stripe CLI
stripe listen --forward-to localhost:5001/api/billing/webhook

# In another terminal
stripe trigger charge.succeeded
```

### Test Subscription Flow

1. Visit `/billing`
2. Click "Start 14-Day Trial"
3. Verify trial_period_days in Stripe
4. Check User model for trialEndsAt

---

## Monitoring

### Key Metrics to Track

- Active subscriptions
- MRR (Monthly Recurring Revenue)
- Churn rate
- Plan distribution
- Failed payments
- Usage patterns

### Logs to Check

```javascript
logger.info(`Subscription upgraded for user ${userId} to ${plan}`);
logger.warn(`Payment failed for customer ${customerId}`);
logger.info(`Subscription canceled for user ${userId}`);
```

---

## Troubleshooting

### Issue: "Invalid redirect URI"
- Verify FRONTEND_URL matches Stripe settings
- No trailing slash

### Issue: "Webhook not received"
- Check webhook URL is publicly accessible
- Verify signature secret in .env
- Check Stripe logs

### Issue: "Subscription not updating"
- Verify metadata.userId in Stripe
- Check webhook event logs
- Ensure User model fields exist

### Issue: "Usage limits not enforcing"
- Verify middleware is applied to route
- Check incrementUsage is being called
- Verify user.limits in database

---

## Future Enhancements

1. **Promo Codes** - Discount code system
2. **Annual Billing** - Yearly payment option
3. **Metered Billing** - Usage-based pricing
4. **Team Seats** - Per-seat billing
5. **Invoice Customization** - Custom company info
6. **Email Notifications** - Payment receipts
7. **Dunning Management** - Retry failed payments
8. **Analytics** - Revenue dashboard

---

## Support

For issues or questions:
1. Check Stripe Dashboard logs
2. Review webhook events
3. Check application logs
4. Verify environment variables
5. Test with Stripe CLI

---

**Last Updated:** January 27, 2026
**Version:** 1.0.0
