const express = require('express');
const router = express.Router();
const CandidatOffre = require('../models/candidatOffreModel');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

// GET /candidatures/offre/:offreId
router.get('/offre/:offreId', authenticateToken, async (req, res) => {
    console.log('=== Début de la requête GET /candidatures/offre/:offreId ===');
    console.log('OffreId:', req.params.offreId);
    
    try {
        const offreCandidats = await CandidatOffre.findOne({ offreId: req.params.offreId });
        if (!offreCandidats) {
            return res.json({ offreId: req.params.offreId, candidats: [] });
        }
        
        // Trier les candidats par score (les null en dernier)
        offreCandidats.candidats.sort((a, b) => {
            if (a.score === null) return 1;
            if (b.score === null) return -1;
            return b.score - a.score;
        });
        
        console.log('Candidatures trouvées:', offreCandidats);
        res.json(offreCandidats);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: error.message });
    } finally {
        console.log('=== Fin de la requête GET /candidatures/offre/:offreId ===\n');
    }
});

// GET /candidatures/utilisateur/:utilisateurId
router.get('/utilisateur/:utilisateurId', authenticateToken, async (req, res) => {
    console.log('=== Début de la requête GET /candidatures/utilisateur/:utilisateurId ===');
    console.log('UtilisateurId:', req.params.utilisateurId);
    
    try {
        const offresCandidats = await CandidatOffre.find({
            'candidats.utilisateurId': req.params.utilisateurId
        });
        
        // Filtrer pour ne garder que les candidatures de l'utilisateur
        const candidatures = offresCandidats.map(offre => ({
            offreId: offre.offreId,
            candidature: offre.candidats.find(c => c.utilisateurId === req.params.utilisateurId)
        }));
        
        console.log('Candidatures trouvées:', candidatures);
        res.json(candidatures);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: error.message });
    } finally {
        console.log('=== Fin de la requête GET /candidatures/utilisateur/:utilisateurId ===\n');
    }
});

module.exports = router; 