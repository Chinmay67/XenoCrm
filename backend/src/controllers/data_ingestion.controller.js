import { connectRabbitMQ } from '../config/rabbitMQ.js';
import apiError from '../utils/apiError.js';
import apiResponse from '../utils/apiResponse.js';

let rabbitChannel;

/**
 * Controller to ingest customers by validating and publishing to RabbitMQ queue.
 */
const ingestCustomers = async (req, res) => {
  try {
    rabbitChannel = rabbitChannel || await connectRabbitMQ();

    const { customers } = req.body;
    if (!customers || !Array.isArray(customers)) {
      throw new apiError(400, 'Invalid customers data');
    }

    const validCustomers = [];
    const errorArray = [];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const missingFields = [];
      if (!customer.name) missingFields.push('name');
      if (!customer.email) missingFields.push('email');

      if (missingFields.length > 0) {
        errorArray.push({ customer, error: `Missing fields: ${missingFields.join(', ')}`, index: i });
        continue;
      }
      validCustomers.push({ name: customer.name, email: customer.email });
    }

    if (validCustomers.length === 0) {
      throw new apiError(400, 'No valid customers to insert.', errorArray);
    }

    validCustomers.forEach(customer => {
      rabbitChannel.sendToQueue('customer_ingest_queue', Buffer.from(JSON.stringify(customer)), {
        persistent: true,
      });
    });

    return res.status(202).json(new apiResponse(202, { errorArray }, 'Customers queued for ingestion'));
  } catch (error) {
    console.error('Error ingesting customers:', error);
    throw new apiError(500, 'Failed to ingest customers');
  }
};

/**
 * Controller to ingest orders by validating and publishing to RabbitMQ queue.
 */
const ingestOrders = async (req, res) => {
  try {
    rabbitChannel = rabbitChannel || await connectRabbitMQ();

    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      throw new apiError(400, 'Invalid orders data');
    }

    const validOrders = [];
    const errorArray = [];

    orders.forEach((order, index) => {
      const missingFields = [];
      if (!order.customer_id) missingFields.push('customer_id');
      if (!order.products || !Array.isArray(order.products)) missingFields.push('products');
      if (order.total_price === undefined || order.total_price === null) missingFields.push('total_price');
      if (!order.order_date) missingFields.push('order_date');

      if (missingFields.length > 0) {
        errorArray.push({ order, error: `Missing or invalid fields: ${missingFields.join(', ')}`, index });
      } else {
        validOrders.push({
          customer_id: order.customer_id,
          products: order.products,
          total_price: order.total_price,
          order_date: new Date(order.order_date),
        });
      }
    });

    if (validOrders.length === 0) {
      throw new apiError(400, 'No valid orders to insert.', errorArray);
    }

    validOrders.forEach(order => {
      rabbitChannel.sendToQueue('order_ingest_queue', Buffer.from(JSON.stringify(order)), {
        persistent: true,
      });
    });

    return res.status(202).json(new apiResponse(202, { errorArray }, 'Orders queued for ingestion'));
  } catch (error) {
    console.error('Error ingesting orders:', error);
    throw new apiError(500, 'Failed to ingest orders');
  }
};

export {
  ingestCustomers,
  ingestOrders,
};
