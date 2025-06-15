import React, { useState } from 'react';
import { posts } from '../api';

const PostForm = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    content: '',
    media: [],
    tags: [],
    privacy: 'public',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...files]
    }));
  };

  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await posts.create(formData);
      setFormData({
        content: '',
        media: [],
        tags: [],
        privacy: 'public',
        location: ''
      });
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Quoi de neuf ?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ajouter des médias
          </label>
          {formData.media.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {formData.media.length} fichier(s) sélectionné(s)
              </p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagChange}
            placeholder="Tags (séparés par des virgules)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="public">Public</option>
            <option value="friends">Amis uniquement</option>
            <option value="private">Privé</option>
          </select>
        </div>

        <div className="mb-4">
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Lieu (optionnel)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Publication en cours...' : 'Publier'}
        </button>
      </form>
    </div>
  );
};

export default PostForm; 