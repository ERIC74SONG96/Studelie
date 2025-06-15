import React from 'react';
import PostForm from './PostForm';
import PostList from './PostList';

const MainContent = () => {
  return (
    <div className="flex-grow bg-white p-6 rounded-lg shadow-md mr-4">
      <h2 className="text-2xl font-bold mb-4">Fil d'actualité du campus</h2>
      <PostForm />
      <PostList />
    </div>
  );
};

export default MainContent; 