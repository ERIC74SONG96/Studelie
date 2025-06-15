import React, { useState, useEffect } from 'react';
import { profile as profileApi } from '../api';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    university: '',
    major: '',
    graduationYear: '',
    profilePicture: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileApi.get();
      setUserData(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        university: response.data.university || '',
        major: response.data.major || '',
        graduationYear: response.data.graduationYear || '',
        profilePicture: null
      });
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      profilePicture: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profileApi.update(formData);
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  if (loading) return <div className="text-center mt-8">Chargement...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!userData) return <div className="text-center mt-8">Profil non trouvé</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-500">
          <div className="absolute -bottom-16 left-8">
            <img
              src={userData.profilePictureUrl || '/default-avatar.png'}
              alt={userData.name}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          </div>
        </div>

        <div className="pt-20 pb-8 px-8">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
                  <p className="text-gray-600">{userData.email}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Modifier le profil
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600">Bio</p>
                      <p className="text-gray-900">{userData.bio || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Université</p>
                      <p className="text-gray-900">{userData.university || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Filière</p>
                      <p className="text-gray-900">{userData.major || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Année de diplôme</p>
                      <p className="text-gray-900">{userData.graduationYear || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Photo de profil</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1 block w-full"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Université</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Filière</label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Année de diplôme</label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 