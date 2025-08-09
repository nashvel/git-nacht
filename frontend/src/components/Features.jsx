import React from 'react';
import { motion } from 'framer-motion';
import { CameraIcon, CodeBracketIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Automated Screenshots',
    description: 'Capture screenshots of your application automatically with each Git commit. Multiple viewport sizes supported.',
    icon: CameraIcon,
  },
  {
    title: 'Git Integration',
    description: 'Seamlessly integrates with your Git workflow. Use `git nacht -url <url>` to capture visual snapshots.',
    icon: CodeBracketIcon,
  },
  {
    title: 'Visual Documentation',
    description: 'Create beautiful visual patch notes that show the evolution of your project over time.',
    icon: DocumentTextIcon,
  },
  {
    title: 'Project Analytics',
    description: 'Track development progress with visual analytics and commit history insights.',
    icon: ChartBarIcon,
  },
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

const Features = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-transparent"
              variants={itemVariants}
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 text-indigo-600 mb-4">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
