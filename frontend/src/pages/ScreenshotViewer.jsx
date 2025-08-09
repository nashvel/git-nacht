import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';

const ScreenshotViewer = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');

  // Mock data for now - replace with API calls later
  useEffect(() => {
    setScreenshots([
      {
        id: 1,
        url: '/api/placeholder/800/600',
        commitHash: 'a1b2c3d',
        commitMessage: 'Add user authentication',
        project: 'My Web App',
        timestamp: '2024-01-15T10:30:00Z',
        viewport: '1920x1080'
      },
      {
        id: 2,
        url: '/api/placeholder/800/600',
        commitHash: 'e4f5g6h',
        commitMessage: 'Update dashboard layout',
        project: 'My Web App',
        timestamp: '2024-01-14T15:45:00Z',
        viewport: '1366x768'
      },
      {
        id: 3,
        url: '/api/placeholder/800/600',
        commitHash: 'i7j8k9l',
        commitMessage: 'Fix mobile responsiveness',
        project: 'Mobile App',
        timestamp: '2024-01-13T09:15:00Z',
        viewport: '375x667'
      }
    ]);
  }, []);

  const filteredScreenshots = screenshots.filter(screenshot => {
    const matchesSearch = screenshot.commitMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screenshot.commitHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || screenshot.project === filterProject;
    return matchesSearch && matchesProject;
  });

  const projects = [...new Set(screenshots.map(s => s.project))];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Screenshots</h1>
        <p className="text-gray-600">Visual history of your project changes</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search commits or messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>
      </div>

      {/* Screenshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScreenshots.map((screenshot) => (
          <motion.div
            key={screenshot.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedScreenshot(screenshot)}
          >
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
              <img
                src={`https://via.placeholder.com/800x600/6366f1/ffffff?text=${screenshot.project.replace(' ', '+')}`}
                alt={`Screenshot for ${screenshot.commitHash}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <EyeIcon className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {screenshot.commitHash}
                </code>
                <span className="text-xs text-gray-500">{screenshot.viewport}</span>
              </div>
              
              <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                {screenshot.commitMessage}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{screenshot.project}</span>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(screenshot.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredScreenshots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No screenshots found matching your criteria.</p>
        </div>
      )}

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedScreenshot.commitMessage}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                      {selectedScreenshot.commitHash}
                    </code>
                    <span>{selectedScreenshot.project}</span>
                    <span>{selectedScreenshot.viewport}</span>
                    <span>{new Date(selectedScreenshot.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4">
                <img
                  src={`https://via.placeholder.com/1200x800/6366f1/ffffff?text=${selectedScreenshot.project.replace(' ', '+')}`}
                  alt={`Screenshot for ${selectedScreenshot.commitHash}`}
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotViewer;
