import React from 'react';
import { motion } from 'framer-motion';
import { 
  CameraIcon, 
  CodeBracketIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  CommandLineIcon,
  CloudIcon,
  ShieldCheckIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const Features = () => {
  const mainFeatures = [
    {
      icon: CameraIcon,
      title: 'Automated Screenshots',
      description: 'Capture screenshots of your application automatically with each Git commit. Multiple viewport sizes supported for comprehensive visual documentation.',
      details: ['Multi-viewport capture', 'Automatic timing', 'High-quality images', 'Custom delays']
    },
    {
      icon: CodeBracketIcon,
      title: 'Git Integration',
      description: 'Seamlessly integrates with your Git workflow. Use git nacht -url <url> to capture visual snapshots tied to your commits.',
      details: ['Native Git commands', 'Commit linking', 'Branch tracking', 'Merge visualization']
    },
    {
      icon: DocumentTextIcon,
      title: 'Visual Documentation',
      description: 'Create beautiful visual patch notes that show the evolution of your project over time with rich metadata.',
      details: ['Timeline view', 'Commit messages', 'Visual diffs', 'Export options']
    },
    {
      icon: ChartBarIcon,
      title: 'Project Analytics',
      description: 'Track development progress with visual analytics, commit history insights, and team collaboration metrics.',
      details: ['Progress tracking', 'Team insights', 'Performance metrics', 'Custom reports']
    }
  ];

  const additionalFeatures = [
    { icon: ClockIcon, title: 'Real-time Sync', description: 'Instant synchronization across all devices' },
    { icon: EyeIcon, title: 'Visual Diff', description: 'Compare screenshots between commits visually' },
    { icon: CommandLineIcon, title: 'CLI Tools', description: 'Powerful command-line interface for automation' },
    { icon: CloudIcon, title: 'Cloud Storage', description: 'Secure cloud storage for all your screenshots' },
    { icon: ShieldCheckIcon, title: 'Enterprise Security', description: 'Bank-level security for your visual assets' },
    { icon: BoltIcon, title: 'Fast Performance', description: 'Lightning-fast screenshot capture and processing' },
    { icon: DevicePhoneMobileIcon, title: 'Mobile Responsive', description: 'Capture mobile and tablet viewports' },
    { icon: ComputerDesktopIcon, title: 'Desktop Apps', description: 'Support for desktop application screenshots' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-30 blur-3xl"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight">
              Powerful Features
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Everything you need to create stunning visual documentation for your Git commits
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-2">
              Core Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Discover the powerful capabilities that make Git Nacht the ultimate visual documentation tool
            </p>
          </motion.div>

          {/* Desktop Grid */}
          <motion.div
            className="hidden lg:grid grid-cols-2 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                variants={itemVariants}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile Unlimited Running Carousel */}
          <div className="lg:hidden">
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-4"
                animate={{
                  x: [0, -1200, 0],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                  },
                }}
                style={{ width: 'max-content' }}
              >
                {/* Duplicate features for seamless loop */}
                {[...mainFeatures, ...mainFeatures, ...mainFeatures].map((feature, index) => (
                  <motion.div
                    key={`carousel-${index}`}
                    className="flex-shrink-0 text-center p-4 bg-white rounded-xl shadow-sm min-w-[120px] touch-manipulation"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                      {feature.title}
                    </h3>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">✨ Continuous showcase of core features</p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-2">
              Additional Capabilities
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Even more features to enhance your development workflow
            </p>
          </motion.div>

          {/* Desktop Grid */}
          <motion.div
            className="hidden lg:grid grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
                variants={itemVariants}
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile/Tablet Unlimited Running Carousel */}
          <div className="lg:hidden">
            <div className="relative overflow-hidden py-4">
              <motion.div
                className="flex gap-6"
                animate={{
                  x: [0, -1600, 0],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
                style={{ width: 'max-content' }}
              >
                {/* Triple features for seamless loop */}
                {[...additionalFeatures, ...additionalFeatures, ...additionalFeatures].map((feature, index) => (
                  <motion.div
                    key={`additional-carousel-${index}`}
                    className="flex-shrink-0 text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 min-w-[110px] touch-manipulation"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-800 leading-tight">
                      {feature.title}
                    </h3>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">🌟 Explore our extended capabilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 sm:py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-2">
              See It In Action
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Watch how Git Nacht transforms your development workflow
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-800 rounded-2xl p-4 sm:p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-black rounded-lg p-4 sm:p-6 font-mono text-green-400 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4 min-w-max">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 ml-4 text-xs sm:text-sm">Terminal</span>
              </div>
              <div className="space-y-2 text-xs sm:text-sm min-w-max">
                <div>$ git add .</div>
                <div>$ git commit -m "Add user authentication"</div>
                <div>$ git nacht -url http://localhost:3000</div>
                <div className="text-blue-400">📸 Capturing screenshots...</div>
                <div className="text-green-400">✅ Screenshots captured for commit a1b2c3d</div>
                <div className="text-yellow-400">🔗 Visual patch note created</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-2">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of developers who are already using Git Nacht to create beautiful visual documentation
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
              <button className="border border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors touch-manipulation active:scale-95 w-full sm:w-auto">
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;
