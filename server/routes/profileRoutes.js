const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour les téléchargements de fichiers (spécifique aux routes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Les fichiers seront stockés dans le dossier 'uploads/'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom de fichier unique
  },
});

const upload = multer({ storage: storage });

// Toutes les routes de profil nécessitent une authentification
router.use(auth);

// Obtenir le profil de l'utilisateur actuel
router.get('/', profileController.getProfile);

// Mettre à jour le profil de l'utilisateur actuel
router.put('/', upload.single('profilePicture'), profileController.updateProfile);

module.exports = router; 