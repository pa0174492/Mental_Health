import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import { FaHeart, FaRegHeart, FaComment, FaEye, FaSearch } from 'react-icons/fa';
import './AnonymousPost.css';

const AllAnonymousPost = () => {
  const [posts, setPosts] = useState([]);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [trendingPosts, setTrendingPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchTrendingPosts();
  }, [searchQuery, selectedTag]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/posts`, {
        params: {
          search: searchQuery,
          tag: selectedTag
        }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/posts/trending`);
      setTrendingPosts(response.data);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    try {
      await axios.post(`http://localhost:8000/api/posts/comment/${postId}`, {
        content: newComment
      });
      setNewComment('');
      setActiveCommentPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await axios.post(`http://localhost:8000/api/posts/like/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      await axios.post(`http://localhost:8000/api/posts/comment/like/${postId}/${commentId}`);
      fetchPosts();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    return `http://localhost:8000/${cleanImageUrl}`;
  };

  return (
    <>
      <Navbar />
      <div className="anonymous-posts-container">
        <div className="search-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search posts or enter #postID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="posts-grid">
          <div className="main-content">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <div className="post-id">#{post.postId}</div>
                  <div className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>
                
                {post.imageUrl && (
                  <div className="post-image-container">
                    <img 
                      src={getImageUrl(post.imageUrl)} 
                      alt={post.title}
                      className="post-image"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Image failed to load:', post.imageUrl);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="post-tags">
                  {post.tags && post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="tag"
                      onClick={() => setSelectedTag(tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="post-stats">
                  <div className="stat-item" onClick={() => handleLikePost(post.postId)}>
                    {post.likes > 0 ? <FaHeart className="icon liked" /> : <FaRegHeart className="icon" />}
                    <span>{post.likes}</span>
                  </div>
                  <div className="stat-item">
                    <FaComment className="icon" />
                    <span>{post.comments.length}</span>
                  </div>
                  <div className="stat-item">
                    <FaEye className="icon" />
                    <span>{post.views}</span>
                  </div>
                </div>

                <div className="comments-section">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <p>{comment.content}</p>
                      <div className="comment-footer">
                        <small>{new Date(comment.date).toLocaleDateString()}</small>
                        <div className="comment-likes" onClick={() => handleLikeComment(post.postId, comment._id)}>
                          <FaHeart className={`icon ${comment.likes > 0 ? 'liked' : ''}`} />
                          <span>{comment.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activeCommentPost === post.postId ? (
                    <div className="add-comment">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="comment-input"
                      />
                      <div className="comment-actions">
                        <button 
                          className="submit-btn"
                          onClick={() => handleCommentSubmit(post.postId)}
                        >
                          Submit
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => {
                            setActiveCommentPost(null);
                            setNewComment('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="add-comment-btn"
                      onClick={() => setActiveCommentPost(post.postId)}
                    >
                      Add Comment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="trending-sidebar">
            <h3>Trending Posts</h3>
            {trendingPosts.map((post) => (
              <div key={post._id} className="trending-post-card">
                <h4>#{post.postId} {post.title}</h4>
                <div className="trending-stats">
                  <span><FaHeart className="icon" /> {post.likes}</span>
                  <span><FaComment className="icon" /> {post.comments.length}</span>
                  <span><FaEye className="icon" /> {post.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllAnonymousPost;
