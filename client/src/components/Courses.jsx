import React, { useState, useEffect } from 'react';
import { courses as coursesApi } from '../api'; // Renommer pour éviter le conflit
import CreateCourse from './CreateCourse';
import CourseCard from './CourseCard';

// Composant pour la section des échéances
const DeadlinesSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Échéances à venir</h3>
      <div className="space-y-3">
        <p className="text-gray-500 text-sm">Aucune échéance pour le moment</p>
      </div>
    </div>
  );
};

// Composant pour la section du calendrier
const CalendarSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Calendrier</h3>
      <div className="text-gray-500 text-sm">
        Le calendrier sera bientôt disponible
      </div>
    </div>
  );
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterYear, setFilterYear] = useState('2024-25'); // Default filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getAll();
        if (response.data) {
          setCourses(response.data);
        } else {
          setError('Aucune donnée reçue du serveur');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des cours:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  // Filtrage et tri côté client pour l'exemple, idéalement fait côté serveur
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    // Ajoutez d'autres logiques de tri si nécessaire
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      {/* En-tête de la page Cours */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenue Gedeon !</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de mes cours</p>
        <p className="text-sm text-gray-500">Vous trouverez ici les cours auxquels vous êtes inscrit ; pour chercher d'autres cours, rendez-vous sur la page d'accueil (cliquez sur le logo) ou en haut de page 🔍</p>
        <p className="text-sm text-blue-600 mt-1">AIDe / Help</p>
      </div>

      {/* Filtres et Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select 
          value={filterYear} 
          onChange={(e) => setFilterYear(e.target.value)} 
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="2024-25">2024-25</option>
          <option value="2023-24">2023-24</option>
        </select>
        <input
          type="text"
          placeholder="Chercher dans mes cours"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="name">Trier par nom</option>
        </select>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          {showCreateForm ? 'Annuler' : 'Créer un cours'}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateCourse onSuccess={() => {
            setShowCreateForm(false);
            // Recharger les cours après création
            coursesApi.getAll().then(response => setCourses(response.data));
          }} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section principale des cours */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 mt-8">
              Aucun cours disponible pour le moment ou ne correspond à votre recherche.
            </div>
          )}
        </div>

        {/* Barre latérale droite */}
        <div className="w-full lg:w-1/4 space-y-6">
          <DeadlinesSection />
          <CalendarSection />
        </div>
      </div>

      {/* Afficher les résultats */}
      <div className="flex justify-end items-center mt-6 text-gray-600">
        Afficher 
        <select className="ml-2 px-2 py-1 border rounded-md">
          <option>12</option>
          <option>24</option>
          <option>36</option>
        </select>
      </div>
    </div>
  );
};

export default Courses; 