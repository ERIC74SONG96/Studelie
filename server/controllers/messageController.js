const Message = require('../models/Message');
const User = require('../models/User');

// Obtenir toutes les conversations de l'utilisateur actuel
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$text' },
          lastMessageCreatedAt: { $first: '$createdAt' },
          isRead: { $first: '$isRead' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          _id: 0,
          participant: {
            _id: '$participant._id',
            name: '$participant.name',
            profilePictureUrl: '$participant.profilePictureUrl'
          },
          lastMessage: 1,
          lastMessageCreatedAt: 1,
          isRead: 1
        }
      },
      {
        $sort: { lastMessageCreatedAt: -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations' });
  }
};

// Obtenir les messages d'une conversation spécifique
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender receiver', 'name profilePictureUrl');

    // Marquer les messages comme lus si l'utilisateur actuel est le récepteur
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la conversation' });
  }
};

// Envoyer un nouveau message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !text) {
      return res.status(400).json({ message: 'Récepteur et texte du message sont requis.' });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text
    });

    await message.save();
    await message.populate('sender receiver', 'name profilePictureUrl');

    // Émettre un événement pour les notifications en temps réel
    req.app.get('io').emit('newMessage', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
}; 