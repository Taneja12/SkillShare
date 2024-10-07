import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData); // Ensure this endpoint matches your backend
    return response.data; // Return data if needed
  } catch (error) {
    console.error('Registration error:', error);
    throw error; 
  }
};

export const loginUser = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, formData);
    return response.data; // Return the response data for handling in the component
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Rethrow error to handle it in the component
  }
};


export const markMessagesAsRead = async (currentUserId, chatUserId) => {
  try {
    await axios.put(`${API_URL}/chat/read/${currentUserId}/${chatUserId}`);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};