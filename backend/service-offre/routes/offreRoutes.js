const express = require('express');
const router = express.Router();
const offreController = require('../controllers/offreController');
const { authenticateToken } = require('../middleware/auth');

// Routes pour les offres
router.post('/', authenticateToken, offreController.createOffre);
router.get('/', offreController.getAllOffres);
router.get('/:id', offreController.getOffreById);
router.put('/:id', authenticateToken, offreController.updateOffre);
router.delete('/:id', authenticateToken, offreController.deleteOffre);

// Routes pour les candidats
router.post('/:offreId/candidats', authenticateToken, offreController.addCandidatToOffre);
router.get('/:offreId/candidats', authenticateToken, offreController.getCandidatsForOffre);
router.put('/:offreId/candidats/:utilisateurId/score', authenticateToken, offreController.updateCandidatScore);

module.exports = router; 