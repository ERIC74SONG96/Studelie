const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Routes protégées par l'authentification
router.use(auth);

// Créer une publication
router.post('/', postController.createPost);

// Obtenir toutes les publications
router.get('/', postController.getPosts);

// Obtenir les suggestions de publications
router.get('/suggested', postController.getSuggestedPosts);

// Ajouter une réaction
router.post('/:postId/reaction', postController.addReaction);

// Ajouter un commentaire
router.post('/:postId/comment', postController.addComment);

// Partager une publication
router.post('/:postId/share', postController.sharePost);

// Obtenir les tags populaires
router.get('/tags/popular', postController.getPopularTags);

module.exports = router; 