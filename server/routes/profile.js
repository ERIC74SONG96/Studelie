const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// Obtenir le profil de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    // req.student est ajouté par le middleware d'authentification
    res.json(req.student);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil', details: error.message });
  }
});

// Mettre à jour le profil de l'utilisateur connecté
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'university', 'country', 'profilePictureUrl', 'bio', 'major', 'degree', 'graduationYear', 'skills', 'interests', 'linkedinUrl', 'githubUrl', 'websiteUrl'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Mises à jour invalides !' });
  }

  try {
    // req.student est ajouté par le middleware d'authentification
    updates.forEach((update) => (req.student[update] = req.body[update]));
    await req.student.save();
    res.json(req.student);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour du profil', details: error.message });
  }
});

// Obtenir le profil d'un étudiant par ID (pour les autres utilisateurs)
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil de l\'étudiant', details: error.message });
  }
});

module.exports = router; 