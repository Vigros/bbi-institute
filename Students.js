const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  standard: { type: String, required: true },
  monthlyFee: { type: Number, required: true },
  whatsappNumber: { type: String, required: true },
  parentPhone: String,
  parentName: String,
  studentPhone: String,
  email: String,
  address: String,
  transport: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);