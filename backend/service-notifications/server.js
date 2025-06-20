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
  registerWithConsul();
});

function registerWithConsul() {
  const consul = require('consul')({
    host: process.env.CONSUL_HOST || 'consul',
    port: process.env.CONSUL_PORT || '8500',
    promisify: true
  });
  const id = `${process.env.SERVICE_NAME || 'notification-service'}-${PORT}`;
  consul.agent.service.register({
    name: process.env.SERVICE_NAME || 'notification-service',
    id,
    address: process.env.SERVICE_HOST || 'notification-service',
    port: Number(PORT),
    check: {
      http: `http://${process.env.SERVICE_HOST || 'notification-service'}:${PORT}/health`,
      interval: '10s'
    }
  }).then(() => console.log('Registered with Consul'))
    .catch(err => console.error('Consul registration failed:', err));

  const cleanup = async () => {
    try { await consul.agent.service.deregister(id); } finally { process.exit(); }
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}