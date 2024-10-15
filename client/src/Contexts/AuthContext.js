import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Correct import for jwtDecode

// Create a context for authentication
export const AuthContext = createContext(); // Make sure to export this

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null); // State for storing the current user

  const checkTokenExpiration = (token) => {
    if (!token) return true; // If no token, consider it expired

    try {
      const { exp } = jwtDecode(token); // Decode the token to get the expiration time
      const isExpired = Date.now() >= exp * 1000; // Convert to milliseconds
      return isExpired;
    } catch (error) {
      console.error('Token decoding error:', error);
      return true; // If error occurs, consider it expired
    }
  };
  const login = (token) => {
    console.log('Logging in with token:', token);
    localStorage.setItem('token', token); // Save the token
    setIsAuthenticated(true);
    const decodedUser = jwtDecode(token);
    console.log('Decoded user:', decodedUser);
    setCurrentUser(decodedUser); // Decode the token and set current user
  };
  
  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null); // Clear current user on logout
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!checkTokenExpiration(token)) {
        setIsAuthenticated(true);
        const decodedUser = jwtDecode(token); // Decode token and set user if valid
        setCurrentUser(decodedUser);
      } else {
        logout(); // Automatically log out if the token is expired
      }
    } else {
      logout(); // Automatically log out if no token exists
    }
  }, []);
  

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for using the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
