import React from 'react';
import { Link } from 'react-router-dom';

const LeftSidebar = () => {
  const navItems = [
    { name: 'Profil', icon: '👤', path: '/profile' },
    { name: 'Cours', icon: '📚', path: '/courses' },
    { name: 'Amis', icon: '🤝', path: '/friends' },
    { name: 'Groupes', icon: '👨‍👩‍👧‍👦', path: '/groups' },
    { name: 'Événements', icon: '📅', path: '/events' },
    { name: 'Ressources', icon: '📄', path: '/resources' },
    { name: 'Paramètres', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div className="w-1/5 bg-white p-4 rounded-lg shadow-md mr-4">
      <ul>
        {navItems.map((item) => (
          <li key={item.name} className="mb-3">
            <Link
              to={item.path}
              className="flex items-center text-gray-700 hover:text-indigo-600 font-medium"
            >
              <span className="mr-2 text-xl">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar; 