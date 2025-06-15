const User = require('../models/User');

// Obtenir le profil de l'utilisateur actuel
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Profil utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour le profil de l'utilisateur actuel
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio, university, major, graduationYear } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Profil utilisateur non trouvé' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.university = university || user.university;
    user.major = major || user.major;
    user.graduationYear = graduationYear || user.graduationYear;

    if (req.file) {
      user.profilePictureUrl = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 