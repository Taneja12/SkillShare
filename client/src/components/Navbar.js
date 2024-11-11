import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import '../css/CustomNavbar.css'; // Import your CSS file

const CustomNavbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Navbar.Brand as={Link} to="/" className="navbar-brand">
        <span className="logo">S</span>
        <span className="skill-share">kill Share</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ml-auto">
          {/* Always show Home link */}
          <Nav.Link as={Link} to="/">Home</Nav.Link>

          {isAuthenticated ? (
            <>
              {/* Show these links if authenticated */}
              {/* <Nav.Link as={Link} to="/explore">Explore</Nav.Link> */}
              {/* <Nav.Link as={Link} to="/notification">Notification</Nav.Link> */}
              {/* <Nav.Link as={Link} to="/messages">Messages</Nav.Link> */}
              <Nav.Link as={Link} to="/guide">Guide</Nav.Link>
              <Nav.Link
                as={Link}
                to={{
                  pathname: `/subscription/${currentUser?.userId}`,
                }}
              >
                Subscription
              </Nav.Link>


              <Nav.Link as={Link} to={`/explore`}>Explore</Nav.Link>
              <Nav.Link as={Link} to={`/messenger`}>Message</Nav.Link>
              <Nav.Link as={Link} to={`/profile/${currentUser?.userId}`}>Profile</Nav.Link>
              <Nav.Link as="button" onClick={handleLogout}>Logout</Nav.Link>
            </>
          ) : (
            <>
              {/* Show these links if not authenticated */}
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
