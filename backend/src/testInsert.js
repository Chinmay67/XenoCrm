import mongoose from 'mongoose';
import { Customer, Order } from './models/index.js'; // adjust path if needed
import dotenv from 'dotenv';
import { config } from './config/index.js';

dotenv.config();

const mongoUrl = `${config.mongo_url}/XenoCrm`; // Use the config object to get the MongoDB URL

async function createSampleData() {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for test data insertion');

    // Create a sample customer
    const customer = new Customer({
      name: 'Test User',
      email: 'testuser@example.com',
      total_spend: 0,
      visits_count: 0,
      last_active_at: null,
    });
    await customer.save();
    console.log('Sample customer created');

    // Create a sample order linked to that customer
    const order = new Order({
      customer_id: customer._id,
      products: [
        { product_id: 'SKU123', name: 'Sample Product', quantity: 1, price: 100 },
      ],
      total_price: 100,
      order_date: new Date(),
    });
    await order.save();
    console.log('Sample order created');

    // Disconnect after done
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (err) {
    console.error('Error creating sample data:', err);
    process.exit(1);
  }
}

createSampleData();
