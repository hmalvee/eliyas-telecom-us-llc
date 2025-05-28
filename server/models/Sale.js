const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  amount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'], required: true },
  status: { type: String, enum: ['paid', 'partial', 'unpaid'], required: true },
  notes: String,
  businessType: {
    type: String,
    enum: ['telecom_recharge', 'telecom_phone', 'telecom_service', 'travel_domestic', 'travel_international']
  },
  customerNumberId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerNumber' },
  profit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

saleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Sale', saleSchema);