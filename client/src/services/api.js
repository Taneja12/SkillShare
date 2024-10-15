import axios from 'axios';

// Update the backend URL to the Render deployment
const API_URL = 'https://skillshare-p28w.onrender.com/api';

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



export const googleSignUpUser = async ({ token }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/google-signup`, { token });
    return response.data; // Return the response data
  } catch (error) {
    // Handle errors based on the response
    if (error.response) {
      // The request was made, and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data.error || 'An unexpected error occurred during sign-up. Please try again.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from the server. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an error
      throw new Error('Error in setting up the sign-up request. Please try again.');
    }
  }
};

// Function to handle Google login
export const googleLoginUser = async ({ token }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/google-login`, { token });
    return response.data; // Return the response data
  } catch (error) {
    // Handle errors based on the response
    if (error.response) {
      // The request was made, and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data.error || 'An unexpected error occurred during login. Please try again.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from the server. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an error
      throw new Error('Error in setting up the login request. Please try again.');
    }
  }
};



// Fetch chat history
export const getChatHistory = async (currentUserId, userId) => {
  try {
    console.log(userId);
    const response = await axios.get(`${API_URL}/chat/history/${currentUserId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data; // Should contain currentUser (including profile picture) and matchedUsers
  } catch (error) {
    console.error('Error fetching user details:', error);
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

export const uploadProfilePicture = async (file, userId) => {
  console.log(userId);
  const formData = new FormData();
  formData.append('image', file); // File upload using key 'image'
  formData.append('userId', userId); // Send userId along with the image

  try {
    const response = await fetch(`${API_URL}/upload/upload`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error uploading image');
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export const generateGoogleMeetLink = async (hostEmail) => {
  try {
      const response = await axios.post(`${API_URL}/meet/generate-meet-link`, { hostEmail });
      return response.data.meetLink;
  } catch (error) {
      console.error('Error creating Google Meet link:', error);
  }
};

export const initiateGoogleAuth = async () => {
  window.location.href = `${API_URL}/meet/auth/google`; // Redirect to your backend auth route
};


export const updateSkills = async (userId, updatedSkills, isTeaching) => {
  try {
    const endpoint = isTeaching ? 'skillsToTeach' : 'skillsToLearn';
    const response = await axios.put(`${API_URL}/users/${userId}/skills`, {
      [endpoint]: updatedSkills,
    });
    return response.data; // The updated user data
  } catch (error) {
    console.error('Error updating skills:', error);
    throw error; // Rethrow error to be handled by the caller
  }
};
