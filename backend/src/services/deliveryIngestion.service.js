import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { CommunicationLog } from '../models/index.js';
import { connectRabbitMQ } from '../config/rabbitMQ.js';

const RABBITMQ_URL = config.rabbit_mq_url || 'amqp://localhost';
const MONGO_URI = config.mongo_url;

const BATCH_SIZE = 20;           // Number of messages to batch before writing
const BATCH_TIMEOUT_MS = 3000;   // Max time to wait before flushing batch (ms)

let batch = [];
let batchTimeout;
let channel = null;

const connectDB = async () => {
  await mongoose.connect(`${MONGO_URI}/XenoCrm`);
  console.log('MongoDB connected');
};

const processBatch = async () => {
  if (batch.length === 0) return;

  console.log(`Processing batch of ${batch.length} messages...`);

  const updates = batch.map(({ communicationLogId, success, failureReason }) => {
    if (!communicationLogId) {
      console.error('Missing communicationLogId in message:', { communicationLogId, success, failureReason });
      return null;
    }

    const update = {
      delivery_status: success ? 'SENT' : 'FAILED',
      delivery_at: new Date(),
      failure_reason: success ? null : failureReason,
    };

    return {
      updateOne: {
        filter: { _id: communicationLogId },
        update: { $set: update }
      }
    };
  }).filter(Boolean); // Remove null entries

  if (updates.length === 0) {
    console.warn('No valid updates in batch');
    batch = [];
    return;
  }

  try {
    const result = await CommunicationLog.bulkWrite(updates);
    console.log(`Successfully processed batch:`, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      batchSize: updates.length
    });
  } catch (error) {
    console.error('Error processing batch update:', error);
  }

  batch = [];
};

const startConsumer = async () => {
  await connectDB();

  channel = await connectRabbitMQ();
  
  // Assert the delivery_receipts queue
  
  
  // Enable prefetch for better batch processing
  channel.prefetch(BATCH_SIZE);

  console.log('Waiting for messages in delivery_receipts queue...');

  channel.consume('delivery_receipts', async (msg) => {
    if (msg !== null) {
      try {
        const content = JSON.parse(msg.content.toString());
        console.log('Received message:', content);
        batch.push(content);
        channel.ack(msg);

        // Process batch when size threshold reached
        if (batch.length >= BATCH_SIZE) {
          clearTimeout(batchTimeout);
          await processBatch();
        } else {
          // Reset timeout for partial batch
          clearTimeout(batchTimeout);
          batchTimeout = setTimeout(async () => {
            await processBatch();
          }, BATCH_TIMEOUT_MS);
        }
      } catch (error) {
        console.error('Failed to process message:', error);
        channel.nack(msg, false, false);
      }
    }
  });
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  if (batch.length > 0) {
    console.log('Processing remaining messages...');
    await processBatch();
  }
  if (channel) {
    await channel.close();
  }
  await mongoose.connection.close();
  process.exit(0);
});

// Start the consumer
startConsumer().catch(error => {
  console.error('Failed to start consumer:', error);
  process.exit(1);
});
