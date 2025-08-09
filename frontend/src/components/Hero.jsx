import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedDashboardPreview from './AnimatedDashboardPreview';

const Hero = () => {
  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-30 blur-3xl"></div>
      <div className="relative container mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          className="text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Git Nacht
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl mx-auto md:mx-0">
            Visual patch notes for your Git commits. Capture screenshots, track changes, and create beautiful visual documentation of your development journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
            <Link to="/signin" className="bg-indigo-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center">
              Get Started
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="relative h-full min-h-[300px] md:min-h-[400px]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AnimatedDashboardPreview />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
