const Stripe = require('stripe');
const logger = require('../../utils/logger');
const { config } = require('../config/env');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const stripe = new Stripe(config.stripe.secretKey);

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      instagramAccounts: 1,
      automationRules: 5,
      aiReplies: 100,
      monthlyMessages: 1000,
    },
  },
  starter: {
    name: 'Starter',
    price: 29,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    limits: {
      instagramAccounts: 3,
      automationRules: 25,
      aiReplies: 2000,
      monthlyMessages: 10000,
    },
  },
  pro: {
    name: 'Pro',
    price: 99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      instagramAccounts: 10,
      automationRules: 100,
      aiReplies: 20000,
      monthlyMessages: 100000,
    },
  },
  agency: {
    name: 'Agency',
    price: 299,
    stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID,
    limits: {
      instagramAccounts: 50,
      automationRules: 500,
      aiReplies: 200000,
      monthlyMessages: 1000000,
    },
  },
};

const createCheckoutSession = async (userId, planKey) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[planKey];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: userId.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${config.frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/billing`,
      metadata: {
        userId: userId.toString(),
        plan: planKey,
      },
    });

    logger.info(`Checkout session created for user ${userId}`);
    return session;
  } catch (error) {
    logger.error('Checkout session error', error);
    throw error;
  }
};

const handleStripeWebhook = async (event) => {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    logger.error('Webhook handling error', error);
    throw error;
  }
};

const handleSubscriptionUpdate = async (subscription) => {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const items = subscription.items.data[0];
    const plan = Object.keys(PLANS).find(
      (key) => PLANS[key].stripePriceId === items.price.id
    );

    if (!plan) return;

    const user = await User.findById(userId);
    user.plan = plan;
    user.stripeSubscriptionId = subscription.id;
    user.limits = PLANS[plan].limits;

    // Subscription status
    user.subscriptionStatus = subscription.status || 'active';

    if (subscription.trial_end) {
      user.trialEndsAt = new Date(subscription.trial_end * 1000);
    }

    await user.save();

    await Subscription.findOneAndUpdate(
      { user: userId },
      {
        plan,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        isOnTrial: subscription.trial_end > Date.now() / 1000,
      },
      { upsert: true }
    );

    logger.info(`Subscription updated for user ${userId}: ${plan}`);
  } catch (error) {
    logger.error('Error updating subscription', error);
  }
};

const handleSubscriptionCanceled = async (subscription) => {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const user = await User.findById(userId);
    user.plan = 'free';
    user.limits = PLANS.free.limits;
    user.subscriptionStatus = 'canceled';
    await user.save();

    await Subscription.findOneAndUpdate(
      { user: userId },
      {
        plan: 'free',
        status: 'canceled',
        canceledAt: new Date(),
      }
    );

    logger.info(`Subscription canceled for user ${userId}`);
  } catch (error) {
    logger.error('Error canceling subscription', error);
  }
};

const handlePaymentSucceeded = async (invoice) => {
  logger.info(`Payment succeeded for customer ${invoice.customer}`);
  // Send receipt email, update invoice status, etc.
};

const handlePaymentFailed = async (invoice) => {
  logger.warn(`Payment failed for customer ${invoice.customer}`);
  // Notify user of payment failure
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  if (user) {
    // TODO: Send payment failure email notification
  }
};

const getPlanLimits = (plan) => {
  return PLANS[plan]?.limits || PLANS.free.limits;
};

const getAllPlans = () => {
  return PLANS;
};

// Upgrade/downgrade subscription
const upgradeSubscription = async (userId, newPlan) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeSubscriptionId) {
      throw new Error('User not found or has no active subscription');
    }

    if (!PLANS[newPlan]) {
      throw new Error('Invalid plan');
    }

    // Get current subscription
    const currentSubscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    if (!currentSubscription) {
      throw new Error('Subscription not found');
    }

    const currentItem = currentSubscription.items.data[0];
    const newPlanPrice = PLANS[newPlan].stripePriceId;

    // If same price, no change needed
    if (currentItem.price.id === newPlanPrice) {
      throw new Error('Plan is already selected');
    }

    // Update subscription with new plan
    const updated = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        items: [
          {
            id: currentItem.id,
            price: newPlanPrice,
          },
        ],
        // Prorate charges immediately
        proration_behavior: 'create_prorations',
      }
    );

    logger.info(`Subscription upgraded for user ${userId} to ${newPlan}`);
    return updated;
  } catch (error) {
    logger.error('Upgrade subscription error', error);
    throw error;
  }
};

// Get subscription details
const getSubscriptionDetails = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.stripeSubscriptionId) {
      return {
        hasSubscription: false,
        plan: 'free',
        limits: PLANS.free.limits,
      };
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    const priceId = subscription.items.data[0].price.id;
    const plan = Object.keys(PLANS).find(
      (key) => PLANS[key].stripePriceId === priceId
    );

    return {
      hasSubscription: true,
      plan: plan || 'free',
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      isOnTrial: subscription.status === 'trialing',
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      limits: PLANS[plan]?.limits || PLANS.free.limits,
    };
  } catch (error) {
    logger.error('Get subscription details error', error);
    throw error;
  }
};

// Cancel subscription at period end
const cancelSubscriptionAtPeriodEnd = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeSubscriptionId) {
      throw new Error('User not found or has no active subscription');
    }

    const updated = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    logger.info(`Subscription scheduled for cancellation for user ${userId}`);
    return updated;
  } catch (error) {
    logger.error('Cancel subscription at period end error', error);
    throw error;
  }
};

// Immediately cancel subscription
const cancelSubscriptionImmediate = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeSubscriptionId) {
      throw new Error('User not found or has no active subscription');
    }

    await stripe.subscriptions.del(user.stripeSubscriptionId);

    // Update user
    user.plan = 'free';
    user.stripeSubscriptionId = null;
    user.subscriptionStatus = 'canceled';
    user.limits = PLANS.free.limits;
    await user.save();

    logger.info(`Subscription immediately canceled for user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error('Immediate cancel subscription error', error);
    throw error;
  }
};

// Start free trial
const startFreeTrial = async (userId, trialDays = 14) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: userId.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
    }

    // Create subscription with trial period
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: PLANS.pro.stripePriceId, // Default to Pro for trial
        },
      ],
      trial_period_days: trialDays,
      metadata: {
        userId: userId.toString(),
        plan: 'pro',
      },
    });

    // Update user
    user.plan = 'pro';
    user.stripeSubscriptionId = subscription.id;
    user.subscriptionStatus = 'trialing';
    user.limits = PLANS.pro.limits;
    user.trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    await user.save();

    logger.info(`Free trial started for user ${userId}`);
    return subscription;
  } catch (error) {
    logger.error('Start free trial error', error);
    throw error;
  }
};

// Get invoices for user
const getUserInvoices = async (userId, limit = 12) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return [];
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      date: new Date(invoice.created * 1000),
      status: invoice.status,
      pdfUrl: invoice.invoice_pdf,
      paid: invoice.paid,
    }));
  } catch (error) {
    logger.error('Get invoices error', error);
    throw error;
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  getPlanLimits,
  getAllPlans,
  upgradeSubscription,
  getSubscriptionDetails,
  cancelSubscriptionAtPeriodEnd,
  cancelSubscriptionImmediate,
  startFreeTrial,
  getUserInvoices,
};
