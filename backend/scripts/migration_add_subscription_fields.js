#!/usr/bin/env node
/**
 * One-time migration: add subscription fields and usage defaults to existing users
 * - Sets subscriptionStatus = 'trial' when missing
 * - Sets trialEndsAt = now + 7 days when missing
 * - Sets usage.messagesSent = 0 when missing
 * - Sets usage.rulesCreated = count of existing rules or 0 when missing
 *
 * Safe to run multiple times (will not overwrite existing values).
 */

require('dotenv').config();
const connectDB = require('../config/database');
const logger = require('../utils/logger');
const User = require('../src/models/User');
const AutomationRule = require('../src/models/AutomationRule');

async function run() {
  await connectDB();

  logger.info('Starting migration: add subscription fields to users');

  const query = {
    $or: [
      { subscriptionStatus: { $exists: false } },
      { trialEndsAt: { $exists: false } },
      { 'usage.messagesSent': { $exists: false } },
      { 'usage.rulesCreated': { $exists: false } },
    ],
  };

  const users = await User.find(query).lean();
  logger.info(`Found ${users.length} user(s) to migrate`);

  let updated = 0;
  for (const u of users) {
    try {
      const user = await User.findById(u._id);
      let changed = false;

      if (!user.subscriptionStatus) {
        user.subscriptionStatus = 'trial';
        changed = true;
      }

      if (!user.trialEndsAt) {
        user.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        changed = true;
      }

      if (user.usage === undefined || user.usage === null) {
        user.usage = {};
        changed = true;
      }

      if (user.usage.messagesSent === undefined) {
        // Backfill from messagesThisMonth if present
        user.usage.messagesSent = user.usage.messagesThisMonth || 0;
        changed = true;
      }

      if (user.usage.rulesCreated === undefined) {
        const ruleCount = await AutomationRule.countDocuments({ user: user._id });
        user.usage.rulesCreated = ruleCount || user.usage.rulesUsed || 0;
        changed = true;
      }

      if (changed) {
        await user.save();
        updated++;
        logger.info(`Migrated user ${user._id}`);
      }
    } catch (err) {
      logger.error(`Error migrating user ${u._id}`, err);
    }
  }

  logger.info(`Migration complete. Users updated: ${updated}`);

  process.exit(0);
}

run().catch((err) => {
  logger.error('Migration failed', err);
  process.exit(1);
});
