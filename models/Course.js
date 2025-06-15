const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Licence', 'Master', 'Doctorat'],
    required: true
  },
  university: {
    type: String,
    required: true
  },
  professor: {
    type: String,
    required: true
  },
  materials: [{
    title: String,
    type: String, // 'document', 'video', 'link'
    url: String,
    description: String
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema); 