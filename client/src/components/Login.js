import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLoginUser } from '../services/api';
import { useAuth } from '../Contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';
// Import the image
import loginImage from '../static/login.webp';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Clear any error message when the user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(formData);

      if (response && response.token) {
        login(response.token);
        navigate(`/profile/${response.userId}`);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setError(error.message || 'An error occurred while logging in. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const result = await googleLoginUser({ token: response.credential });
      
      if (result && result.token) {
        login(result.token); // Store the token in context
        navigate(`/profile/${result.userId}`); // Navigate to profile page
      } else {
        // Handle the case where user was not found and provide feedback
        setError('Failed to log in with Google. Please try again.');
      }
    } catch (error) {
      console.error('Google Login Error:', error);
  
      // Check if the error is "User not found" and handle accordingly
      if (error.message.includes("User not found")) {
        setError('No account found with this Google ID. Please sign up first.');
      } else {
        setError('An error occurred during Google login. Please try again.');
      }
    }
  };

  // Inline styles for custom CSS integration
  const containerStyle = {
    minHeight: '100vh',
  };

  const cardStyle = {
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const linkStyle = {
    color: '#5C63FF',
  };

  const buttonStyle = {
    backgroundColor: '#5C63FF',
    border: 'none',
  };

  return (
    <div className="container d-flex justify-content-center align-items-center my-5" style={containerStyle}>
      <div className="col-md-4">
        <div className="card p-4 shadow-sm" style={cardStyle}>
          <h2 className="text-center mb-4">Login</h2>

          {/* Add the image for better visual appeal */}
          <div className="text-center mb-4">
            <img src={loginImage} alt="Login Illustration" className="img-fluid" style={{ maxHeight: '200px' }} />
          </div>

          {/* Display error dynamically */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>

            <div className="form-group mb-3">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100"
              disabled={loading}
              style={{buttonStyle, backgroundColor:'#79a7ac'}}

            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-3">
            <p>or</p>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                setError('Google login failed. Please try again.');
              }}
            />

            <p>
              Don't have an account? <Link to="/register" style={linkStyle}>Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
