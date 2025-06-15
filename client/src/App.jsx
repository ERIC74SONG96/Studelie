import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import PostList from './components/PostList';
import Dashboard from './components/Dashboard';
import Friends from './components/Friends';
import Messenger from './components/Messenger';
import Courses from './components/Courses';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const { isAuthenticated, logout } = useAuth();

        return (
    <div className="min-h-screen bg-gray-100">
        {isAuthenticated && (
          <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <Link to="/" className="text-xl font-bold text-blue-600">
                    Studelie
                  </Link>
                  <div className="hidden md:flex space-x-4">
                    <Link to="/" className="text-gray-600 hover:text-blue-600">
                      Actualités
                    </Link>
                    <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
                      Tableau de bord
                    </Link>
                    <Link to="/courses" className="text-gray-600 hover:text-blue-600">
                      Cours
                    </Link>
                    <Link to="/friends" className="text-gray-600 hover:text-blue-600">
                      Amis
                    </Link>
                    <Link to="/messenger" className="text-gray-600 hover:text-blue-600">
                      Messages
                    </Link>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                    <span>Déconnexion</span>
                  </button>
                </div>
            </div>
            </div>
        </nav>
        )}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={isAuthenticated ? <PostList /> : <Login />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Login />} />
          <Route path="/courses" element={isAuthenticated ? <Courses /> : <Login />} />
          <Route path="/friends" element={isAuthenticated ? <Friends /> : <Login />} />
          <Route path="/messenger" element={isAuthenticated ? <Messenger /> : <Login />} />
        </Routes>
          </div>
  );
};

export default App; 