import React from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleBottomCenterTextIcon,
  HeartIcon,
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Mental Health Assessment',
    description:
      'Take a comprehensive mental health assessment to understand your emotional well-being and get personalized recommendations for improvement.',
    icon: HeartIcon,
    color: 'bg-rose-500',
  },
  {
    name: 'Personal Journal',
    description:
      'Keep a private digital journal to track your thoughts, emotions, and daily experiences in a secure and organized way.',
    icon: ChatBubbleBottomCenterTextIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'AI Therapy Assistant',
    description:
      'Access our AI-powered therapy assistant anytime for immediate emotional support, coping strategies, and guided self-reflection.',
    icon: BoltIcon,
    color: 'bg-indigo-500',
  },
  {
    name: 'Safe Community',
    description:
      'Connect with others in a moderated, anonymous environment where you can share experiences and find support without judgment.',
    icon: ShieldCheckIcon,
    color: 'bg-emerald-500',
  },
];

const Home3 = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-white">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Empowering Your Mental Well-being
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive suite of tools and features designed to support your mental health journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
              className="relative group"
            >
              <div className="flex items-start space-x-6">
                <div
                  className={`flex-shrink-0 w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {feature.name}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4">
                    <a
                      href="#"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Learn more
                      <svg
                        className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-indigo-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Home3;
