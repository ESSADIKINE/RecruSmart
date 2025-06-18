require('dotenv').config();
const express = require('express');
const app = express();

require('./consumers/notificationConsumer');

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Service Notification démarré sur le port ${PORT}`);
}); 