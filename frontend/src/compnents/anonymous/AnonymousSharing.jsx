import React from 'react';
import Navbar from '../navbar/Navbar';
import { FaPen, FaEye, FaLock, FaHeart, FaComment, FaShieldAlt } from 'react-icons/fa';
import './AnonymousSharing.css';

const AnonymousSharing = () => {
  const user = localStorage.getItem('tokenUser');
  
  const features = [
    {
      icon: <FaLock className="feature-icon" />,
      title: "Complete Anonymity",
      description: "Share your thoughts freely without revealing your identity. Your privacy is our top priority."
    },
    {
      icon: <FaShieldAlt className="feature-icon" />,
      title: "Safe Space",
      description: "A supportive community where you can express yourself without judgment."
    },
    {
      icon: <FaHeart className="feature-icon" />,
      title: "Support & Connect",
      description: "Give and receive support through meaningful interactions with others."
    },
    {
      icon: <FaComment className="feature-icon" />,
      title: "Open Discussions",
      description: "Engage in honest conversations about mental health, experiences, and feelings."
    }
  ];

  return (
    <>
      <Navbar />
      <div className="anonymous-sharing-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Anonymous Sharing Portal</h1>
            <p>A safe haven for expressing yourself freely and connecting with others who understand.</p>
            
            <div className="hero-actions">
              <a href={`/${user}/createanonymouspost`} className="primary-btn">
                <FaPen className="btn-icon" />
                Create Post
              </a>
              <a href={`/${user}/allanonymousposts`} className="secondary-btn">
                <FaEye className="btn-icon" />
                View Posts
              </a>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2>Why Share Anonymously?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="guidelines-section">
          <h2>Community Guidelines</h2>
          <div className="guidelines-content">
            <div className="guideline">
              <h3>Be Respectful</h3>
              <p>Treat others with kindness and empathy. Everyone's experience is valid.</p>
            </div>
            <div className="guideline">
              <h3>Maintain Privacy</h3>
              <p>Never share personal identifying information about yourself or others.</p>
            </div>
            <div className="guideline">
              <h3>Support, Don't Judge</h3>
              <p>Offer constructive support and avoid critical or harmful comments.</p>
            </div>
            <div className="guideline">
              <h3>Report Concerns</h3>
              <p>Help keep our community safe by reporting inappropriate content.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnonymousSharing;