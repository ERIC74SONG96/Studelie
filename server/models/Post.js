const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
    default: 'like'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: String,
  description: String
});

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Student' // Référence au modèle Student
  },
  media: [mediaSchema],
  location: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  reactions: [reactionSchema],
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student'
    },
    reactions: [reactionSchema],
    media: [mediaSchema],
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
      },
      reactions: [reactionSchema],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  sharedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la recherche
postSchema.index({ content: 'text', tags: 'text' });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'reactions.user': 1 });
postSchema.index({ privacy: 1 });

// Middleware pour mettre à jour updatedAt
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode pour obtenir le nombre total de réactions
postSchema.methods.getTotalReactions = function() {
  return this.reactions.length;
};

// Méthode pour obtenir le nombre de réactions par type
postSchema.methods.getReactionsByType = function() {
  return this.reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {});
};

module.exports = mongoose.model('Post', postSchema); 