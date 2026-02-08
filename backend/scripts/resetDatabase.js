const mongoose = require('mongoose');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Drop all collections
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      console.log(`🗑️  Cleared collection: ${key}`);
    }
    
    console.log('✅ Database reset successfully - all collections cleared');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
};

resetDatabase();
