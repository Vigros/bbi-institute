const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testName: String,
  marks: String,
  remark: String,
  maxMarks: Number,
  isAbsent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
