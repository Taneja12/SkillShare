import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './Contexts/AuthContext'; // Ensure AuthContext is imported correctly
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import Chat from './components/Chat';
import Navbar from './components/Navbar';

const App = () => {
  // Get the current user's authentication status from the context
  const { isAuthenticated } = useContext(AuthContext); // Ensure this is inside the AuthProvider

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Restrict access to Login and Register routes if the user is already authenticated */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />

        {/* Other routes */}
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/messages/:userId" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
