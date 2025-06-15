import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/" /> : <Signup />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
