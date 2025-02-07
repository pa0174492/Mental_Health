import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/Navbar';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import UserJournals from './UserJournals';
import './Profile.css';

import Loader from "react-js-loader";
import { Audio } from 'react-loader-spinner';
import Readjournal from '../journal/Readjournal';
import defaultProfilePicture from './download2.jpg';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journalCount, setJournalCount] = useState(0);

  // Accessing username from URL params
  const { username } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, journalsResponse] = await Promise.all([
          axios.get(`http://localhost:8000/${username}/getuserdetails`),
          axios.get(`http://localhost:8000/${username}/journals`)
        ]);

        setUser(userResponse.data);
        setJournalCount(journalsResponse.data.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>User not found</h2>
        <Link to="/" className="back-home">Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-cover">
            {user.profilePicture && (
              <img 
                src={`http://localhost:8000/${user.profilePicture}`} 
                alt={user.username}
                className="profile-picture"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-profile.jpg';
                }}
              />
            )}
          </div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p className="email">{user.email}</p>
            {user.bio && <p className="bio">{user.bio}</p>}
            
            {username === localStorage.getItem('tokenUser') && (
              <div className="profile-actions">
                <Link to={`/${username}/updateprofile`} className="edit-profile-btn">
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{journalCount}</span>
            <span className="stat-label">Journals</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.meditationStreak || 0}</span>
            <span className="stat-label">Meditation Streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.moodEntries || 0}</span>
            <span className="stat-label">Mood Entries</span>
          </div>
        </div>

        {/* User's Journals Section */}
        <UserJournals username={username} />
      </div>
    </>
  );
};

export default Profile;
