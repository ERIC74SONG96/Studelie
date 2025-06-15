const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const Student = require('../models/Student'); // Pour peupler les auteurs

// Créer une nouvelle publication
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({
      content: req.body.content,
      author: req.student._id // L'ID de l'auteur vient du middleware d'authentification
    });
    await newPost.save();
    // Peupler l'auteur pour la réponse
    const populatedPost = await newPost.populate('author', 'name profilePictureUrl');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création de la publication', details: error.message });
  }
});

// Récupérer toutes les publications
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name profilePictureUrl').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des publications', details: error.message });
  }
});

// Liker/Unliker une publication
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    const isLiked = post.likes.includes(req.student._id);

    if (isLiked) {
      // Unliker
      post.likes = post.likes.filter(id => id.toString() !== req.student._id.toString());
    } else {
      // Liker
      post.likes.push(req.student._id);
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la gestion du like', details: error.message });
  }
});

// Ajouter un commentaire à une publication
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Publication non trouvée' });
    }

    const newComment = {
      text: req.body.text,
      author: req.student._id
    };

    post.comments.push(newComment);
    await post.save();
    // Peupler l'auteur du commentaire pour la réponse
    const populatedPost = await Post.findById(req.params.id).populate('author', 'name profilePictureUrl').populate('comments.author', 'name profilePictureUrl');
    res.status(201).json(populatedPost.comments);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de l\'ajout du commentaire', details: error.message });
  }
});

module.exports = router; 