import React from 'react';

const RightSidebar = () => {
  return (
    <div className="w-1/4 bg-white p-4 rounded-lg shadow-md ml-4">
      <h3 className="text-lg font-semibold mb-4">Anniversaires</h3>
      <ul className="mb-6">
        <li className="text-gray-700">🎂 Fabiola P. aujourd'hui</li>
        {/* Add more birthdays dynamically */}
      </ul>

      <h3 className="text-lg font-semibold mb-4">Contacts</h3>
      <ul>
        <li className="flex items-center mb-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
          <span className="text-gray-700">Leroi Lomegnie</span>
        </li>
        <li className="flex items-center mb-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
          <span className="text-gray-700">Joël Woulkam</span>
        </li>
        {/* Add more contacts dynamically */}
      </ul>

      <h3 className="text-lg font-semibold mb-4 mt-6">Opportunités</h3>
      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
        <p className="font-medium">Découvrez les stages disponibles !</p>
        <a href="#" className="text-indigo-600 hover:underline">En savoir plus</a>
      </div>
    </div>
  );
};

export default RightSidebar; 