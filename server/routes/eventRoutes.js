const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Toutes les routes d'événements nécessitent une authentification
router.use(auth);

// Créer un nouvel événement
router.post('/', eventController.createEvent);

// Obtenir tous les événements
router.get('/', eventController.getEvents);

// Obtenir un événement par ID
router.get('/:id', eventController.getEventById);

// Mettre à jour un événement
router.put('/:id', eventController.updateEvent);

// Supprimer un événement
router.delete('/:id', eventController.deleteEvent);

// S'inscrire à un événement
router.post('/:id/attend', eventController.attendEvent);

// Se désinscrire d'un événement
router.delete('/:id/attend', eventController.unattendEvent);

module.exports = router; 