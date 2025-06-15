import React from 'react';
import Navbar from '../components/Navbar';
import LeftSidebar from '../components/LeftSidebar';
import MainContent from '../components/MainContent';
import RightSidebar from '../components/RightSidebar';

const Dashboard = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex">
        <LeftSidebar />
        <MainContent />
        <RightSidebar />
      </div>
    </div>
  );
};

export default Dashboard; 