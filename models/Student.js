const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // à sécuriser plus tard (hash)
  university: String,
  country: String,
  avatarUrl: String,
});

// Hash password avant sauvegarde
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode pour comparer le mot de passe
studentSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Student', studentSchema); 