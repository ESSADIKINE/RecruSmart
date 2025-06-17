const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const offreRoutes = require('./routes/offreRoutes');
const candidatOffreRoutes = require('./routes/candidatOffreRoutes');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/offres', offreRoutes);
app.use('/candidatures', candidatOffreRoutes);

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
        });
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    }); 