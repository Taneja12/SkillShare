import React, { useEffect, useState } from 'react';
import { fetchConnections } from '../services/api';
import '../css/ShowConnections.css';

const ShowConnections = ({ userId }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getConnections = async () => {
      try {
        const data = await fetchConnections(userId);
        setConnections(data);
      } catch (error) {
        console.error('Failed to load connections.');
      } finally {
        setLoading(false);
      }
    };

    getConnections();
  }, [userId]);

  return (
    <div className="connections-container">
      {loading ? (
        <p>Loading connections...</p>
      ) : connections.length === 0 ? (
        <p>No connections found.</p>
      ) : (
        <div className="connections-list">
          {connections.map((conn) => (
            <div key={conn._id} className="connection-row">
              <img
                src={conn.profilePicture || '/default-avatar.png'}
                alt={`${conn.username}'s profile`}
                className="profile-pic"
              />
              <span className="connection-name">{conn.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowConnections;
