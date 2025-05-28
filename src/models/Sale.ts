import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  amount: { type: Number, required: true },
  amountPaid: { type: Number, required: true, default: 0 },
  date: { type: Date, required: true, default: Date.now },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'], required: true },
  paymentStatus: { type: String, enum: ['paid', 'partial', 'unpaid'], required: true },
  orderStatus: { type: String, enum: ['delivered', 'canceled', 'processing'], required: true },
  businessType: { 
    type: String, 
    enum: [
      'telecom_recharge', 
      'telecom_phone', 
      'telecom_service', 
      'telecom_other',
      'travel_domestic',
      'travel_international',
      'travel_visa',
      'travel_custom'
    ]
  },
  customerNumberId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerNumber' },
  profit: { type: Number, default: 0 },
  notes: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);