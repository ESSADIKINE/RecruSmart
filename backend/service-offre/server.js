const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const offreRoutes = require('./routes/offreRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/offres', offreRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue', error: err.message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connecté à MongoDB');
        // Start server
        const PORT = process.env.PORT || 8081;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
            registerWithConsul(PORT);
        });
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });

function registerWithConsul(port) {
    const consul = require('consul')({
        host: process.env.CONSUL_HOST || 'consul',
        port: process.env.CONSUL_PORT || '8500',
        promisify: true
    });
    const id = `${process.env.SERVICE_NAME || 'offre-service'}-${port}`;
    consul.agent.service.register({
        name: process.env.SERVICE_NAME || 'offre-service',
        id,
        address: process.env.SERVICE_HOST || 'offre-service',
        port: Number(port),
        check: {
            http: `http://${process.env.SERVICE_HOST || 'offre-service'}:${port}/health`,
            interval: '10s'
        }
    }).then(() => {
        console.log('Registered with Consul');
    }).catch(err => console.error('Consul registration failed:', err));

    const cleanup = async () => {
        try { await consul.agent.service.deregister(id); } finally { process.exit(); }
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}