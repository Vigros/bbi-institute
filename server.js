const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// ==================== MODELS ====================
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  standard: { type: String, required: true },
  monthlyFee: { type: Number, required: true },
  whatsappNumber: { type: String, required: true },
  parentName: String,
  studentPhone: String,
  email: String,
  address: String,
  transport: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const Student = mongoose.model('Student', studentSchema);

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
  markedAt: String,
  isDefault: { type: Boolean, default: false }
});
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
const Attendance = mongoose.model('Attendance', attendanceSchema);

const testSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testName: String,
  marks: String,
  remark: String,
  isAbsent: { type: Boolean, default: false }
}, { timestamps: true });
const Test = mongoose.model('Test', testSchema);

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
  paidDate: String
});
feeSchema.index({ studentId: 1, month: 1 }, { unique: true });
const FeeRecord = mongoose.model('FeeRecord', feeSchema);

// ==================== STUDENT ROUTES ====================
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== ATTENDANCE ROUTES ====================
app.get('/api/attendance/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.find({ date: today }).populate('studentId', 'name standard');
    res.json({ success: true, data: attendance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOneAndUpdate(
      { studentId: req.body.studentId, date: today },
      { status: req.body.status, markedAt: req.body.markedAt },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance/mark-all', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const students = await Student.find({ isActive: true });
    for (const s of students) {
      await Attendance.findOneAndUpdate(
        { studentId: s._id, date: today },
        { status: 'Present', markedAt: req.body.markedAt },
        { upsert: true }
      );
    }
    res.json({ success: true, message: `Marked ${students.length} present` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==================== FEE ROUTES ====================
app.get('/api/fees', async (req, res) => {
  try {
    const fees = await FeeRecord.find().populate('studentId', 'name standard monthlyFee');
    res.json({ success: true, data: fees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/fees/pay', async (req, res) => {
  try {
    const { studentId, month, amount } = req.body;
    let record = await FeeRecord.findOne({ studentId, month });
    if (!record) {
      const student = await Student.findById(studentId);
      record = new FeeRecord({ studentId, month, amount: student.monthlyFee, paidAmount: 0, status: 'unpaid' });
    }
    record.paidAmount += amount;
    record.status = record.paidAmount >= record.amount ? 'paid' : 'partial';
    if (record.status === 'paid') record.paidDate = new Date().toISOString().split('T')[0];
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==================== TEST ROUTES ====================
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find().populate('studentId', 'name standard').sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tests/batch', async (req, res) => {
  try {
    const tests = await Test.insertMany(req.body.tests);
    res.status(201).json({ success: true, data: tests });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏫 Server running on http://localhost:${PORT}`);
});