import React, { useEffect, useState } from 'react';
import { fetchReceivedRequests, acceptRequest, declineRequest } from '../services/api.js';
import '../css/ReceivedRequests.css';

const ReceivedRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchReceivedRequests(userId);
        setRequests(data);
      } catch (error) {
        console.error('Error loading requests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [userId]);

  const handleAccept = async (senderId) => {
    try {
      await acceptRequest(senderId, userId);
      setRequests(requests.filter(req => req._id !== senderId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (senderId) => {
    try {
      await declineRequest(senderId, userId);
      setRequests(requests.filter(req => req._id !== senderId));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  return (
    <div className="requests-container">
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="requests-list">
          {requests.map(req => (
            <div key={req._id} className="request-row">
              <img
                src={req.profilePicture || '/default-avatar.png'}
                alt={`${req.username}'s profile`}
                className="profile-pic"
              />
              <div className="request-info">
                <p className="username">{req.username}</p>
                <div className="actions">
                  <button onClick={() => handleAccept(req._id)}>Accept</button>
                  <button onClick={() => handleDecline(req._id)}>Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedRequests;
