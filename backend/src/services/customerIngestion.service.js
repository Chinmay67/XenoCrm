import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectRabbitMQ } from '../config/rabbitMQ.js';
import { Customer } from '../models/index.js';
import { config } from '../config/index.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(`${config.mongo_url}/XenoCrm`);

  const channel = await connectRabbitMQ();

  channel.consume('customer_ingest_queue', async (msg) => {
    if (!msg) return;

    try {
      const customer = JSON.parse(msg.content.toString());

      // Prevent duplicates - check email before insert
      const exists = await Customer.exists({ email: customer.email });
      if (!exists) {
        await Customer.create(customer);
        console.log(`✅ Customer saved: ${customer.email}`);
      } else {
        console.log(`⚠️ Customer already exists: ${customer.email}`);
      }

      channel.ack(msg);
    } catch (error) {
      console.error('❌ Failed to process customer:', error);
      // Optionally: channel.nack(msg, false, false) to reject without requeue
    }
  });

  console.log('🐇 Customer consumer started');
};

run().catch(console.error);
