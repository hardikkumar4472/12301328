require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('../logging_middleware/middleware');
const app = express();
app.use(express.json());
app.use(cors());
app.use(logger);
const SECRET = process.env.SECRET;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  createdAt: { type: Date, default: Date.now }
});

const preferenceSchema = new mongoose.Schema({
  userId: { type: String, default: '123' }, 
  email: {
    marketing: { type: Boolean, default: false },
    security: { type: Boolean, default: true },
    updates: { type: Boolean, default: true }
  },
  push: {
    messages: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true }
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
const Preference = mongoose.model('Preference', preferenceSchema);

async function seedData() {
  const count = await Notification.countDocuments();
  if (count === 0) {
    await Notification.create([
      { title: 'Placement Alert', message: 'Hey its placement time.', type: 'info' },
      { title: 'Event Update', message: 'hey its fset time.', type: 'success' },
      { title: 'Result Published', message: 'ohh its a result time.', isRead: true, createdAt: new Date(Date.now() - 86400000) }
    ]);
  }
}
seedData();
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing token' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(403).json({ error: 'Token is not valid' });
  }
};

app.get('/api/v1/get-token', (req, res) => {
  const payload = { userId: '123', name: 'Hardik' };
  const token = jwt.sign(payload, SECRET);
  res.json({ 
    status: 'success',
    token: token,
  });
});

app.get('/api/v1/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({
      status: 'success',
      data: { notifications }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/v1/notifications/:id/read', auth, async (req, res) => {
  try {
    const item = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.post('/api/v1/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ status: 'success', message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/v1/notifications/:id', auth, async (req, res) => {
  try {
    const result = await Notification.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.get('/api/v1/notifications/preferences', auth, async (req, res) => {
  try {
    let prefs = await Preference.findOne({ userId: '123' });
    if (!prefs) {
      prefs = await Preference.create({ userId: '123' });
    }
    res.json({ status: 'success', data: prefs });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/v1/notifications/preferences', auth, async (req, res) => {
  try {
    const prefs = await Preference.findOneAndUpdate(
      { userId: '123' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', message: 'Settings updated', data: prefs });
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.listen(5000);
