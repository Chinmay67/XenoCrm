import mongoose, { Schema } from 'mongoose';

const SegmentRuleSchema = new Schema({
  segment_id: { type: Schema.Types.ObjectId, ref: 'Segment', required: true },
  field: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  logical_group: { type: Number, default: 1 },
  logical_op: { type: String, enum: ['AND', 'OR'], default: 'AND' },
}, { timestamps: true });

export default mongoose.model('SegmentRule', SegmentRuleSchema);