import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-32 bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
        {course.image ? (
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          'Image du cours'
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">{course.title}</h2>
        <p className="text-sm text-gray-600">{course.description}</p>
        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
          <span>{course.progress || '0%'} terminé</span>
          <div className="flex space-x-2">
            <Link 
              to={`/courses/${course._id}`}
              className="text-blue-500 hover:text-blue-600"
            >
              Voir détails
            </Link>
            <button className="text-gray-400 hover:text-gray-600">•••</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 