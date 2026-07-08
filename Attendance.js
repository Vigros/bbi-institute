const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
  markedAt: String,
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);