const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint: POST /api/v1/auth/register
router.post('/register', authController.register);

// Endpoint: POST /api/v1/auth/login
router.post('/login', authController.login);

module.exports = router;