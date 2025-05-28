import mongoose from 'mongoose';

const CustomerNumberSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  name: { type: String, required: true },
  carrier: { type: String, required: true },
  customCarrier: { type: String },
  phoneNumber: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.models.CustomerNumber || mongoose.model('CustomerNumber', CustomerNumberSchema);