const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Your API routes
app.get('/api/generate-pair-code', (req, res) => {
  const phone = req.query.phone;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  const pairCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  res.status(200).json({ pairCode });
});

app.post('/api/send-broadcast', (req, res) => {
  const { message, groupJid } = req.body;
  if (!message || !groupJid) {
    return res.status(400).json({ error: "Message and Group JID are required" });
  }
  console.log(`Sending message: "${message}" to group ${groupJid}`);
  res.status(200).json({ success: true, sent: 100 });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
