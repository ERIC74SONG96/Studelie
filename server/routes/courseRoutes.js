const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Student = require('../models/Student'); // Pour vérifier l'existence d'un étudiant

// Middleware pour gérer les erreurs de validation
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Obtenir tous les cours (avec pagination simple)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .populate('students', 'name email')
      .skip(skip)
      .limit(limit);

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Obtenir un cours spécifique
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Validation pour la création de cours
const courseValidationRules = [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('description').isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caractères'),
  body('subject').notEmpty().withMessage('Le sujet est requis'),
  body('level').notEmpty().withMessage('Le niveau est requis'),
  body('university').notEmpty().withMessage('L\'université est requise'),
  body('professor').notEmpty().withMessage('Le professeur est requis'),
];

// Créer un nouveau cours
router.post('/', courseValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject,
      level: req.body.level,
      university: req.body.university,
      professor: req.body.professor,
      materials: req.body.materials || []
    });

    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Mettre à jour un cours (limiter les champs modifiables)
router.patch('/:id', async (req, res) => {
  const allowedUpdates = ['title', 'description', 'subject', 'level', 'university', 'professor', 'materials'];
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    allowedUpdates.forEach(key => {
      if (req.body[key] !== undefined) {
        course[key] = req.body[key];
      }
    });

    course.updatedAt = Date.now();
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Supprimer un cours
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    await course.deleteOne();
    res.json({ message: 'Cours supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Ajouter un étudiant à un cours (vérifier que l'étudiant existe)
router.post('/:id/students', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    const student = await Student.findById(req.body.studentId);
    if (!student) return res.status(404).json({ message: 'Étudiant non trouvé' });

    if (!course.students.includes(req.body.studentId)) {
      course.students.push(req.body.studentId);
      await course.save();
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
