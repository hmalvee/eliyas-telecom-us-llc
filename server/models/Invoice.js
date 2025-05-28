const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  tax: Number,
  discount: Number,
  category: String,
  notes: String
});

const paymentScheduleSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentMethod: String,
  notes: String
});

const invoiceSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  saleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sale', 
    required: true 
  },
  date: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['paid', 'unpaid', 'overdue'],
    default: 'unpaid'
  },
  currency: { type: String, default: 'USD' },
  exchangeRate: { type: Number, default: 1 },
  template: { 
    type: String, 
    enum: ['standard', 'professional', 'minimal'],
    default: 'standard'
  },
  notes: [String],
  terms: [String],
  paymentSchedule: [paymentScheduleSchema],
  signature: String,
  qrCode: String,
  customFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);