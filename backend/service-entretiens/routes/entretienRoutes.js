const express = require('express');
const router = express.Router();
const entretienController = require('../controllers/entretienController');
const verifyJwt = require('../middleware/authMiddleware');

router.use(verifyJwt);

router.post('/', entretienController.createEntretien);
router.get('/', entretienController.getEntretiens);
router.get('/:id', entretienController.getEntretienById);
router.put('/:id', entretienController.updateEntretien);
router.delete('/:id', entretienController.deleteEntretien);

module.exports = router; 