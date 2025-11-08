import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/atgs';

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get all indexes
    console.log('\nCurrent indexes on users collection:');
    const indexes = await usersCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Drop the problematic username index if it exists
    try {
      console.log('\nAttempting to drop username_1 index...');
      await usersCollection.dropIndex('username_1');
      console.log('✓ Successfully dropped username_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('✓ username_1 index does not exist (already clean)');
      } else {
        console.log('Error dropping index:', error.message);
      }
    }
    
    // Show final indexes
    console.log('\nFinal indexes on users collection:');
    const finalIndexes = await usersCollection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));
    
    console.log('\n✓ Database indexes fixed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixIndexes();
