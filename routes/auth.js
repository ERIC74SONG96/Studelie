const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

// Inscription
router.post('/signup', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ student, token });
  } catch (err) {
    res.status(400).json({ error: 'Inscription échouée', details: err.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email });
  if (!student) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const valid = await student.comparePassword(password);
  if (!valid) return res.status(401).json({ error: "Mot de passe incorrect" });

  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ student, token });
});

module.exports = router; 