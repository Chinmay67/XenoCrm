import amqp from 'amqplib';
import { config } from './index.js';


let channel = null;
let connection = null;

/**
 * Establishes and returns a singleton RabbitMQ channel.
 * Asserts required queues if they don't exist.
 *
 * 
 * @returns {Promise<amqp.Channel>} The RabbitMQ channel.
 */
export const connectRabbitMQ = async () => {
  try {
    if (channel && connection) {
      return channel;
    }

    connection = await amqp.connect(config.rabbit_mq_url);
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      channel = null;
      connection = null;
    });
    connection.on('close', () => {
      console.warn('RabbitMQ connection closed');
      channel = null;
      connection = null;
    });

    channel = await connection.createChannel();

    // Assert durable queues for customers and orders
    await channel.assertQueue('customer_ingest_queue', { durable: true });
    await channel.assertQueue('order_ingest_queue', { durable: true });

    console.log('✅ RabbitMQ connected and queues asserted');
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

/**
 * Returns the active RabbitMQ channel instance.
 * Throws if the channel has not been initialized.
 *
 * @returns {amqp.Channel} The RabbitMQ channel.
 */
export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ first.');
  }
  return channel;
};
