import React, { useState } from 'react';
import Navbar from '../navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaTags, FaLock, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import './AnonymousPost.css';

const AnonymousPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const user = localStorage.getItem('tokenUser');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/posts/create', {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim())
      });

      if (response.status === 201) {
        console.log('Post created:', response.data);
        navigate(`/${user}/allanonymousposts`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-post-container">
        <div className="create-post-header">
          <h1>Create Anonymous Post</h1>
          <p>Share your thoughts in a safe and supportive environment</p>
        </div>

        <div className="post-form-container">
          <div className="privacy-notice">
            <FaLock className="privacy-icon" />
            <div>
              <h3>Your Privacy Matters</h3>
              <p>All posts are completely anonymous. Your identity is never revealed.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a meaningful title"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Your Message</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, feelings, or experiences..."
                required
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags" className="tags-label">
                <FaTags className="tags-icon" />
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by commas (e.g., anxiety, support, advice)"
                className="form-input"
              />
            </div>

            <div className="posting-guidelines">
              <FaInfoCircle className="info-icon" />
              <div>
                <h4>Posting Guidelines</h4>
                <ul>
                  <li>Be respectful and supportive</li>
                  <li>Avoid sharing personal identifying information</li>
                  <li>Use trigger warnings when discussing sensitive topics</li>
                </ul>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Post Anonymously
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AnonymousPost;
