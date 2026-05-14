require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const logger = require('../logging_middleware/middleware');
const app = express();
app.use(express.json());
app.use(cors());
app.use(logger);
const SECRET = process.env.SECRET;
let notifications = [
  { id: uuidv4(), title: 'Placement Alert', message: 'Hey its placement time.', isRead: false, type: 'info', createdAt: new Date() },
  { id: uuidv4(), title: 'Event Update', message: 'hey its fset time.', isRead: false, type: 'success', createdAt: new Date() },
  { id: uuidv4(), title: 'Result Published', message: 'ohh its a result time.', isRead: true, type: 'info', createdAt: new Date(Date.now() - 86400000) }
];
let userPreferences = {
  email: { marketing: false, security: true, updates: true },
  push: { messages: true, mentions: true }
};
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

app.get('/api/v1/notifications', auth, (req, res) => {
  res.json({
    status: 'success',
    data: { notifications }
  });
});

app.patch('/api/v1/notifications/:id/read', auth, (req, res) => {
  const item = notifications.find(n => n.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  item.isRead = true;
  res.json({ status: 'success', data: item });
});

app.post('/api/v1/notifications/read-all', auth, (req, res) => {
  notifications.forEach(n => n.isRead = true);
  res.json({ status: 'success', message: 'All marked as read' });
});

app.delete('/api/v1/notifications/:id', auth, (req, res) => {
  notifications = notifications.filter(n => n.id !== req.params.id);
  res.status(204).send();
});

app.get('/api/v1/notifications/preferences', auth, (req, res) => {
  res.json({ status: 'success', data: userPreferences });
});

app.put('/api/v1/notifications/preferences', auth, (req, res) => {
  userPreferences = { ...userPreferences, ...req.body };
  res.json({ status: 'success', message: 'Settings updated' });
});

app.listen(5000);
