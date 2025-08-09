import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CodeBracketIcon,
  HomeIcon,
  ArrowLeftIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

const NotFound = () => {
  const [currentCommand, setCurrentCommand] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  const commands = [
    'git status',
    'ls -la',
    'pwd',
    'whoami',
    'git log --oneline',
    'npm start'
  ];

  useEffect(() => {
    // Simulate typing effect
    const interval = setInterval(() => {
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setCurrentCommand(randomCommand);
    }, 3000);

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Terminal Window */}
        <motion.div
          className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Terminal Header */}
          <div className="bg-gray-700 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 text-center">
              <span className="text-gray-300 text-sm font-medium">Git Nacht Terminal</span>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="bg-black p-6 font-mono text-sm">
            <div className="space-y-2 mb-6">
              <div className="text-green-400">
                <span className="text-blue-400">user@git-nacht</span>
                <span className="text-white">:</span>
                <span className="text-yellow-400">~/projects</span>
                <span className="text-white">$ </span>
                <span className="text-gray-300">cd /404</span>
              </div>
              <div className="text-red-400">bash: cd: /404: No such file or directory</div>
              
              <div className="text-green-400">
                <span className="text-blue-400">user@git-nacht</span>
                <span className="text-white">:</span>
                <span className="text-yellow-400">~/projects</span>
                <span className="text-white">$ </span>
                <span className="text-gray-300">ls -la /404</span>
              </div>
              <div className="text-red-400">ls: cannot access '/404': No such file or directory</div>
              
              <div className="text-green-400">
                <span className="text-blue-400">user@git-nacht</span>
                <span className="text-white">:</span>
                <span className="text-yellow-400">~/projects</span>
                <span className="text-white">$ </span>
                <span className="text-gray-300">echo "Page not found"</span>
              </div>
              <div className="text-white">Page not found</div>
              
              <div className="text-green-400">
                <span className="text-blue-400">user@git-nacht</span>
                <span className="text-white">:</span>
                <span className="text-yellow-400">~/projects</span>
                <span className="text-white">$ </span>
                <span className="text-gray-300">{currentCommand}</span>
                <span className={`text-white ${showCursor ? 'opacity-100' : 'opacity-0'}`}>▋</span>
              </div>
            </div>

            {/* ASCII Art */}
            <div className="text-cyan-400 text-xs leading-tight mb-6 font-mono">
              <pre>{`
    ██╗  ██╗ ██████╗ ██╗  ██╗
    ██║  ██║██╔═████╗██║  ██║
    ███████║██║██╔██║███████║
    ╚════██║████╔╝██║╚════██║
         ██║╚██████╔╝     ██║
         ╚═╝ ╚═════╝      ╚═╝
              `}</pre>
            </div>

            {/* Error Message */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <CommandLineIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold">Command not found</h3>
                  <p className="text-gray-400 text-xs">The requested path does not exist</p>
                </div>
              </div>
              
              <div className="text-gray-300 text-xs space-y-1">
                <div><span className="text-yellow-400">Error:</span> HTTP 404 - Resource not found</div>
                <div><span className="text-blue-400">Path:</span> {window.location.pathname}</div>
                <div><span className="text-green-400">Suggestion:</span> Try navigating to an existing route</div>
              </div>
            </div>

            {/* Available Commands */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="text-cyan-400 text-xs mb-2">Available commands:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="text-gray-300">
                  <span className="text-green-400">cd ~/</span> - Go to homepage
                </div>
                <div className="text-gray-300">
                  <span className="text-green-400">cd ~/dashboard</span> - View projects
                </div>
                <div className="text-gray-300">
                  <span className="text-green-400">cd ~/features</span> - See features
                </div>
                <div className="text-gray-300">
                  <span className="text-green-400">cd ~/signin</span> - Sign in
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <HomeIcon className="w-5 h-5" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium"
          >
            <CodeBracketIcon className="w-5 h-5" />
            View Projects
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CodeBracketIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-400 font-medium">Git Nacht</span>
          </div>
          <p className="text-gray-500 text-sm">
            Visual patch notes for developers
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
