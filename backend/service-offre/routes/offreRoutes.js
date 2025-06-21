const express = require('express');
const router = express.Router();
const offreController = require('../controllers/offreController');
const CandidatOffre = require('../models/candidatOffreModel');
const verifyJwt = require('../middleware/authMiddleware');
const { envoyerOffresJour, selectionnerCandidat } = require('../controllers/offreController');

// Routes pour les offres
router.post('/', verifyJwt(), offreController.createOffre);
router.get('/admin', verifyJwt(['ADMIN']), offreController.getAllOffresAdmin);
router.get('/mes-offres', verifyJwt(['RECRUTEUR']), offreController.getMesOffres);
router.get('/', verifyJwt(), offreController.searchOffres);
router.get('/:offreId/candidats-recruteur', verifyJwt(['RECRUTEUR']), offreController.getCandidatsRecruteur);
router.get('/:id', offreController.getOffreById);
router.put('/:id', verifyJwt(), offreController.updateOffre);
router.delete('/:id', verifyJwt(), offreController.deleteOffre);

// Route pour déclencher le scoring
router.post('/:id/score', verifyJwt(), offreController.triggerScoring);

// Route pour mettre à jour le score d'un candidat
router.put('/:offreId/candidat/:candidatId/score', verifyJwt(), offreController.updateCandidatScore);

// Routes pour les candidats
router.post('/:offreId/candidats', verifyJwt(), offreController.addCandidatToOffre);
router.get('/:offreId/candidats', verifyJwt(), offreController.getCandidatsForOffre);
router.put(
  '/:offreId/candidat/:utilisateurId/score',
  verifyJwt(),
  offreController.updateCandidatScore,
);
// Route pour obtenir les candidatures d'un utilisateur
router.get('/candidats/utilisateur/:utilisateurId', verifyJwt(), offreController.getCandidaturesUtilisateur);

router.post('/envoyer-offres-jour', envoyerOffresJour);
router.post('/selectionner-candidat', selectionnerCandidat);

module.exports = router; 