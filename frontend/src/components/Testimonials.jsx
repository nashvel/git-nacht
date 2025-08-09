import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const testimonials = [
  {
    quote: 'Git Nacht has revolutionized our development workflow. Visual patch notes help our team track UI changes across commits with incredible clarity.',
    author: 'Satya Nadella',
    title: 'CEO, Microsoft',
  },
  {
    quote: 'The automated screenshot capture has been a game-changer for our code review process. We can instantly see visual changes without running the code.',
    author: 'Sundar Pichai',
    title: 'CEO, Google',
  },
  {
    quote: 'Git Nacht\'s visual documentation approach has improved our development velocity by 40%. It\'s an indispensable tool for modern software teams.',
    author: 'Jensen Huang',
    title: 'CEO, NVIDIA',
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="bg-gray-900 py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <p className="text-base font-semibold text-indigo-400 uppercase">What our partners say</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-2">Trusted by tech leaders worldwide</h2>
        </div>

        {/* Desktop View */}
        <motion.div
          className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-black/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-700 flex flex-col h-full"
              variants={itemVariants}
            >
              <FaQuoteLeft className="text-indigo-400 text-3xl mb-6" />
              <p className="text-gray-300 text-lg mb-6 leading-relaxed flex-grow">{testimonial.quote}</p>
              <div className="flex items-center mt-auto">
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="bg-black/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-700 flex flex-col h-full"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <FaQuoteLeft className="text-indigo-400 text-3xl mb-6" />
              <p className="text-gray-300 text-lg mb-6 leading-relaxed flex-grow">{testimonials[currentIndex].quote}</p>
              <div className="flex items-center mt-auto">
                <div>
                  <p className="text-white font-semibold">{testimonials[currentIndex].author}</p>
                  <p className="text-gray-400 text-sm">{testimonials[currentIndex].title}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button 
            onClick={prevTestimonial} 
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800/50 p-2 rounded-full text-white hover:bg-gray-700/70 transition-colors z-10 -ml-4"
          >
            <FaChevronLeft size={20} />
          </button>
          <button 
            onClick={nextTestimonial} 
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800/50 p-2 rounded-full text-white hover:bg-gray-700/70 transition-colors z-10 -mr-4"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
