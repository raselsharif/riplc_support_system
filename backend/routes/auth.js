const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;
