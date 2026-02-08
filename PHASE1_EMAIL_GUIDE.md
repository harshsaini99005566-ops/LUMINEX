# 📧 PHASE 1: EMAIL NOTIFICATIONS GUIDE
## Complete Implementation (Day 4)

---

## 1. SETUP

### Install Dependencies
```bash
cd backend
npm install nodemailer @sendgrid/mail dotenv
```

### Add to .env
```env
# Email Service
SENDGRID_API_KEY=SG.your_api_key_here
SENDER_EMAIL=noreply@autodm.app
SENDER_NAME=AutoDM

# Alternatives (if not using SendGrid):
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
```

---

## 2. SENDGRID SETUP (FREE TIER)

### Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for free account
3. Verify email address
4. Create API key:
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name: "AutoDM Backend"
   - Select "Restricted Access"
   - Enable: "Mail Send"
   - Save key to .env file

### Sender Email Setup
1. Dashboard → Sender Authentication
2. Click "Verify a Single Sender"
3. Add: noreply@autodm.app
4. Check email, click verification link

---

## 3. EMAIL SERVICE

### Email Service Implementation
```javascript
// backend/src/services/email.js
import sgMail from '@sendgrid/mail'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Helper to read template files
function getTemplate(name) {
  const templatePath = path.join(__dirname, `../templates/${name}.html`)
  return fs.readFileSync(templatePath, 'utf-8')
}

export const emailService = {
  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, firstName) {
    try {
      console.log('[Email] Sending welcome email to:', email)

      const template = getTemplate('welcome')
      const html = template
        .replace('{{firstName}}', firstName)
        .replace('{{dashboardUrl}}', `${process.env.FRONTEND_URL}/dashboard`)
        .replace('{{setupGuideUrl}}', `${process.env.FRONTEND_URL}/docs/setup`)

      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
        },
        subject: '🚀 Welcome to AutoDM!',
        html,
      })

      console.log('[Email] Welcome email sent successfully')
      return true
    } catch (error) {
      console.error('[Email] Error sending welcome email:', error)
      return false
    }
  },

  /**
   * Send rule triggered notification
   */
  async sendRuleTriggeredEmail(email, ruleName, matchCount) {
    try {
      console.log('[Email] Sending rule triggered email to:', email)

      const template = getTemplate('ruleTriggered')
      const html = template
        .replace('{{ruleName}}', ruleName)
        .replace('{{matchCount}}', matchCount)
        .replace('{{dashboardUrl}}', `${process.env.FRONTEND_URL}/dashboard/rules`)

      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
        },
        subject: `🔥 Your "${ruleName}" rule matched ${matchCount} messages!`,
        html,
      })

      console.log('[Email] Rule triggered email sent successfully')
      return true
    } catch (error) {
      console.error('[Email] Error sending rule triggered email:', error)
      return false
    }
  },

  /**
   * Send daily digest
   */
  async sendDailyDigestEmail(email, firstName, stats) {
    try {
      console.log('[Email] Sending daily digest to:', email)

      const template = getTemplate('dailyDigest')
      const html = template
        .replace('{{firstName}}', firstName)
        .replace('{{messagesSent}}', stats.messagesSent || 0)
        .replace('{{rulesMatched}}', stats.rulesMatched || 0)
        .replace('{{aiReplies}}', stats.aiRepliesSent || 0)
        .replace('{{successRate}}', (stats.successRate || 0).toFixed(1))
        .replace('{{dashboardUrl}}', `${process.env.FRONTEND_URL}/dashboard/analytics`)

      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
        },
        subject: '📊 Your Daily AutoDM Summary',
        html,
      })

      console.log('[Email] Daily digest sent successfully')
      return true
    } catch (error) {
      console.error('[Email] Error sending daily digest:', error)
      return false
    }
  },

  /**
   * Send billing notification
   */
  async sendBillingEmail(email, firstName, plan, renewalDate) {
    try {
      console.log('[Email] Sending billing email to:', email)

      const template = getTemplate('billing')
      const html = template
        .replace('{{firstName}}', firstName)
        .replace('{{plan}}', plan)
        .replace('{{renewalDate}}', new Date(renewalDate).toLocaleDateString())
        .replace('{{billingUrl}}', `${process.env.FRONTEND_URL}/dashboard/billing`)

      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
        },
        subject: `💳 Your ${plan} subscription renews on ${new Date(renewalDate).toLocaleDateString()}`,
        html,
      })

      console.log('[Email] Billing email sent successfully')
      return true
    } catch (error) {
      console.error('[Email] Error sending billing email:', error)
      return false
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    try {
      console.log('[Email] Sending password reset email to:', email)

      const template = getTemplate('passwordReset')
      const html = template
        .replace('{{resetUrl}}', resetUrl)
        .replace('{{expiryTime}}', '1 hour')

      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
        },
        subject: '🔐 Reset your AutoDM password',
        html,
      })

      console.log('[Email] Password reset email sent successfully')
      return true
    } catch (error) {
      console.error('[Email] Error sending password reset email:', error)
      return false
    }
  },

  /**
   * Send error alert
   */
  async sendErrorAlertEmail(email, errorType, errorDetails) {
    try {
      console.log('[Email] Sending error alert to:', email)

      const template = getTemplate('errorAlert')
      const html = template
        .replace('{{errorType}}', errorType)
        .replace('{{errorDetails}}', errorDetails)
        .replace('{{supportUrl}}', `${process.env.FRONTEND_URL}/support`)

      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME,
        },
        subject: `⚠️ AutoDM Alert: ${errorType}`,
        html,
      })

      console.log('[Email] Error alert sent successfully')
      return true
    } catch (error) {
      console.error('[Email] Error sending alert:', error)
      return false
    }
  },
}
```

---

## 4. EMAIL TEMPLATES

### Welcome Email
```html
<!-- backend/src/templates/welcome.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff00; }
    .header { padding: 32px; border-bottom: 1px solid #00ff00; }
    .content { padding: 32px; }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #00ff00;
      color: #0a0a0a;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 16px 0;
    }
    .footer { padding: 32px; border-top: 1px solid #00ff00; color: #00ff00; opacity: 0.7; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ Welcome to AutoDM, {{firstName}}!</h1>
    </div>

    <div class="content">
      <p>Hey {{firstName}},</p>

      <p>Welcome to AutoDM! 🎉</p>

      <p>You're now ready to automate your Instagram DM conversations and save hours every week.</p>

      <h2>Here's what you can do now:</h2>
      <ul>
        <li>✅ Create automation rules</li>
        <li>✅ Connect your Instagram account</li>
        <li>✅ Set up AI-powered auto-replies</li>
        <li>✅ Track your performance with analytics</li>
      </ul>

      <p><strong>Get Started:</strong></p>
      <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>

      <p>Or check out our <a href="{{setupGuideUrl}}">setup guide</a> for step-by-step instructions.</p>

      <p>Questions? Reply to this email or visit our support page.</p>

      <p>Happy automating! 🚀<br>The AutoDM Team</p>
    </div>

    <div class="footer">
      <p>© 2024 AutoDM. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### Rule Triggered Email
```html
<!-- backend/src/templates/ruleTriggered.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff00; }
    .header { padding: 32px; border-bottom: 1px solid #00ff00; }
    .content { padding: 32px; }
    .stat { background: #1a1a1a; padding: 16px; margin: 16px 0; border-left: 4px solid #ff00ff; }
    .button { display: inline-block; padding: 12px 24px; background: #00ff00; color: #0a0a0a; text-decoration: none; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Rule Triggered!</h1>
    </div>

    <div class="content">
      <p>Your "<strong>{{ruleName}}</strong>" rule just matched {{matchCount}} messages!</p>

      <div class="stat">
        <strong>Rule Name:</strong> {{ruleName}}<br>
        <strong>Matches Found:</strong> {{matchCount}}<br>
        <strong>Time:</strong> {{timestamp}}
      </div>

      <p><strong>View Details:</strong></p>
      <a href="{{dashboardUrl}}" class="button">Open Rules Dashboard</a>

      <p>Keep an eye on your best performing rules to optimize your automation strategy.</p>

      <p>The AutoDM Team</p>
    </div>
  </div>
</body>
</html>
```

### Daily Digest Email
```html
<!-- backend/src/templates/dailyDigest.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff00; }
    .header { padding: 32px; border-bottom: 1px solid #00ff00; }
    .stats { padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .stat { background: #1a1a1a; padding: 16px; border-radius: 4px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #00ffff; }
    .stat-label { font-size: 12px; color: #00ff00; opacity: 0.7; }
    .button { display: inline-block; padding: 12px 24px; background: #00ff00; color: #0a0a0a; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Summary for {{firstName}}</h1>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">{{messagesSent}}</div>
        <div class="stat-label">Messages Sent</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{rulesMatched}}</div>
        <div class="stat-label">Rules Matched</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{aiReplies}}</div>
        <div class="stat-label">AI Replies</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{successRate}}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
    </div>

    <div style="padding: 32px; border-top: 1px solid #00ff00;">
      <p>Great job today! You're making progress on your automation goals.</p>

      <a href="{{dashboardUrl}}" class="button">View Full Analytics</a>

      <p>The AutoDM Team</p>
    </div>
  </div>
</body>
</html>
```

### Billing Email
```html
<!-- backend/src/templates/billing.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff00; }
    .warning { background: #332200; padding: 16px; border-left: 4px solid #ff9900; margin: 16px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #00ff00; color: #0a0a0a; text-decoration: none; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div style="padding: 32px; border-bottom: 1px solid #00ff00;">
      <h1>💳 Billing Reminder</h1>
    </div>

    <div style="padding: 32px;">
      <p>Hi {{firstName}},</p>

      <p>Your {{plan}} subscription will renew on <strong>{{renewalDate}}</strong>.</p>

      <div class="warning">
        <strong>Plan Details:</strong><br>
        Plan: {{plan}}<br>
        Renewal Date: {{renewalDate}}<br>
        Status: Active
      </div>

      <p>Your payment method is securely stored. Your subscription will auto-renew.</p>

      <a href="{{billingUrl}}" class="button">Manage Billing</a>

      <p>Questions about your billing? Contact our support team.</p>

      <p>The AutoDM Team</p>
    </div>
  </div>
</body>
</html>
```

### Password Reset Email
```html
<!-- backend/src/templates/passwordReset.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff00; }
    .warning { background: #220000; padding: 16px; border-left: 4px solid #ff0000; margin: 16px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #00ff00; color: #0a0a0a; text-decoration: none; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div style="padding: 32px; border-bottom: 1px solid #00ff00;">
      <h1>🔐 Password Reset Request</h1>
    </div>

    <div style="padding: 32px;">
      <p>We received a request to reset your password.</p>

      <div class="warning">
        <strong>⚠️ Important:</strong> This link expires in {{expiryTime}}.
      </div>

      <p><strong>Click the button below to reset your password:</strong></p>

      <a href="{{resetUrl}}" class="button">Reset Password</a>

      <p>Or copy and paste this link in your browser:<br>
      <code>{{resetUrl}}</code></p>

      <p><strong>Didn't request this?</strong> Ignore this email. Your password won't change until you click the link above.</p>

      <p>The AutoDM Team</p>
    </div>
  </div>
</body>
</html>
```

### Error Alert Email
```html
<!-- backend/src/templates/errorAlert.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff00; }
    .alert { background: #330000; padding: 16px; border-left: 4px solid #ff0000; margin: 16px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #00ff00; color: #0a0a0a; text-decoration: none; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div style="padding: 32px; border-bottom: 1px solid #ff0000;">
      <h1>⚠️ Error Alert</h1>
    </div>

    <div style="padding: 32px;">
      <p>We detected an issue with your AutoDM account:</p>

      <div class="alert">
        <strong>Error Type:</strong> {{errorType}}<br>
        <strong>Details:</strong><br>
        {{errorDetails}}
      </div>

      <p><strong>What you should do:</strong></p>
      <ul>
        <li>Check your account settings</li>
        <li>Verify your Instagram connection</li>
        <li>Contact our support team if the issue persists</li>
      </ul>

      <a href="{{supportUrl}}" class="button">Get Support</a>

      <p>The AutoDM Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 5. INTEGRATION POINTS

### Send Welcome Email on Signup
```javascript
// backend/src/routes/auth.js
import { emailService } from '../services/email.js'

router.post('/signup', async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body

    // ... existing signup logic ...

    // Send welcome email
    await emailService.sendWelcomeEmail(email, firstName)

    // ... rest of signup ...
  } catch (error) {
    console.error('[Signup] Error:', error)
    res.status(500).json({ error: 'Signup failed' })
  }
})
```

### Send Email on Rule Match
```javascript
// backend/src/jobs/executeRule.js
import { emailService } from '../services/email.js'

export async function executeRule(ruleId, message, userId, accountId) {
  try {
    const rule = await AutomationRule.findById(ruleId)
    const user = await User.findById(userId)

    // ... execute rule logic ...

    // Send notification email if enabled
    if (rule.notifyOnMatch && user.emailNotifications) {
      await emailService.sendRuleTriggeredEmail(
        user.email,
        rule.name,
        1 // match count
      )
    }
  } catch (error) {
    console.error('[Rule Execution] Error:', error)
  }
}
```

### Send Daily Digest Email
```javascript
// backend/src/jobs/sendDailyDigest.js (scheduled daily at 9 AM)
import { emailService } from '../services/email.js'
import { analyticsService } from '../services/analytics.js'
import cron from 'node-cron'

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('[DailyDigest] Starting daily digest job')

    const users = await User.find({ emailNotifications: true })

    for (const user of users) {
      const stats = await analyticsService.getDailySummary(user._id)

      await emailService.sendDailyDigestEmail(user.email, user.firstName, stats)
    }

    console.log('[DailyDigest] Completed for', users.length, 'users')
  } catch (error) {
    console.error('[DailyDigest] Error:', error)
  }
})
```

---

## 6. USER PREFERENCES

### Add Email Preferences to User Model
```javascript
// backend/src/models/User.js
const userSchema = new mongoose.Schema({
  // ... existing fields ...

  emailNotifications: {
    type: Boolean,
    default: true,
  },
  emailPreferences: {
    welcomeEmail: { type: Boolean, default: true },
    ruleTriggered: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: false },
    billingReminders: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
})
```

### Add Email Preference API
```javascript
// backend/src/routes/user.js
import { User } from '../models/User.js'

router.put('/preferences/email', authenticate, async (req, res) => {
  try {
    const { emailNotifications, emailPreferences } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        emailNotifications,
        emailPreferences,
      },
      { new: true }
    )

    res.json({ success: true, user })
  } catch (error) {
    console.error('[Email Preferences] Error:', error)
    res.status(500).json({ error: 'Failed to update preferences' })
  }
})
```

### Add Settings Page Component
```typescript
// components/EmailPreferences.tsx
'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'

export function EmailPreferences({ user, onUpdate }) {
  const [preferences, setPreferences] = useState(user.emailPreferences || {})
  const [saving, setSaving] = useState(false)

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClient.put('/user/preferences/email', {
        emailNotifications: Object.values(preferences).some((v) => v),
        emailPreferences: preferences,
      })
      onUpdate(preferences)
    } catch (error) {
      console.error('[EmailPreferences] Error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-cyber-dark/50 border border-cyber-primary/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-cyber-primary mb-6">📧 Email Notifications</h3>

      <div className="space-y-4">
        {[
          { key: 'welcomeEmail', label: 'Welcome Email', desc: 'When you sign up' },
          { key: 'ruleTriggered', label: 'Rule Triggered', desc: 'When a rule matches' },
          { key: 'dailyDigest', label: 'Daily Digest', desc: 'Daily summary at 9 AM' },
          { key: 'billingReminders', label: 'Billing Reminders', desc: 'Before renewal' },
          { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important security events' },
          { key: 'marketing', label: 'Marketing', desc: 'New features and updates' },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences[item.key] || false}
              onChange={() => handleToggle(item.key)}
              className="w-4 h-4 accent-cyber-primary"
            />
            <div>
              <p className="font-medium text-cyber-text">{item.label}</p>
              <p className="text-sm text-cyber-text/60">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 px-6 py-2 bg-cyber-primary/20 text-cyber-primary rounded hover:bg-cyber-primary/30 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  )
}
```

---

## 7. IMPLEMENTATION TIMELINE

### Step 1: SendGrid Setup (15 minutes)
```
1. [ ] Create SendGrid account
2. [ ] Generate API key
3. [ ] Verify sender email
4. [ ] Add credentials to .env
```

### Step 2: Backend Setup (45 minutes)
```
1. [ ] Install nodemailer & SendGrid
2. [ ] Create email service
3. [ ] Create email templates
4. [ ] Add integration points
5. [ ] Test with real email
```

### Step 3: Frontend Setup (30 minutes)
```
1. [ ] Create email preferences component
2. [ ] Add settings page section
3. [ ] Connect API endpoints
```

### Step 4: Testing (30 minutes)
```
1. [ ] Signup and receive welcome email
2. [ ] Verify all templates work
3. [ ] Test email preferences
4. [ ] Check spam folder
```

---

## 8. TESTING CHECKLIST

```
Welcome Email:
- [ ] Sent on signup
- [ ] Contains correct name
- [ ] Links work correctly
- [ ] Formatted properly

Rule Triggered:
- [ ] Sent when rule matches
- [ ] Shows correct rule name
- [ ] Shows correct count

Daily Digest:
- [ ] Sent at 9 AM
- [ ] Contains accurate stats
- [ ] Only to opted-in users

Email Preferences:
- [ ] Can toggle notifications
- [ ] Settings persist
- [ ] Affects which emails are sent

Deliverability:
- [ ] Not going to spam
- [ ] Fast delivery (< 1 second)
- [ ] No bounces
- [ ] Open rate tracking (optional)
```

---

**Estimated Total Time**: 2 hours
**Difficulty**: Easy-Medium
**Cost**: Free (SendGrid free tier = 100 emails/day)

Ready to implement? Start with SendGrid setup! 📧
