import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectRabbitMQ } from '../config/rabbitMQ.js';
import { Order, Customer } from '../models/index.js';
import { config } from '../config/index.js';

dotenv.config();

const run = async () => {
 await mongoose.connect(`${config.mongo_url}/XenoCrm`);
 

  const channel = await connectRabbitMQ();

  channel.consume('order_ingest_queue', async (msg) => {
    if (!msg) return;

    try {
      const order = JSON.parse(msg.content.toString());

      const savedOrder = await Order.create(order);

      // Update customer stats atomically
      await Customer.findByIdAndUpdate(order.customer_id, {
        $inc: { total_spend: order.total_price, visits_count: 1 },
        $max: { last_active_at: new Date(order.order_date) }
      });

      console.log(`✅ Order processed: ${savedOrder._id}`);

      channel.ack(msg);
    } catch (error) {
      console.error('❌ Failed to process order:', error);
      // Optionally: channel.nack(msg, false, false) to reject without requeue
    }
  });

  console.log('🐇 Order consumer started');
};

run().catch(console.error);
