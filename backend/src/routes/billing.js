const express = require('express');
const Stripe = require('stripe');
const {
  createCheckoutSession,
  handleStripeWebhook,
  getAllPlans,
  upgradeSubscription,
  getSubscriptionDetails,
  cancelSubscriptionAtPeriodEnd,
  cancelSubscriptionImmediate,
  startFreeTrial,
} = require('../services/stripe');
const { getUsageReport, getRemainingQuota } = require('../services/usageTracking');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get available plans
router.get('/plans', (req, res) => {
  const plans = getAllPlans();
  res.json({ plans });
});

// Create checkout session
router.post('/checkout', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan required' });
    }

    const session = await createCheckoutSession(userId, plan);
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Get subscription status
router.get('/subscription', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ user: userId });
    const user = await User.findById(userId);

    res.json({
      subscription: subscription || null,
      plan: user.plan,
      limits: user.limits,
      usage: user.usage,
      trialEndsAt: user.trialEndsAt,
      canUpgrade: user.plan !== 'agency',
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription details (enhanced)
router.get('/subscription/details', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const details = await getSubscriptionDetails(userId);
    res.json(details);
  } catch (error) {
    next(error);
  }
});

// Get usage report
router.get('/usage', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const report = await getUsageReport(userId);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Get remaining quota
router.get('/quota', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const quota = await getRemainingQuota(userId);
    res.json(quota);
  } catch (error) {
    next(error);
  }
});

// Get billing history
router.get('/invoices', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 12
    });

    res.json({
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        date: new Date(invoice.created * 1000),
        status: invoice.status,
        pdfUrl: invoice.invoice_pdf
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Update billing email
router.put('/billing-email', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { billingEmail: email },
      { new: true }
    );

    res.json({ message: 'Billing email updated', user });
  } catch (error) {
    next(error);
  }
});

// Get payment method
router.get('/payment-method', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.stripeCustomerId) {
      return res.json({ paymentMethod: null });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    const defaultPaymentMethod = paymentMethods.data[0] || null;

    res.json({
      paymentMethod: defaultPaymentMethod
        ? {
            id: defaultPaymentMethod.id,
            brand: defaultPaymentMethod.card.brand,
            last4: defaultPaymentMethod.card.last4,
            expMonth: defaultPaymentMethod.card.exp_month,
            expYear: defaultPaymentMethod.card.exp_year,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

// Update payment method
router.post('/payment-method/update', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID required' });
    }

    const user = await User.findById(userId);

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // Set as default
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({ message: 'Payment method updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Create billing portal session
router.post('/portal', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.stripeCustomerId) {
      return res
        .status(400)
        .json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook handler (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Upgrade subscription
router.post('/upgrade', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan required' });
    }

    const updated = await upgradeSubscription(userId, plan);
    res.json({
      message: 'Subscription upgraded successfully',
      subscription: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Downgrade subscription
router.post('/downgrade', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan required' });
    }

    const user = await User.findById(userId);
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Downgrading uses the same function as upgrading
    const updated = await upgradeSubscription(userId, plan);
    res.json({
      message: 'Subscription downgraded successfully',
      subscription: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Start free trial
router.post('/trial/start', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { trialDays = 14 } = req.body;

    const user = await User.findById(userId);
    if (user.plan !== 'free') {
      return res
        .status(400)
        .json({ error: 'Trial only available for free plan users' });
    }

    const subscription = await startFreeTrial(userId, trialDays);
    res.json({
      message: 'Free trial started',
      subscription,
      trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription at period end
router.post('/cancel-at-period-end', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updated = await cancelSubscriptionAtPeriodEnd(userId);
    res.json({
      message: 'Subscription scheduled for cancellation at period end',
      subscription: updated,
    });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription immediately
router.post('/cancel', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await cancelSubscriptionImmediate(userId);
    res.json({ message: 'Subscription canceled immediately', ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
