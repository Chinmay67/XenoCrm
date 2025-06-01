import mongoose, { Schema } from 'mongoose';

const CommunicationLogSchema = new Schema({
  campaign_id: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  message_sent: { type: String },
  delivery_status: { type: String, enum: ['SENT', 'FAILED', 'PENDING'], default: 'PENDING' },
  sent_at: { type: Date },
  delivery_at: { type: Date },
  failure_reason: { type: String },
}, { timestamps: true });

export default mongoose.model('CommunicationLog', CommunicationLogSchema);