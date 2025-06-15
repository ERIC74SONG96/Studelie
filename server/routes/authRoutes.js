const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/\d/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

// Inscription
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      university: req.body.university,
      country: req.body.country
    });

    await user.save();

    // Générer le token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les données de l'utilisateur (sans le mot de passe)
    res.status(201).json({
      user: user.getPublicProfile(),
      token
    });
  } catch (err) {
    console.error('Erreur d\'inscription:', err);
    res.status(500).json({
      error: 'Erreur lors de l\'inscription',
      details: err.message
    });
  }
});

// Connexion
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Générer le token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner les données de l'utilisateur (sans le mot de passe)
    res.json({
      user: user.getPublicProfile(),
      token
    });
  } catch (err) {
    console.error('Erreur de connexion:', err);
    res.status(500).json({
      error: 'Erreur lors de la connexion',
      details: err.message
    });
  }
});

// Vérifier le token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      user: user.getPublicProfile(),
      token
    });
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

// Endpoint pour lister tous les emails
router.get('/emails', async (req, res) => {
  try {
    const users = await User.find({}, 'email');
    res.json(users.map(u => u.email));
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des emails', details: err.message });
  }
});

module.exports = router; 