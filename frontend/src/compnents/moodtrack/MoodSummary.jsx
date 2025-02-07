import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSmile, FaMeh, FaFrown, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import './MoodSummary.css';

const MoodSummary = ({ username }) => {
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodSummary();
  }, [username, period]);

  const fetchMoodSummary = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/moods/${username}/summary?period=${period}`);
      setSummary(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mood summary:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mood-summary-loading">
        <div className="loading-spinner"></div>
        <p>Loading mood summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="no-mood-data">
        <FaMeh className="no-data-icon" />
        <p>No mood data available</p>
      </div>
    );
  }

  const getMoodIcon = (mood) => {
    switch(mood.toLowerCase()) {
      case 'happy':
      case 'excited':
      case 'content':
        return <FaSmile className="mood-icon happy" />;
      case 'neutral':
      case 'okay':
        return <FaMeh className="mood-icon neutral" />;
      case 'sad':
      case 'anxious':
      case 'stressed':
        return <FaFrown className="mood-icon sad" />;
      default:
        return <FaMeh className="mood-icon" />;
    }
  };

  const getTrendIcon = () => {
    switch(summary.trend) {
      case 'improving':
        return <FaChartLine className="trend-icon improving" />;
      case 'declining':
        return <FaChartLine className="trend-icon declining" />;
      default:
        return <FaChartLine className="trend-icon stable" />;
    }
  };

  return (
    <div className="mood-summary">
      <div className="summary-header">
        <h2>Mood Summary</h2>
        <div className="period-selector">
          <FaCalendarAlt className="calendar-icon" />
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card total-entries">
          <h3>Total Entries</h3>
          <div className="card-content">
            <span className="number">{summary.totalEntries}</span>
            <span className="label">entries</span>
          </div>
        </div>

        <div className="summary-card average-mood">
          <h3>Average Mood</h3>
          <div className="card-content">
            <span className="number">{summary.averageMood}</span>
            <span className="label">out of 5</span>
          </div>
        </div>

        <div className="summary-card most-common">
          <h3>Most Common Mood</h3>
          <div className="card-content">
            {getMoodIcon(summary.mostCommonMood)}
            <span className="mood-name">{summary.mostCommonMood}</span>
          </div>
        </div>

        <div className="summary-card mood-trend">
          <h3>Mood Trend</h3>
          <div className="card-content">
            {getTrendIcon()}
            <span className="trend-label">{summary.trend}</span>
          </div>
        </div>
      </div>

      <div className="mood-distribution">
        <h3>Mood Distribution</h3>
        <div className="distribution-bars">
          {Object.entries(summary.moodDistribution).map(([mood, count]) => (
            <div key={mood} className="distribution-bar">
              <div className="bar-label">
                {getMoodIcon(mood)}
                <span>{mood}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ 
                    width: `${(count / summary.totalEntries) * 100}%`,
                    backgroundColor: 
                      mood.toLowerCase().includes('happy') ? '#48BB78' :
                      mood.toLowerCase().includes('sad') ? '#F56565' : '#4299E1'
                  }}
                />
                <span className="bar-value">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="daily-averages">
        <h3>Daily Mood Averages</h3>
        <div className="averages-chart">
          {summary.dailyAverages.map((day) => (
            <div key={day.date} className="day-average">
              <div 
                className="average-bar" 
                style={{ height: `${(day.average / 5) * 100}%` }}
              >
                <span className="average-value">{day.average}</span>
              </div>
              <span className="date-label">
                {new Date(day.date).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodSummary; 