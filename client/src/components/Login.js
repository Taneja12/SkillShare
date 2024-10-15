import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLoginUser } from '../services/api';
import { useAuth } from '../Contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        // Optionally redirect to signup or show a message
        setError('No account found with this Google ID. Please sign up first.');
        // You can redirect them to the signup page if you want
        // navigate('/register');
      } else {
        setError('An error occurred during Google login. Please try again.');
      }
    }
  };
  

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-4">
        <div className="card p-4 shadow-sm">
          <h2 className="text-center mb-4">Login</h2>

          {/* Display error dynamically */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
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
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
