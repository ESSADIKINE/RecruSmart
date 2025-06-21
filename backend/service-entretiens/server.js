require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const entretienRoutes = require('./routes/entretienRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connexion DB
connectDB();

// Routes
app.use('/entretients', entretienRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Service Entretiens démarré sur le port ${PORT}`);
  registerWithConsul();
});

function registerWithConsul() {
  const consul = require('consul')({
    host: process.env.CONSUL_HOST || 'consul',
    port: process.env.CONSUL_PORT || '8500',
    promisify: true
  });
  const id = `${process.env.SERVICE_NAME || 'entretiens-service'}-${PORT}`;
  consul.agent.service.register({
    name: process.env.SERVICE_NAME || 'entretiens-service',
    id,
    address: process.env.SERVICE_HOST || 'entretiens-service',
    port: Number(PORT),
    check: {
      http: `http://${process.env.SERVICE_HOST || 'entretiens-service'}:${PORT}/health`,
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
