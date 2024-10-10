import axios from 'axios';

const API_URL = 'http://localhost:5000/api';


export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data; // Assuming successful registration returns the token and message
  } catch (error) {
    // Log detailed error info for debugging purposes
    console.error('Registration error:', error.response ? error.response.data : error.message);

    // Throw a more specific error for frontend usage
    const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
    
    // Propagate the error message for frontend to display
    throw new Error(errorMessage);
  }
};

// Login user
export const loginUser = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, formData);

    // If the response is successful, return the data
    return response.data;
  } catch (error) {
    // Check if error response exists (axios returns error object in case of failed request)
    if (error.response && error.response.data && error.response.data.error) {
      // If the error message is provided in the response, throw that
      throw new Error(error.response.data.error);
    } else {
      // If no specific error message, throw a generic error message
      throw new Error('An error occurred while logging in. Please try again later.');
    }
  }
};


// Fetch chat history
export const getChatHistory = async (currentUserId, userId) => {
  try {
    const response = await axios.get(`${API_URL}/chat/history/${currentUserId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Send message (if necessary)
export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(`${API_URL}/chat/send`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Fetch matched users and current user details
export const fetchMatchedUsers = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/match/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching matched users:', error);
    throw error;
  }
};
