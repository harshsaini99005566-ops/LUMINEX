require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('🗄️  Database: LUMINEX');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (empty database)');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
