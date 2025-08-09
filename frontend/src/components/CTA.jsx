import React from 'react';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <motion.section
      className="bg-gray-50 py-20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Start with Git Nacht today</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Create an account and start capturing visual patch notes for your Git commits. Transform your development workflow with automated screenshots.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#" className="bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors">
              Start Now
            </a>
            <a href="#" className="bg-white text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 border border-gray-200 transition-colors">
              Learn More
            </a>
        </div>
      </div>
    </motion.section>
  );
};

export default CTA;
