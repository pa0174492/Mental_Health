import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Loader from 'react-js-loader';
import Navbar from '../navbar/Navbar';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import './Therapist.css';

const API_KEY = process.env.REACT_APP_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const TypingAnimation = ({ color }) => (
  <div className="flex items-center space-x-2 p-4">
    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
  </div>
);

const Therapist = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages([...messages, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyse the user's input and give suggestions or talk with them and provide an answer in paragraphs with spaces between paragraphs and points. Respond as if you are talking to the user in the first person, not the third person:\n\nUser: ${input}\nTherapist:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let aiMessage = await response.text();
      console.log('AI response:', aiMessage);

      // Replace **word** with <strong>word</strong>
      aiMessage = aiMessage.replace(/\*\*(.*?)\*\*/g, '$1');

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessages([...messages, newMessage, { sender: 'ai', text: aiMessage }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages([...messages, newMessage, { sender: 'ai', text: 'An error occurred while generating the response.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
    // Scroll to the bottom of the chat box whenever messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h1 className="text-2xl font-bold text-white text-center">Your Personal AI Assistant</h1>
              <p className="text-blue-100 text-center mt-2">Share your thoughts, and I'll help guide you through them</p>
            </div>
            
            <div ref={chatBoxRef} className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                      {msg.sender === 'user' ? (
                        <FaUser className="text-white w-4 h-4" />
                      ) : (
                        <FaRobot className="text-gray-600 w-4 h-4" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white shadow-md text-gray-800'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {loading && <TypingAnimation />}
            </div>

            <div className="p-4 bg-white border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button 
                  onClick={handleSend} 
                  className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                >
                  <span>Send</span>
                  <FaPaperPlane className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Therapist;
