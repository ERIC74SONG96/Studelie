import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-indigo-600">Studelie</div>
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Rechercher sur Studelie"
          className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {/* Navigation Icons */}
        <div className="flex space-x-4">
          <button className="text-gray-600 hover:text-indigo-600">Accueil</button>
          <button className="text-gray-600 hover:text-indigo-600">Messages</button>
          <button className="text-gray-600 hover:text-indigo-600">Notifications</button>
          <button className="text-gray-600 hover:text-indigo-600">Profil</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 