require('dotenv').config();
const express = require('express');
const cors = require('cors');

const contactRouter = require('./routes/contact');
const subscribeRouter = require('./routes/subscribe');
const commentsRouter = require('./routes/comments');
const donateRouter = require('./routes/donate');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/contact', contactRouter);
app.use('/api/subscribe', subscribeRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/donate', donateRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});

// ✅ Fixed: use server variable so we can catch port errors gracefully
const server = app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📍 Frontend should connect to: http://localhost:${PORT}/api/\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run this in PowerShell to fix it:`);
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error(`   taskkill /PID <PID> /F\n`);
    process.exit(1);
  }
});