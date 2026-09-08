const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (পরে ব্যবহার হবে)
app.use('/uploads', express.static('uploads'));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'AIToolsBD Server is running!',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;