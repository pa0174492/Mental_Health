import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MeditationTracker.css';
import Navbar from '../navbar/Navbar';
import { FaPlay, FaPause, FaStop, FaMedal, FaCalendarCheck, FaFire, FaBell } from 'react-icons/fa';

const MeditationTracker = () => {
  const [sessions, setSessions] = useState([]);
  const [type, setType] = useState('mindfulness');
  const [notes, setNotes] = useState('');
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastMeditationDate, setLastMeditationDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('tokenUser');

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }
    fetchSessions();
    // Check if there's a saved session
    const savedSession = localStorage.getItem('currentMeditationSession');
    if (savedSession) {
      const { timer: savedTimer, duration, startTime } = JSON.parse(savedSession);
      const elapsedTime = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      if (elapsedTime < duration * 60) {
        setTimer(savedTimer + elapsedTime);
        setSelectedDuration(duration);
        setIsActive(true);
      } else {
        localStorage.removeItem('currentMeditationSession');
      }
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer >= selectedDuration * 60) {
            clearInterval(interval);
            handleMeditationComplete();
            return prevTimer;
          }
          // Save current session state
          localStorage.setItem('currentMeditationSession', JSON.stringify({
            timer: prevTimer + 1,
            duration: selectedDuration,
            startTime: new Date().toISOString()
          }));
          return prevTimer + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, selectedDuration]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/meditation/sessions/${username}`);
      setSessions(response.data);
      calculateStreak(response.data);
    } catch (error) {
      console.error('Error fetching meditation sessions:', error);
    }
  };

  const calculateStreak = (meditationData) => {
    if (!meditationData.length) {
      setStreak(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedSessions = meditationData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLastMeditationDate(new Date(sortedSessions[0].date));

    let currentStreak = 0;
    let currentDate = today;
    let sessionIndex = 0;

    while (sessionIndex < sortedSessions.length) {
      const sessionDate = new Date(sortedSessions[sessionIndex].date);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentStreak++;
        currentDate = sessionDate;
        sessionIndex++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const handleMeditationComplete = async () => {
    try {
      setIsActive(false);
      setIsPaused(false);
      localStorage.removeItem('currentMeditationSession');
      
      // Play completion sound
      const audio = new Audio('/meditation-bell.mp3');
      audio.play();
      
      setShowCompletionModal(true);
    } catch (error) {
      console.error('Error completing meditation:', error);
    }
  };

  const handleSubmitSession = async () => {
    try {
      await axios.post(`http://localhost:8000/api/meditation/add/${username}`, {
        duration: selectedDuration,
        type,
        notes,
        date: new Date()
      });
      
      setNotes('');
      setShowCompletionModal(false);
      fetchSessions();
    } catch (error) {
      console.error('Error adding meditation session:', error);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!username) {
      navigate('/login');
      return;
    }
    setIsActive(true);
    setIsPaused(false);
    localStorage.setItem('currentMeditationSession', JSON.stringify({
      timer: 0,
      duration: selectedDuration,
      startTime: new Date().toISOString()
    }));
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsActive(false);
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimer(0);
    localStorage.removeItem('currentMeditationSession');
  };

  const handleDurationSelect = (mins) => {
    setSelectedDuration(mins);
    setTimer(0);
    setIsActive(false);
    setIsPaused(false);
    localStorage.removeItem('currentMeditationSession');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Meditation Tracker</h2>
              <div className="flex justify-center items-center space-x-8">
                <div className="flex items-center space-x-2 text-white">
                  <FaFire className="text-yellow-300 w-6 h-6" />
                  <span className="text-xl">{streak} Day Streak</span>
                </div>
                {lastMeditationDate && (
                  <div className="flex items-center space-x-2 text-white">
                    <FaCalendarCheck className="text-green-300 w-6 h-6" />
                    <span>Last: {new Date(lastMeditationDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-blue-600 mb-4">
                    {formatTime(timer)}
                  </div>
                  <div className="text-gray-600">
                    {isActive && !isPaused ? 'Time Remaining: ' : 'Duration: '}
                    {formatTime(selectedDuration * 60 - timer)}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-6">
                  {[5, 10, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      className={`p-3 rounded-lg transition-all ${
                        selectedDuration === mins
                          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-blue-50'
                      } ${isActive || isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleDurationSelect(mins)}
                      disabled={isActive || isPaused}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>

                <div className="flex justify-center space-x-4">
                  {!isActive && !isPaused ? (
                    <button
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={handleStart}
                    >
                      <FaPlay />
                      <span>Start</span>
                    </button>
                  ) : isPaused ? (
                    <button
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={handleResume}
                    >
                      <FaPlay />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      onClick={handlePause}
                    >
                      <FaPause />
                      <span>Pause</span>
                    </button>
                  )}
                  <button 
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                      !isActive && !isPaused
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                    onClick={handleStop}
                    disabled={!isActive && !isPaused}
                  >
                    <FaStop />
                    <span>Stop</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label className="block text-gray-700 font-medium mb-2">Meditation Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="mindfulness">Mindfulness</option>
                    <option value="breathing">Breathing</option>
                    <option value="body-scan">Body Scan</option>
                    <option value="loving-kindness">Loving Kindness</option>
                    <option value="zen">Zen</option>
                    <option value="transcendental">Transcendental</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block text-gray-700 font-medium mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How was your session? How do you feel?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-8">
                <button
                  onClick={handleSubmitSession}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={!selectedDuration}
                >
                  <span>Save Session</span>
                </button>
              </div>

              <div className="sessions-history">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Meditation History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessions.map((session) => (
                    <div key={session._id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-gray-600">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-blue-600">
                          <FaMedal className="w-4 h-4 mr-2" />
                          {session.duration} minutes
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700"><strong>Type:</strong> {session.type}</p>
                        {session.notes && (
                          <p className="text-gray-600">
                            <strong>Notes:</strong> {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <FaBell className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Session Complete!</h3>
              <p className="text-gray-600 mb-6">
                Great job completing your {selectedDuration} minute meditation session.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSubmitSession}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Session
                </button>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeditationTracker;
