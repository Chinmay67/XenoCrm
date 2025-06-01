import mongoose, { Schema } from 'mongoose';

const CampaignSchema = new Schema({
  segment_id: { type: Schema.Types.ObjectId, ref: 'Segment', required: true },
  name: { type: String, required: true },
  message_template: { type: String, required: true },
  status: { type: String, enum: ['pending', 'running', 'completed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Campaign', CampaignSchema);