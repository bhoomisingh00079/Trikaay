require('dotenv').config();
const express = require('express');
const cors = require('cors');

const contactRouter = require('./routes/contact');
const subscribeRouter = require('./routes/subscribe');
const commentsRouter = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contact', contactRouter);
app.use('/api/subscribe', subscribeRouter);
app.use('/api/comments', commentsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📍 Frontend should connect to: http://localhost:${PORT}/api/\n`);
});
