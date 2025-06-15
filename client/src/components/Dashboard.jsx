import React, { useState, useEffect } from 'react';
import { getCourses, getCurrentUser } from '../api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, userData] = await Promise.all([
          getCourses(),
          getCurrentUser()
        ]);
        setCourses(coursesData);
        setUser(userData);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-6">
              {user?.profilePictureUrl ? (
                <img 
                  src={user.profilePictureUrl} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('courses')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'courses' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Mes Cours
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'groups' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Mes Groupes
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'calendar' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Calendrier
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'grades' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Notes
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {activeTab === 'courses' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Cours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                      {course.imageUrl && (
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h3 className="text-white font-bold text-lg">{course.title}</h3>
                        <p className="text-white text-sm">{course.professor}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{course.schedule}</span>
                        <span className="text-sm text-gray-500">{course.room}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Progression</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${course.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                          Voir le cours
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Groupes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.groups?.map(group => (
                  <div key={group._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {group.members.length} membres
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{group.description}</p>
                    <div className="flex items-center space-x-2">
                      {group.members.slice(0, 3).map(member => (
                        <div key={member._id} className="relative">
                          {member.profilePictureUrl ? (
                            <img 
                              src={member.profilePictureUrl} 
                              alt={member.name} 
                              className="w-8 h-8 rounded-full object-cover border-2 border-white"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      ))}
                      {group.members.length > 3 && (
                        <span className="text-sm text-gray-500">
                          +{group.members.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Calendrier</h2>
              <div className="grid grid-cols-7 gap-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-sm text-gray-500">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Notes</h2>
              <div className="space-y-6">
                {courses.map(course => (
                  <div key={course._id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
                      <span className="text-lg font-bold text-blue-500">
                        {course.grade || 'N/A'}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {course.assignments?.map(assignment => (
                        <div key={assignment._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-700">{assignment.title}</p>
                            <p className="text-sm text-gray-500">{assignment.date}</p>
                          </div>
                          <span className="font-medium text-gray-700">{assignment.grade || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 