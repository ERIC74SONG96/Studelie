const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

// Routes protégées par l'authentification
router.use(auth);

// Obtenir la liste des amis
router.get('/', friendController.getFriends);

// Obtenir les suggestions d'amis
router.get('/suggestions', friendController.getFriendSuggestions);

// Ajouter un ami
router.post('/:userId', friendController.addFriend);

// Supprimer un ami
router.delete('/:userId', friendController.removeFriend);

module.exports = router; 