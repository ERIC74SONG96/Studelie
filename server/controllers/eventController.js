const Event = require('../models/Event');
const User = require('../models/User');

// Créer un nouvel événement
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, date, isPublic } = req.body;
    const organizer = req.user._id;

    const event = new Event({
      title,
      description,
      location,
      date,
      organizer,
      isPublic
    });

    await event.save();
    await event.populate('organizer', 'name email');
    res.status(201).json(event);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
  }
};

// Obtenir tous les événements
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'name email profilePictureUrl')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
};

// Obtenir un événement par ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePictureUrl')
      .populate('attendees', 'name email profilePictureUrl');
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json(event);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement' });
  }
};

// Mettre à jour un événement
exports.updateEvent = async (req, res) => {
  try {
    const { title, description, location, date, isPublic } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Seul l'organisateur peut modifier l'événement
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé à modifier cet événement' });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.location = location || event.location;
    event.date = date || event.date;
    event.isPublic = isPublic !== undefined ? isPublic : event.isPublic;

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Seul l'organisateur peut supprimer l'événement
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cet événement' });
    }

    await event.deleteOne();
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
  }
};

// S'inscrire à un événement
exports.attendEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
    }
    res.json(event.attendees);
  } catch (error) {
    console.error('Erreur lors de l\'inscription à l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription à l\'événement' });
  }
};

// Se désinscrire d'un événement
exports.unattendEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    event.attendees = event.attendees.filter(id => id.toString() !== userId.toString());
    await event.save();
    res.json(event.attendees);
  } catch (error) {
    console.error('Erreur lors de la désinscription à l\'événement:', error);
    res.status(500).json({ message: 'Erreur lors de la désinscription à l\'événement' });
  }
}; 