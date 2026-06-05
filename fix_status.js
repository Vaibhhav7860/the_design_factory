import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { connectToDatabase } from './src/lib/db/mongoose.js';
import { Product } from './src/lib/db/models/Product.js';
async function run() {
  await connectToDatabase();
  const missing = ['art-bag-mermaid', 'jelly-tote-bag-pink', 'art-bag-dinosaur'];
  await Product.updateMany({ slug: { $in: missing } }, { $set: { status: 'active' } });
  console.log('Done');
  process.exit(0);
}
run();
