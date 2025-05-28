import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  tax: { type: Number },
  discount: { type: Number },
  category: { type: String },
  notes: { type: String }
});

const PaymentScheduleSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], required: true },
  paymentMethod: { type: String },
  notes: { type: String }
});

const InvoiceSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  date: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid', 'overdue'], required: true },
  currency: { type: String, default: 'USD' },
  exchangeRate: { type: Number, default: 1 },
  template: { type: String, enum: ['standard', 'professional', 'minimal'], default: 'standard' },
  notes: [String],
  terms: [String],
  paymentSchedule: [PaymentScheduleSchema],
  signature: { type: String },
  qrCode: { type: String },
  customFields: { type: Map, of: String }
}, {
  timestamps: true
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);