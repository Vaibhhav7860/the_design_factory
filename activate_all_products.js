import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectToDatabase } from './src/lib/db/mongoose.js';
import { Product } from './src/lib/db/models/Product.js';

async function run() {
  try {
    await connectToDatabase();
    
    // Find all products that are currently drafts
    const draftsCount = await Product.countDocuments({ status: 'draft' });
    console.log(`Found ${draftsCount} products marked as draft.`);
    
    if (draftsCount > 0) {
      // Update all draft products to active
      const result = await Product.updateMany(
        { status: 'draft' }, 
        { $set: { status: 'active' } }
      );
      console.log(`Successfully updated ${result.modifiedCount} products to active status.`);
    }
    
    // Also handle any products that might be missing the status field entirely
    const missingStatusCount = await Product.countDocuments({ status: { $exists: false } });
    if (missingStatusCount > 0) {
      const result2 = await Product.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'active' } }
      );
      console.log(`Successfully set status to active for ${result2.modifiedCount} products that were missing the status field.`);
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error activating products:', error);
  } finally {
    process.exit(0);
  }
}

run();
