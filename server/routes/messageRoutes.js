const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Toutes les routes de messages nécessitent une authentification
router.use(auth);

// Obtenir toutes les conversations ou messages récents
router.get('/', messageController.getConversations);

// Obtenir les messages d'une conversation spécifique avec un autre utilisateur
router.get('/conversation/:userId', messageController.getConversation);

// Envoyer un nouveau message
router.post('/', messageController.sendMessage);

module.exports = router; 