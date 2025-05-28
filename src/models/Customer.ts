import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  joinDate: { type: Date, required: true, default: Date.now },
}, {
  timestamps: true
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);