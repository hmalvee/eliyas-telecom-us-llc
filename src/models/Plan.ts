import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  data: { type: String, required: true },
  calls: { type: String, required: true },
  texts: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);