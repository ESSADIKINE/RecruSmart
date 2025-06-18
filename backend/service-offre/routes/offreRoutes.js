const express = require('express');
const router = express.Router();
const offreController = require('../controllers/offreController');
const CandidatOffre = require('../models/candidatOffreModel');
const { authenticateToken } = require('../middleware/auth');

// Routes pour les offres
router.post('/', authenticateToken, offreController.createOffre);
router.get('/', offreController.getAllOffres);
router.get('/:id', offreController.getOffreById);
router.put('/:id', authenticateToken, offreController.updateOffre);
router.delete('/:id', authenticateToken, offreController.deleteOffre);

// Route pour déclencher le scoring
router.post('/:id/score', authenticateToken, offreController.triggerScoring);

// Route pour mettre à jour le score d'un candidat
router.put('/:offreId/candidat/:candidatId/score', authenticateToken, async (req, res) => {
    try {
        const { offreId, candidatId } = req.params;
        const { score } = req.body;

        console.log(`Mise à jour du score pour l'offre ${offreId} et le candidat ${candidatId}`);
        console.log(`Score à mettre à jour: ${score}`);

        const result = await CandidatOffre.findOneAndUpdate(
            { 
                offreId,
                'candidats.utilisateurId': candidatId 
            },
            { 
                $set: { 
                    'candidats.$.score': score 
                }
            },
            { new: true }
        );

        if (!result) {
            console.log(`Candidat non trouvé pour l'offre ${offreId} et le candidat ${candidatId}`);
            return res.status(404).json({ message: "Candidat non trouvé" });
        }

        console.log(`Score mis à jour avec succès pour l'offre ${offreId} et le candidat ${candidatId}`);
        res.json({ message: "Score mis à jour avec succès" });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du score:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du score",
            error: error.message 
        });
    }
});

// Routes pour les candidats
router.post('/:offreId/candidats', authenticateToken, offreController.addCandidatToOffre);
router.get('/:offreId/candidats', authenticateToken, offreController.getCandidatsForOffre);
router.put(
  '/:offreId/candidat/:utilisateurId/score',
  authenticateToken,
  offreController.updateCandidatScore,
);
// Route pour obtenir les candidatures d'un utilisateur
router.get('/candidats/utilisateur/:utilisateurId', authenticateToken, async (req, res) => {
    try {
        const offresCandidats = await CandidatOffre.find({
            'candidats.utilisateurId': req.params.utilisateurId
        });
        
        const candidatures = offresCandidats
            .filter(offre => offre.candidats && Array.isArray(offre.candidats))
            .map(offre => ({
                offreId: offre.offreId,
                candidature: offre.candidats.find(c => c.utilisateurId === req.params.utilisateurId)
            }))
            .filter(item => item.candidature != null);
        
        res.json(candidatures);
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des candidatures",
            error: error.message 
        });
    }
});

module.exports = router; 