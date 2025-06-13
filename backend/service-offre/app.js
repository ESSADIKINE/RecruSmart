const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const offreRoutes = require('./routes/offreRoutes');
const candidatOffreRoutes = require('./routes/candidatOffreRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/offres', offreRoutes);
app.use('/candidatures', candidatOffreRoutes);

// Gestion des erreurs 404
app.use((req, res, next) => {
    console.log(`Route non trouvée: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log('Routes disponibles:');
    console.log('- POST /candidatures');
    console.log('- GET /candidatures/offre/:offreId');
    console.log('- GET /candidatures/utilisateur/:utilisateurId');
}); 