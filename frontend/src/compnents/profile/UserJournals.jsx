import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaCalendar, FaBook, FaHeart, FaComment, FaSearch, FaFilter } from 'react-icons/fa';
import './UserJournals.css';

const UserJournals = ({ username }) => {
  const [journals, setJournals] = useState([]);
  const [exploreJournals, setExploreJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, latest, popular

  useEffect(() => {
    fetchUserJournals();
    fetchExploreJournals();
  }, [username]);

  const fetchUserJournals = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/${username}/journals`);
      setJournals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching journals:', error);
      setLoading(false);
    }
  };

  const fetchExploreJournals = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/journals/explore');
      setExploreJournals(response.data);
    } catch (error) {
      console.error('Error fetching explore journals:', error);
    }
  };

  const getExcerpt = (content) => {
    if (!content) return 'No content available';
    return content.length > 150 ? `${content.substring(0, 150)}...` : content;
  };

  const filterJournals = (journals) => {
    let filtered = [...journals];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(journal => 
        journal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sort filter
    switch(filter) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="journals-loading">
        <div className="loading-spinner"></div>
        <p>Loading journals...</p>
      </div>
    );
  }

  const renderJournalGrid = (journalList, isExplore = false) => (
    <div className="journals-grid">
      {journalList.map((journal) => (
        <div key={journal._id} className="journal-card">
          {journal.coverPicture && (
            <div className="journal-cover">
              <img 
                src={`http://localhost:8000/${journal.coverPicture}`} 
                alt="Journal Cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-journal-cover.jpg';
                }}
              />
            </div>
          )}
          <div className="journal-content">
            {isExplore && (
              <div className="journal-author">
                <img
                  src={journal.authorPicture ? `http://localhost:8000/${journal.authorPicture}` : '/default-profile.jpg'}
                  alt={journal.authorName}
                  className="author-avatar"
                />
                <span className="author-name">{journal.authorName}</span>
              </div>
            )}
            <h3 className="journal-title">{journal.title || 'Untitled Journal'}</h3>
            <p className="journal-excerpt">{getExcerpt(journal.content)}</p>
            
            <div className="journal-meta">
              <div className="meta-item">
                <FaCalendar className="meta-icon" />
                <span>{new Date(journal.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <FaHeart className="meta-icon" />
                <span>{journal.likes?.length || 0}</span>
              </div>
              <div className="meta-item">
                <FaComment className="meta-icon" />
                <span>{journal.comments?.length || 0}</span>
              </div>
            </div>

            {journal.tags && journal.tags.length > 0 && (
              <div className="journal-tags">
                {journal.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            <div className="journal-actions">
              <Link 
                to={`/${isExplore ? journal.authorName : username}/readjournals/${journal._id}`} 
                className="read-more-btn"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="user-journals-container">
      <div className="user-journals-section">
        <div className="journals-header">
          <h2>Your Journal Entries</h2>
          <Link to={`/${username}/createjournal`} className="create-journal-btn">
            Create New Journal
          </Link>
        </div>

        {journals.length === 0 ? (
          <div className="no-journals">
            <FaBook className="no-journals-icon" />
            <p>No journal entries yet</p>
            <Link to={`/${username}/createjournal`} className="start-journal-btn">
              Start Your First Journal
            </Link>
          </div>
        ) : (
          renderJournalGrid(journals)
        )}
      </div>

      <div className="explore-journals-section">
        <div className="explore-header">
          <h2>Explore Journals</h2>
          <div className="explore-controls">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search journals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <FaFilter className="filter-icon" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Journals</option>
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>
        </div>
        {renderJournalGrid(filterJournals(exploreJournals), true)}
      </div>
    </div>
  );
};

export default UserJournals; 