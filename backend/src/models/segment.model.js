import mongoose, { Schema } from 'mongoose';

const SegmentSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Segment', SegmentSchema);