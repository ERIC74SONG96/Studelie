import React, { useState, useEffect } from 'react';
import { getCourses, getCurrentUser } from '../api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    assignmentsDue: 0,
    upcomingEvents: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, userData] = await Promise.all([
          getCourses(),
          getCurrentUser()
        ]);
        setCourses(coursesData);
        setUser(userData);
        
        // Calculer les statistiques
        setStats({
          coursesEnrolled: coursesData.length,
          assignmentsDue: coursesData.reduce((acc, course) => acc + (course.assignments?.length || 0), 0),
          upcomingEvents: coursesData.reduce((acc, course) => acc + (course.events?.length || 0), 0),
          recentActivities: coursesData
            .flatMap(course => course.activities || [])
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
        });
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur !</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* En-tête du tableau de bord */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          {user?.profilePictureUrl ? (
            <img 
              src={user.profilePictureUrl} 
              alt={user.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">
              {user?.university} • {user?.major}
            </p>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700">Cours inscrits</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.coursesEnrolled}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-700">Devoirs à rendre</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.assignmentsDue}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Événements à venir</h3>
            <p className="text-3xl font-bold text-green-600">{stats.upcomingEvents}</p>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes cours
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calendrier
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Activités récentes</h2>
            <div className="space-y-4">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📚</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Mes cours</h2>
              <Link
                to="/courses"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Voir tous les cours
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((course) => (
                <div key={course._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{course.professor}</span>
                    <span>{course.schedule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Calendrier</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-center">
                Le calendrier sera bientôt disponible
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 