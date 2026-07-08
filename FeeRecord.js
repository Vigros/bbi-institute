const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
  paidDate: String
}, { timestamps: true });

feeRecordSchema.index({ studentId: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('FeeRecord', feeRecordSchema);