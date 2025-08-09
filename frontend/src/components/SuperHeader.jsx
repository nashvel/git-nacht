import React from 'react';
import { motion } from 'framer-motion';

const SuperHeader = ({ title, subtitle }) => {
  return (
    <section className="relative bg-gray-900 text-white overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-30 blur-3xl"></div>
      <div className="relative container mx-auto px-6 text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold text-white" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          {title}
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-300 mt-4 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
};

export default SuperHeader;
