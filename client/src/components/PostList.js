import React, { useState, useEffect } from 'react';
import { posts } from '../api';
import PostForm from './PostForm';

const PostList = () => {
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'liked', 'commented'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState({});
  const [isLiked, setIsLiked] = useState({});
  const [isLoved, setIsLoved] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await posts.getAll();
      setPostList(response.data);
      // Initialiser les états des réactions
      const likedPosts = {};
      const lovedPosts = {};
      response.data.forEach(post => {
        likedPosts[post._id] = post.userReactions?.includes('like') || false;
        lovedPosts[post._id] = post.userReactions?.includes('love') || false;
      });
      setIsLiked(likedPosts);
      setIsLoved(lovedPosts);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des publications');
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPostList([newPost, ...postList]);
  };

  const handleReaction = async (postId, type) => {
    try {
      await posts.addReaction(postId, type);
      // Mettre à jour l'état local immédiatement pour une meilleure UX
      if (type === 'like') {
        setIsLiked(prev => ({
          ...prev,
          [postId]: !prev[postId]
        }));
      } else if (type === 'love') {
        setIsLoved(prev => ({
          ...prev,
          [postId]: !prev[postId]
        }));
      }
      fetchPosts();
    } catch (err) {
      setError('Erreur lors de l\'ajout de la réaction');
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    try {
      await posts.addComment(postId, { text: commentText[postId] });
      setCommentText({ ...commentText, [postId]: '' });
      setShowCommentForm({ ...showCommentForm, [postId]: false });
      fetchPosts();
    } catch (err) {
      setError('Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleShare = async (postId) => {
    try {
      await navigator.share({
        title: 'Publication Studelie',
        text: 'Regardez cette publication sur Studelie !',
        url: `${window.location.origin}/post/${postId}`
      });
    } catch (err) {
      console.error('Erreur lors du partage:', err);
    }
  };

  const filteredAndSortedPosts = postList
    .filter(post => {
      // Filtre par recherche
      if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Filtre par tags
      if (selectedTags.length > 0 && !selectedTags.every(tag => post.tags?.includes(tag))) {
        return false;
      }
      // Filtre par type
      switch (filter) {
        case 'liked':
          return isLiked[post._id];
        case 'commented':
          return post.comments?.length > 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.reactions?.like + b.reactions?.love + b.comments?.length) - 
               (a.reactions?.like + a.reactions?.love + a.comments?.length);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

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
      <div className="mb-8">
        <PostForm onPostCreated={handlePostCreated} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher des publications..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les publications</option>
            <option value="liked">Publications likées</option>
            <option value="commented">Publications commentées</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Plus récentes</option>
            <option value="popular">Plus populaires</option>
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Fil d'actualité</h2>
      
      {filteredAndSortedPosts.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2 text-gray-600">Aucune publication ne correspond à vos critères.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedPosts.map(post => (
            <div key={post._id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={post.author.profilePictureUrl || '/default-avatar.png'}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg">{post.author.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-700 mb-4 text-lg leading-relaxed">{post.content}</p>

              {post.media && post.media.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {post.media.map((media, index) => (
                    <img
                      key={index}
                      src={media}
                      alt={`Media ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-blue-200 cursor-pointer"
                      onClick={() => setSelectedTags([...selectedTags, tag])}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-gray-600 mb-4">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleReaction(post._id, 'like')}
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      isLiked[post._id] ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    <span className="text-xl">👍</span>
                    <span>{post.reactions?.like || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(post._id, 'love')}
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      isLoved[post._id] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <span className="text-xl">❤️</span>
                    <span>{post.reactions?.love || 0}</span>
                  </button>
                  <button
                    onClick={() => setShowCommentForm({ ...showCommentForm, [post._id]: !showCommentForm[post._id] })}
                    className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments?.length || 0}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleShare(post._id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Partager</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-4">
                  {post.comments?.slice(0, 3).map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-3">
                      <img
                        src={comment.author.profilePictureUrl || '/default-avatar.png'}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-700">{comment.author.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {post.comments?.length > 3 && (
                    <button
                      onClick={() => setShowCommentForm({ ...showCommentForm, [post._id]: true })}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Voir tous les commentaires ({post.comments.length})
                    </button>
                  )}

                  {showCommentForm[post._id] && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={commentText[post._id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                        placeholder="Ajouter un commentaire..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => setShowCommentForm({ ...showCommentForm, [post._id]: false })}
                          className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleComment(post._id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Commenter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList; 