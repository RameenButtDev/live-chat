const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // 1. Mongoose import kiya
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();
app.use(express.json());

// MongoDB Connection
// MONGO_URI aap Render ke environment variables mein daleinge
const MONGO_URI = process.env.MONGO_URI; 
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log("MongoDB Connection Error:", err));

// MongoDB Schema aur Model (Map ki jagah database use karne ke liye)
const StorageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
});
const Storage = mongoose.model('Storage', StorageSchema);

// CORS middleware (Aapka pehle wala hi hai, jo bilkul sahi hai)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Live hone par yahan '*' ki jagah Vercel ka link daal dena safe hai
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(__dirname));

// API routes (Ab ye MongoDB se data layenge aur save karenge)
app.get('/api/storage', async (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  try {
    const data = await Storage.findOne({ key });
    res.json({ value: data ? data.value : null });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/storage', async (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  try {
    // Agar key pehle se hai to update karein, nahi to naya banayein
    await Storage.findOneAndUpdate({ key }, { value }, { upsert: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Chat application server running on port ${PORT}`);
});