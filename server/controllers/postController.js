const Post = require('../models/Post');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour le stockage des médias
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'));
    }
  }
}).array('media', 5);

// Créer une nouvelle publication
exports.createPost = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { content, tags, privacy, location } = req.body;
      const userId = req.user.id;

      const media = req.files ? req.files.map(file => ({
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        url: `/uploads/${file.filename}`,
        thumbnail: file.mimetype.startsWith('image/') ? `/uploads/${file.filename}` : null
      })) : [];

      const post = new Post({
        content,
        tags: tags ? JSON.parse(tags) : [],
        privacy: privacy || 'public',
        location,
        media,
        author: userId
      });

      await post.save();
      await post.populate('author', 'name profilePictureUrl');

      // Émettre un événement pour les notifications en temps réel
      req.app.get('io').emit('newPost', post);

      res.status(201).json(post);
    });
  } catch (error) {
    console.error('Erreur lors de la création de la publication:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la publication' });
  }
};

// Obtenir toutes les publications
exports.getPosts = async (req, res) => {
  try {
    const { tag, search, sort = 'recent', privacy = 'public' } = req.query;
    const userId = req.user.id;

    let query = { privacy };

    // Si l'utilisateur demande ses propres posts ou ceux de ses amis
    if (privacy === 'friends') {
      const user = await User.findById(userId);
      query.author = { $in: [...user.friends, userId] };
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { 'reactions.length': -1 };
        break;
      case 'trending':
        // Calculer un score de tendance basé sur les réactions et commentaires récents
        sortOptions = {
          $expr: {
            $add: [
              { $size: '$reactions' },
              { $multiply: [{ $size: '$comments' }, 2] }
            ]
          }
        };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .sort(sortOptions)
      .populate('author', 'name profilePictureUrl')
      .populate('comments.author', 'name profilePictureUrl')
      .populate('comments.replies.author', 'name profilePictureUrl');

    res.json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des publications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des publications' });
  }
};

// Like/Unlike une publication
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée' });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error('Erreur lors du like/unlike:', error);
    res.status(500).json({ message: 'Erreur lors du like/unlike' });
  }
};

// Ajouter une réaction
exports.addReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée' });
    }

    // Vérifier si l'utilisateur a déjà réagi
    const existingReaction = post.reactions.find(r => r.user.toString() === userId);
    if (existingReaction) {
      // Mettre à jour la réaction existante
      existingReaction.type = type;
      existingReaction.createdAt = new Date();
    } else {
      // Ajouter une nouvelle réaction
      post.reactions.push({ user: userId, type });
    }

    await post.save();

    // Émettre un événement pour les notifications en temps réel
    req.app.get('io').emit('postReaction', {
      postId,
      reaction: post.reactions[post.reactions.length - 1]
    });

    res.json(post.reactions);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la réaction' });
  }
};

// Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée' });
    }

    if (parentCommentId) {
      // Ajouter une réponse à un commentaire existant
      const parentComment = post.comments.id(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Commentaire parent non trouvé' });
      }

      parentComment.replies.push({
        text,
        author: userId
      });
    } else {
      // Ajouter un nouveau commentaire
      post.comments.push({
        text,
        author: userId
      });
    }

    await post.save();
    await post.populate('comments.author', 'name profilePictureUrl');
    await post.populate('comments.replies.author', 'name profilePictureUrl');

    // Émettre un événement pour les notifications en temps réel
    req.app.get('io').emit('newComment', {
      postId,
      comment: post.comments[post.comments.length - 1]
    });

    res.json(post.comments);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
  }
};

// Partager une publication
exports.sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, privacy } = req.body;
    const userId = req.user.id;

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: 'Publication originale non trouvée' });
    }

    const sharedPost = new Post({
      content: content || originalPost.content,
      media: originalPost.media,
      tags: originalPost.tags,
      privacy: privacy || originalPost.privacy,
      location: originalPost.location,
      author: userId,
      originalPost: postId,
      sharedFrom: originalPost.author
    });

    await sharedPost.save();
    await sharedPost.populate('author', 'name profilePictureUrl');
    await sharedPost.populate('originalPost', 'content');
    await sharedPost.populate('sharedFrom', 'name profilePictureUrl');

    // Émettre un événement pour les notifications en temps réel
    req.app.get('io').emit('postShared', sharedPost);

    res.status(201).json(sharedPost);
  } catch (error) {
    console.error('Erreur lors du partage de la publication:', error);
    res.status(500).json({ message: 'Erreur lors du partage de la publication' });
  }
};

// Obtenir les publications suggérées (pour le feed personnalisé)
exports.getSuggestedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Pour l'exemple, renvoie toutes les publications. Dans une vraie application,
    // cela pourrait être basé sur les amis, les intérêts, les cours, etc.
    const posts = await Post.find({ privacy: 'public' })
      .sort({ createdAt: -1 })
      .populate('author', 'name profilePictureUrl')
      .populate('comments.author', 'name profilePictureUrl');

    res.json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des publications suggérées:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des publications suggérées' });
  }
};

// Obtenir les tags populaires
exports.getPopularTags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(tags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags populaires:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tags populaires' });
  }
};

module.exports = exports; 