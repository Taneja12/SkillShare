import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './Contexts/AuthContext'; // Ensure AuthContext is imported correctly
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import Chat from './components/Chat';
import Navbar from './components/Navbar';
import VerifySkill from './components/VerifySkill';
import SubscriptionPlans from './components/Subscription';
import PaymentSuccess from './components/PaymentSuccess';
import ReceivedRequests from './components/ReceivedRequests';
import ShowConnections from './components/ShowConnections';
import Explore from './components/Explore';
import Guide from './components/Guide';
import MessengerTabs from './components/MessengerTabs';

const App = () => {
  // Get the current user's authentication status and userId from the context
  const { isAuthenticated, currentUser } = useContext(AuthContext); // Make sure userId is available in AuthContext
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home userId={currentUser?.userId} />} />

        {/* Restrict access to Login and Register routes if the user is already authenticated */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />e
        {/* Other routes */}
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/Guide" element={<Guide />} />
        <Route path="/messages/:userId/:username" element={<Chat />} />

        {/* Pass userId as a prop to VerifySkill */}
        <Route
          path="/skill-verification/:skill"
          element={<VerifySkill userId={currentUser?.userId} />}
        />
        <Route path="/subscription/:userId" element={<SubscriptionPlans />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/requests/received/:userId" element={<ReceivedRequests userId={currentUser?.userId} />} />
        <Route path="/user/connections/:userId" element={<ShowConnections userId={currentUser?.userId} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/messenger/*" element={<MessengerTabs />} />

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
