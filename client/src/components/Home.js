import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext'; // Import the custom hook for auth context
import '../css/Home.css'; // Optional: for styling

const Home = () => {
  const { isAuthenticated } = useAuth(); // Get auth state from context

  return (
    <div className="home-container">
      <header className={`hero-section ${isAuthenticated ? 'logged-in' : 'logged-out'}`}>
        <h1>{isAuthenticated ? 'Welcome Back!' : 'Welcome to SkillShare'}</h1>
        <p>
          {isAuthenticated 
            ? 'Continue sharing and learning valuable skills with your community.' 
            : 'Your community-driven platform to learn and share valuable skills in a sustainable way.'}
        </p>
        <div className="cta-buttons">
          {!isAuthenticated && (
            <>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/profile/:userid" className="btn btn-primary">Go to Profile</Link>
          )}
        </div>
      </header>

      <section className="about-section">
        <h2>About SkillShare</h2>
        <p>
          SkillShare is a skill exchange platform where users can swap knowledge and expertise without any monetary transactions. 
          Whether you want to teach or learn, SkillShare connects you with others for mutual growth and support.
        </p>
      </section>

      <section className="features-section">
        <h2>Why SkillShare?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Sustainable Learning</h3>
            <p>Contribute to a sustainable future by sharing knowledge and learning from others, without the need for monetary exchange.</p>
          </div>
          <div className="feature-item">
            <h3>Diverse Skills</h3>
            <p>Explore a wide range of skills from various categories like tech, arts, health, and more.</p>
          </div>
          <div className="feature-item">
            <h3>Community Focused</h3>
            <p>Join a community of learners and educators passionate about self-growth and sustainability.</p>
          </div>
        </div>
      </section>

      <section className="call-to-action-section">
        <h2>Start Swapping Skills Now!</h2>
        <p>Ready to join the community? Sign up to start learning and teaching!</p>
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-primary">Sign Up Now</Link>
        )}
      </section>
    </div>
  );
};

export default Home;
