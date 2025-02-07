import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Loader from 'react-js-loader';
import Navbar from '../navbar/Navbar';
import { FaCheckCircle, FaSpinner, FaBrain, FaArrowRight } from 'react-icons/fa';

const API_KEY = process.env.REACT_APP_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const questions = [
  "How often have you felt down, depressed, or hopeless in the past two weeks?",
  "How often do you feel little interest or pleasure in doing things?",
  "How often do you feel nervous, anxious, or on edge?",
  "How often do you have trouble relaxing?",
  "How often do you feel so restless that it is hard to sit still?",
  "How often do you feel fatigued or have little energy?",
  "How often do you feel bad about yourself, or that you are a failure or have let yourself or your family down?",
  "How often do you have trouble concentrating on things, such as reading the newspaper or watching television?",
  "How often do you feel afraid, as if something awful might happen?",
  "How often do you have trouble falling or staying asleep, or sleeping too much?",
  "How often do you feel easily annoyed or irritable?",
  "How often do you experience physical symptoms such as headaches, stomachaches, or muscle pain?",
  "How often do you feel disconnected or detached from reality or your surroundings?",
  "How often do you find it difficult to control your worry?",
  "How often do you avoid social situations due to fear of being judged or embarrassed?",
];

const options = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

const Quiz = () => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);

  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleOptionHover = (index) => {
    setHoveredOption(index);
  };

  const handleOptionLeave = () => {
    setHoveredOption(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze the following mental health quiz answers and generate a short summary regarding the persons mental health and what can he do, use points and headings and generate answer separated by paragraphs, also give a space between different paragraphs:\n\n${questions.map((q, i) => `${i+1}. ${q} ${answers[i]}`).join('\n')}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = await response.text();
  
      // Replace **word** with <strong>word</strong>
      text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  
      setResult(text);
    } catch (error) {
      console.error('Error analyzing answers:', error);
      setResult('An error occurred while analyzing the answers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-center">
              <div className="flex justify-center mb-4">
                <FaBrain className="text-white w-16 h-16" />
              </div>
              <h1 className="text-3xl font-bold text-white">Mental Health Assessment</h1>
              <p className="mt-2 text-blue-100">Take this quiz to better understand your mental well-being</p>
            </div>

            <div className="p-6">
              {questions.map((question, index) => (
                <div 
                  key={index} 
                  className="mb-8 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-grow">
                      <p className="text-lg font-medium text-gray-800 mb-4">{question}</p>
                      <div className="grid gap-3">
                        {options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer
                              ${answers[index] === option 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}`}
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={answers[index] === option}
                              onChange={() => handleChange(index, option)}
                              className="hidden"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3
                              ${answers[index] === option 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'}`}
                            >
                              {answers[index] === option && (
                                <FaCheckCircle className="text-white w-3 h-3" />
                              )}
                            </div>
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-full text-white font-medium transition-all
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'}`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin w-5 h-5" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Your Analysis</span>
                      <FaArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {result && (
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Analysis Results</h2>
                  <div className="prose prose-blue max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{result}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Quiz;
