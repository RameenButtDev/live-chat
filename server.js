const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files
app.use(express.static(__dirname));

// In-memory store
const db = new Map();

// API routes
app.get('/api/storage', (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  const value = db.get(key);
  res.json({ value: value || null });
});

app.post('/api/storage', (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }
  db.set(key, value);
  res.json({ success: true });
});

// Fallback to index.html for frontend routing/clean URLs
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Chat application server running on http://localhost:${PORT}`);
});
