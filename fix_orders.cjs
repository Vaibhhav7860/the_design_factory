require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Order } = require('./src/lib/db/models');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Order.updateMany(
    { fulfilmentStatus: 'cancelled' },
    { $set: { fulfilmentStatus: 'unfulfilled' } }
  );
  console.log('Fixed', result.modifiedCount, 'orders');
  process.exit(0);
}
fix();
