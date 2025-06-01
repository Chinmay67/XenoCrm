import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  total_spend: { type: Number, default: 0 },
  visits_count: { type: Number, default: 0 },
  last_active_at: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Customer', CustomerSchema);