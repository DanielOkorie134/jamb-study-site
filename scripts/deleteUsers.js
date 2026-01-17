const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Progress = require('../models/Progress');
const Score = require('../models/Score');
const ChatMessage = require('../models/ChatMessage');
const SyllabusProgress = require('../models/SyllabusProgress');

async function deleteAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get count before deletion
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('ℹ️  No users to delete');
      process.exit(0);
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete ALL users and their associated data!');
    console.log('This includes:');
    console.log('  - User accounts');
    console.log('  - Progress records');
    console.log('  - Scores');
    console.log('  - Chat messages');
    console.log('  - Syllabus progress');
    
    // Delete all related data first
    console.log('\n🗑️  Deleting associated data...');
    
    const progressDeleted = await Progress.deleteMany({});
    console.log(`   ✓ Deleted ${progressDeleted.deletedCount} progress records`);
    
    const scoresDeleted = await Score.deleteMany({});
    console.log(`   ✓ Deleted ${scoresDeleted.deletedCount} score records`);
    
    const chatDeleted = await ChatMessage.deleteMany({});
    console.log(`   ✓ Deleted ${chatDeleted.deletedCount} chat messages`);
    
    const syllabusDeleted = await SyllabusProgress.deleteMany({});
    console.log(`   ✓ Deleted ${syllabusDeleted.deletedCount} syllabus progress records`);

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`\n✅ Successfully deleted ${result.deletedCount} users`);

    console.log('\n✨ Database cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

async function deleteUserByEmail(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`\n📧 Found user: ${user.username} (${user.email})`);
    console.log(`⚠️  Deleting user and all associated data...`);

    // Delete associated data
    await Progress.deleteMany({ user: user._id });
    await Score.deleteMany({ user: user._id });
    await ChatMessage.deleteMany({ user: user._id });
    await SyllabusProgress.deleteMany({ user: user._id });

    // Delete user
    await User.deleteOne({ _id: user._id });

    console.log(`✅ Successfully deleted user and all associated data`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

async function listAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}).select('username email createdAt lastLogin');
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
      process.exit(0);
    }

    console.log(`\n📋 Found ${users.length} users:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   Last Login: ${user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'all') {
  deleteAllUsers();
} else if (command === 'email' && args[1]) {
  deleteUserByEmail(args[1]);
} else if (command === 'list') {
  listAllUsers();
} else {
  console.log('📖 Usage:');
  console.log('  node scripts/deleteUsers.js list              - List all users');
  console.log('  node scripts/deleteUsers.js all               - Delete ALL users');
  console.log('  node scripts/deleteUsers.js email <email>     - Delete specific user by email');
  console.log('\nExamples:');
  console.log('  node scripts/deleteUsers.js list');
  console.log('  node scripts/deleteUsers.js email user@example.com');
  console.log('  node scripts/deleteUsers.js all');
  process.exit(1);
}
