const express = require('express');
const router = express.Router();
const offreController = require('../controllers/offreController');
const verifyJwt = require('../middleware/authMiddleware');

// Créer une offre (RECRUTEUR)
router.post('/', verifyJwt(['RECRUTEUR']), offreController.createOffre);
// Modifier une offre (RECRUTEUR)
router.put('/:id', verifyJwt(['RECRUTEUR']), offreController.updateOffre);
// Supprimer une offre (RECRUTEUR)
router.delete('/:id', verifyJwt(['RECRUTEUR']), offreController.deleteOffre);
// Récupérer toutes les offres (public)
router.get('/', offreController.getAllOffres);
// Récupérer une offre par ID (public)
router.get('/:id', offreController.getOffreById);

module.exports = router; 