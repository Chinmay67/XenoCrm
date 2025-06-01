import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [{
    product_id: String,
    name: String,
    quantity: Number,
    price: Number,
  }],
  total_price: { type: Number, required: true },
  order_date: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);