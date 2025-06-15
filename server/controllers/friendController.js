const User = require('../models/User');
const Friend = require('../models/Friend');

// Obtenir la liste des amis
exports.getFriends = async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    }).populate('user1 user2', 'name email profilePictureUrl');

    const formattedFriends = friends.map(friend => {
      const friendUser = friend.user1._id.equals(req.user._id) ? friend.user2 : friend.user1;
      return {
        _id: friendUser._id,
        name: friendUser.name,
        email: friendUser.email,
        profilePictureUrl: friendUser.profilePictureUrl
      };
    });

    res.json(formattedFriends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les suggestions d'amis
exports.getFriendSuggestions = async (req, res) => {
  try {
    // Obtenir les IDs des amis actuels
    const friends = await Friend.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    });

    const friendIds = friends.map(friend => 
      friend.user1.equals(req.user._id) ? friend.user2 : friend.user1
    );

    // Trouver les utilisateurs qui ne sont pas déjà amis
    const suggestions = await User.find({
      _id: { 
        $nin: [...friendIds, req.user._id]
      }
    }).select('name email profilePictureUrl');

    // Calculer les amis en commun pour chaque suggestion
    const suggestionsWithMutualFriends = await Promise.all(
      suggestions.map(async (user) => {
        const mutualFriends = await Friend.countDocuments({
          $or: [
            { user1: user._id, user2: { $in: friendIds } },
            { user2: user._id, user1: { $in: friendIds } }
          ]
        });

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePictureUrl: user.profilePictureUrl,
          mutualFriends
        };
      })
    );

    res.json(suggestionsWithMutualFriends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter un ami
exports.addFriend = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'amitié existe déjà
    const existingFriendship = await Friend.findOne({
      $or: [
        { user1: req.user._id, user2: userId },
        { user1: userId, user2: req.user._id }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Vous êtes déjà amis' });
    }

    // Créer la nouvelle amitié
    const friendship = new Friend({
      user1: req.user._id,
      user2: userId
    });

    await friendship.save();

    res.status(201).json({ message: 'Ami ajouté avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un ami
exports.removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;

    const friendship = await Friend.findOneAndDelete({
      $or: [
        { user1: req.user._id, user2: userId },
        { user1: userId, user2: req.user._id }
      ]
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Amitié non trouvée' });
    }

    res.json({ message: 'Ami supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 