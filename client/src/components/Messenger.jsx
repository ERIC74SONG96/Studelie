import React, { useState, useEffect, useRef } from 'react';
import { getConversations, sendMessage, getMessages } from '../api';
import { useAuth } from '../contexts/AuthContext';

const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0) {
        setActiveConversation(data[0]);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = await sendMessage(activeConversation._id, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="container mx-auto p-4 max-w-6xl h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-lg shadow-md h-full flex">
        {/* Liste des conversations */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversations.map(conversation => (
              <div
                key={conversation._id}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  activeConversation?._id === conversation._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {conversation.participants.find(p => p._id !== user._id)?.profilePictureUrl ? (
                    <img 
                      src={conversation.participants.find(p => p._id !== user._id)?.profilePictureUrl} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {conversation.participants.find(p => p._id !== user._id)?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {conversation.participants.find(p => p._id !== user._id)?.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.text || 'Aucun message'}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* En-tête de la conversation */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {activeConversation.participants.find(p => p._id !== user._id)?.profilePictureUrl ? (
                    <img 
                      src={activeConversation.participants.find(p => p._id !== user._id)?.profilePictureUrl} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                      {activeConversation.participants.find(p => p._id !== user._id)?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {activeConversation.participants.find(p => p._id !== user._id)?.name}
                    </h3>
                    <p className="text-sm text-gray-500">En ligne</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender._id === user._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messenger; 