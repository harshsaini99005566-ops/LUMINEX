#!/usr/bin/env node

/**
 * Create Test Instagram Account
 * 
 * This script creates a test Instagram account in the database
 * for development and testing purposes
 */

const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const InstagramAccount = require('../src/models/InstagramAccount');

async function createTestAccount() {
  try {
    console.log('🔧 Creating test Instagram account...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Create or find test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('📝 Creating test user...');
      const plainPassword = 'Test@12345';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        plan: 'pro',
        subscriptionStatus: 'active',
        limits: {
          instagramAccounts: 10,
          automationRules: 50,
          aiReplies: 5000,
          monthlyMessages: 100000,
        },
      });
      console.log('✅ Test user created:', testUser._id, '\n');
      console.log('📋 Login Credentials:');
      console.log('   Email: test@example.com');
      console.log('   Password: Test@12345\n');
    } else {
      console.log('✅ Found existing test user:', testUser._id, '\n');
      console.log('📋 Login Credentials:');
      console.log('   Email: test@example.com');
      console.log('   Password: Test@12345\n');
    }

    // Create test Instagram account
    const testAccount = await InstagramAccount.create({
      user: testUser._id,
      instagramId: '17841400663181990',
      businessAccountId: '10158991915612345',
      pageId: '108705167772345',
      username: 'test_business_account',
      name: 'Test Business Account',
      biography: 'This is a test Instagram account for development',
      profilePicture: 'https://via.placeholder.com/150',
      followersCount: 1250,
      websiteUrl: 'https://example.com',
      email: 'business@example.com',
      accessToken: 'EAABsbCS1iHgBAMZCgGKZBqFT0sZA7N8nXz9ZAVj2HZCQZCpfZCZAJ3RhKZC9L5mRJ',
      refreshToken: 'EAABsbCS1iHgBAMZCgGKZBqFT0sZA7N8nXz9ZAVj2HZCQZCpfZCZAJ3RhKZC9L5mRJ',
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      isActive: true,
      webhooksSubscribed: false,
    });

    console.log('✅ Test Instagram Account Created!\n');
    console.log('📊 Account Details:');
    console.log('  ID:', testAccount._id);
    console.log('  Username:', testAccount.username);
    console.log('  Instagram ID:', testAccount.instagramId);
    console.log('  User ID:', testAccount.user);
    console.log('  Active:', testAccount.isActive);
    console.log('  Followers:', testAccount.followersCount);
    console.log('  Created At:', testAccount.createdAt);
    console.log('\n✨ You can now see this account in your dashboard!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test account:', error.message);
    if (error.code === 11000) {
      console.error('\n⚠️ Account with this Instagram ID already exists in the database');
      console.log('💡 Try using a different Instagram ID or delete the existing one\n');
    }
    process.exit(1);
  }
}

createTestAccount();
