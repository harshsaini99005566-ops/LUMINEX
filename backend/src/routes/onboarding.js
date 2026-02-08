const express = require('express');
const { enforceSubscription } = require('../middleware/subscriptionEnforce');

const router = express.Router();

// Example: complete onboarding step
router.post('/complete', enforceSubscription, async (req, res, next) => {
  try {

    // Example onboarding completion logic goes here
    res.json({ message: 'Onboarding completed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
