require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const ticketRoutes = require('../routes/tickets');
const dashboardRoutes = require('../routes/dashboard');
const lookupRoutes = require('../routes/lookups');
const messageRoutes = require('../routes/messages');
const noticeRoutes = require('../routes/notices');
const brandbarRoutes = require('../routes/brandbar');
const activityLogRoutes = require('../routes/activityLogs');
const knowledgeBaseRoutes = require('../routes/knowledgeBase');
const twoFactorRoutes = require('../routes/twoFactor');
const featuresRoutes = require('../routes/features');
const contactRoutes = require('../routes/contacts');
const ipMiddleware = require('../middleware/ipMiddleware');
const { getServerLocalIP } = require('../utils/ipHelper');

const app = express();
const PORT = process.env.PORT || 5000;

// Respect reverse proxy (cPanel/Nginx/Apache)
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ipMiddleware);

// Request IP logging
app.use((req, _res, next) => {
  console.log(`[IP LOG] ${req.clientIP} - ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'Support Management System API', status: 'healthy' });
});

app.get('/api/ip-info', (req, res) => {
  res.json({
    clientIP: req.clientIP,
    serverLocalIP: getServerLocalIP(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/brandbar', brandbarRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/features', featuresRoutes);
app.use('/api/contacts', contactRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
