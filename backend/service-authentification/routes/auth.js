const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin, isAdminOrRecruteur } = require('../middlewares/roleMiddleware');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/me', authMiddleware, authController.getMe);
router.put('/me', authMiddleware, authController.updateMe);

// Routes admin
router.get('/users', authMiddleware, isAdmin, authController.getAllUsers);
router.get('/users/:id', authMiddleware, isAdmin, authController.getUserById);
router.put('/users/:id', authMiddleware, isAdmin, authController.updateUser);
router.delete('/users/:id', authMiddleware, isAdmin, authController.deleteUser);

module.exports = router; 