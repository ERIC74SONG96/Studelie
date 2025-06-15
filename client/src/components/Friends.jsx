import React, { useState, useEffect } from 'react';
import { getFriends, getFriendSuggestions, addFriend, removeFriend } from '../api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [friendsData, suggestionsData] = await Promise.all([
        getFriends(),
        getFriendSuggestions()
      ]);
      setFriends(friendsData);
      setSuggestions(suggestionsData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await addFriend(userId);
      setSuggestions(suggestions.filter(user => user._id !== userId));
      // Rafraîchir la liste des amis
      const updatedFriends = await getFriends();
      setFriends(updatedFriends);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout de l\'ami');
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await removeFriend(userId);
      setFriends(friends.filter(friend => friend._id !== userId));
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de l\'ami');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur !</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === 'friends' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mes Amis ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === 'suggestions' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
        </div>

        {activeTab === 'friends' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map(friend => (
              <div key={friend._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                  {friend.profilePictureUrl ? (
                    <img 
                      src={friend.profilePictureUrl} 
                      alt={friend.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{friend.name}</h3>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleRemoveFriend(friend._id)}
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map(user => (
              <div key={user._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                  {user.profilePictureUrl ? (
                    <img 
                      src={user.profilePictureUrl} 
                      alt={user.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.mutualFriends > 0 && (
                      <p className="text-sm text-blue-500">
                        {user.mutualFriends} ami(s) en commun
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleAddFriend(user._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends; 