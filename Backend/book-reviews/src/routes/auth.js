// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth'); // Asegúrate de tener este middleware

router.post('/register', authController.registerUser);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.loguot); // Logout protegido

module.exports = router;