const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create default admin user if not exists
    await createDefaultAdmin();

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require('../models/User');
    const adminExists = await User.findOne({ email: 'admin@elibrary.com' });

    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@elibrary.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      console.log('👑 Default admin user created: admin@elibrary.com / admin123');
    }
  } catch (error) {
    console.log('⚠️ Could not create default admin:', error.message);
  }
};

module.exports = connectDB;