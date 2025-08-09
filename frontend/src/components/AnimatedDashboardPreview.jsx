import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Terminal Command Component
const TerminalCommand = ({ command, output, delay = 0 }) => {
  const [showCommand, setShowCommand] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const commandTimer = setTimeout(() => setShowCommand(true), delay);
    const outputTimer = setTimeout(() => setShowOutput(true), delay + 1000);
    
    return () => {
      clearTimeout(commandTimer);
      clearTimeout(outputTimer);
    };
  }, [delay]);

  return (
    <div className="mb-4">
      <AnimatePresence>
        {showCommand && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="flex items-center text-green-400 mb-2"
          >
            <span className="text-gray-400 mr-2">$</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-mono text-sm"
            >
              {command}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showOutput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-300 ml-4 space-y-1"
          >
            {output.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={line.color || 'text-gray-300'}
              >
                {line.text}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimatedDashboardPreview = () => {
  const [currentCommand, setCurrentCommand] = useState(0);
  
  const commands = [
    {
      command: 'git add .',
      output: []
    },
    {
      command: 'git commit -m "Add user authentication"',
      output: [
        { text: '[main a1b2c3d] Add user authentication', color: 'text-white' },
        { text: '3 files changed, 45 insertions(+), 12 deletions(-)', color: 'text-gray-400' }
      ]
    },
    {
      command: 'git nacht -url http://localhost:3000',
      output: [
        { text: ' Capturing screenshots...', color: 'text-blue-400' },
        { text: ' Desktop (1920x1080) captured', color: 'text-green-400' },
        { text: ' Tablet (768x1024) captured', color: 'text-green-400' },
        { text: ' Mobile (375x667) captured', color: 'text-green-400' },
        { text: ' Visual patch note created', color: 'text-yellow-400' },
        { text: 'Screenshots saved to: ./screenshots/a1b2c3d/', color: 'text-gray-400' }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCommand((prev) => (prev + 1) % commands.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {/* macOS Terminal Window */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl h-full flex flex-col">
        {/* Terminal Header */}
        <div className="bg-gray-800 rounded-t-2xl px-4 py-3 flex items-center gap-2 border-b border-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 text-center">
            <span className="text-gray-400 text-sm font-medium">Terminal — git-nacht</span>
          </div>
        </div>
        
        {/* Terminal Content */}
        <div className="flex-1 p-4 bg-black/90 font-mono text-sm overflow-hidden">
          <div className="text-gray-400 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">➜</span>
              <span className="text-blue-400">my-web-app</span>
              <span className="text-yellow-400">git:(main)</span>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCommand}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {commands.slice(0, currentCommand + 1).map((cmd, index) => (
                <TerminalCommand
                  key={`${currentCommand}-${index}`}
                  command={cmd.command}
                  output={cmd.output}
                  delay={index * 1500}
                />
              ))}
            </motion.div>
          </AnimatePresence>
          
          {/* Cursor */}
          <motion.div
            className="flex items-center text-green-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <span className="text-gray-400 mr-2">$</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-4 bg-green-400 inline-block"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDashboardPreview;
