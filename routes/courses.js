const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Obtenir tous les cours
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('students', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un cours spécifique
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Créer un nouveau cours
router.post('/', async (req, res) => {
  const course = new Course({
    title: req.body.title,
    description: req.body.description,
    subject: req.body.subject,
    level: req.body.level,
    university: req.body.university,
    professor: req.body.professor,
    materials: req.body.materials || []
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mettre à jour un cours
router.patch('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    Object.keys(req.body).forEach(key => {
      course[key] = req.body[key];
    });
    course.updatedAt = Date.now();

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un cours
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    await course.remove();
    res.json({ message: 'Cours supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ajouter un étudiant à un cours
router.post('/:id/students', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    if (!course.students.includes(req.body.studentId)) {
      course.students.push(req.body.studentId);
      await course.save();
    }

    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 