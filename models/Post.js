const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  content: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema); 