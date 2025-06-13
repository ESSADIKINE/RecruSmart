const express = require('express');
const router = express.Router();
const CandidatOffre = require('../models/candidatOffreModel');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { publishOffreEvent } = require('../config/rabbitmq');

// POST /candidatures
router.post('/', authenticateToken, async (req, res) => {
    console.log('=== Début de la requête POST /candidatures ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    try {
        const { offreId, utilisateurId } = req.body;
        console.log(`Tentative de candidature - Offre: ${offreId}, Utilisateur: ${utilisateurId}`);

        if (!offreId || !utilisateurId) {
            console.log('Erreur: offreId ou utilisateurId manquant');
            return res.status(400).json({
                message: 'offreId et utilisateurId sont requis'
            });
        }

        // Récupérer les informations du profil depuis le service-candidats
        try {
            console.log('Tentative de récupération du profil depuis le service-candidats...');
            const profilResponse = await axios.get(
                `http://localhost:8084/candidats/${utilisateurId}`,
                {
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                }
            );

            const profil = profilResponse.data;
            console.log('Profil récupéré avec succès:', profil);

            // Vérifier si l'offre existe déjà
            let offreCandidats = await CandidatOffre.findOne({ offreId });
            
            if (!offreCandidats) {
                // Créer un nouveau document pour l'offre
                offreCandidats = new CandidatOffre({
                    offreId,
                    candidats: []
                });
            }

            // Vérifier si le candidat a déjà postulé
            const candidatExistant = offreCandidats.candidats.find(
                c => c.utilisateurId === utilisateurId
            );

            if (candidatExistant) {
                console.log('Candidature déjà existante trouvée');
                return res.status(400).json({ 
                    message: 'Candidature déjà soumise pour cette offre' 
                });
            }

            // Ajouter le nouveau candidat avec toutes les informations du profil
            offreCandidats.candidats.push({
                utilisateurId,
                cv: profil.urlCv,
                score: null,
                competences: profil.competences,
                langues: profil.langues,
                anneesExperience: profil.anneesExperience,
                experiences: profil.experiences,
                educations: profil.educations,
                domaines: profil.domaines,
                niveauEtude: profil.niveauEtude,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await offreCandidats.save();
            console.log('Candidature sauvegardée avec succès:', offreCandidats);

            res.status(201).json(offreCandidats);
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error.message);
            console.error('Stack trace:', error.stack);
            return res.status(500).json({
                message: 'Erreur lors de la récupération du profil',
                error: error.message
            });
        }
    } catch (error) {
        console.error('Erreur lors de la soumission de la candidature:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            message: 'Erreur lors de la soumission de la candidature',
            error: error.message 
        });
    } finally {
        console.log('=== Fin de la requête POST /candidatures ===\n');
    }
});

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

// PUT /candidatures/offre/:offreId/candidat/:utilisateurId/score
router.put('/offre/:offreId/candidat/:utilisateurId/score', authenticateToken, async (req, res) => {
    console.log('=== Début de la requête PUT /candidatures/offre/:offreId/candidat/:utilisateurId/score ===');
    console.log('OffreId:', req.params.offreId);
    console.log('UtilisateurId:', req.params.utilisateurId);
    console.log('Score:', req.body.score);
    
    try {
        const { score } = req.body;
        if (score === undefined || score < 0 || score > 100) {
            return res.status(400).json({ message: 'Score invalide. Doit être entre 0 et 100.' });
        }

        const offreCandidats = await CandidatOffre.findOne({ offreId: req.params.offreId });
        if (!offreCandidats) {
            return res.status(404).json({ message: 'Offre non trouvée' });
        }

        const candidat = offreCandidats.candidats.find(c => c.utilisateurId === req.params.utilisateurId);
        if (!candidat) {
            return res.status(404).json({ message: 'Candidat non trouvé pour cette offre' });
        }

        candidat.score = score;
        candidat.updatedAt = new Date();

        await offreCandidats.save();
        console.log('Score mis à jour avec succès:', candidat);
        res.json(candidat);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: error.message });
    } finally {
        console.log('=== Fin de la requête PUT /candidatures/offre/:offreId/candidat/:utilisateurId/score ===\n');
    }
});

// POST /candidatures/offre/:offreId/score
router.post('/offre/:offreId/score', authenticateToken, async (req, res) => {
    console.log('=== Début du scoring automatique ===');
    console.log('OffreId:', req.params.offreId);
    
    try {
        const offreCandidats = await CandidatOffre.findOne({ offreId: req.params.offreId });
        if (!offreCandidats) {
            return res.status(404).json({ message: 'Offre non trouvée' });
        }

        // Publier l'événement pour déclencher le scoring
        await publishOffreEvent('Recruitment.Scoring.Demande', {
            offreId: req.params.offreId,
            candidats: offreCandidats.candidats.map(c => ({
                utilisateurId: c.utilisateurId,
                cv: c.cv
            }))
        });

        console.log('Événement de scoring publié avec succès');
        res.json({ message: 'Scoring en cours...' });
    } catch (error) {
        console.error('Erreur lors du déclenchement du scoring:', error);
        res.status(500).json({ message: error.message });
    } finally {
        console.log('=== Fin du scoring automatique ===\n');
    }
});

module.exports = router; 