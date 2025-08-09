import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CodeBracketIcon, CalendarIcon, UserIcon, CameraIcon } from '@heroicons/react/24/outline';

const CommitHistory = () => {
  const [commits, setCommits] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');

  // Mock data for now - replace with API calls later
  useEffect(() => {
    setCommits([
      {
        id: 1,
        hash: 'a1b2c3d4e5f',
        message: 'Add user authentication system',
        author: 'John Doe',
        timestamp: '2024-01-15T10:30:00Z',
        project: 'My Web App',
        hasScreenshot: true,
        screenshotCount: 2
      },
      {
        id: 2,
        hash: 'e4f5g6h7i8j',
        message: 'Update dashboard layout and improve responsiveness',
        author: 'Jane Smith',
        timestamp: '2024-01-14T15:45:00Z',
        project: 'My Web App',
        hasScreenshot: true,
        screenshotCount: 3
      },
      {
        id: 3,
        hash: 'i7j8k9l0m1n',
        message: 'Fix mobile navigation issues',
        author: 'John Doe',
        timestamp: '2024-01-13T09:15:00Z',
        project: 'Mobile App',
        hasScreenshot: false,
        screenshotCount: 0
      },
      {
        id: 4,
        hash: 'o2p3q4r5s6t',
        message: 'Implement dark mode toggle',
        author: 'Alice Johnson',
        timestamp: '2024-01-12T14:20:00Z',
        project: 'My Web App',
        hasScreenshot: true,
        screenshotCount: 1
      }
    ]);
  }, []);

  const filteredCommits = commits.filter(commit => 
    selectedProject === 'all' || commit.project === selectedProject
  );

  const projects = [...new Set(commits.map(c => c.project))];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commit History</h1>
        <p className="text-gray-600">Track your development progress with visual documentation</p>
      </div>

      {/* Project Filter */}
      <div className="mb-6">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>
      </div>

      {/* Commits Timeline */}
      <div className="space-y-4">
        {filteredCommits.map((commit, index) => (
          <motion.div
            key={commit.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <code className="bg-gray-100 px-3 py-1 rounded-md font-mono text-sm">
                    {commit.hash}
                  </code>
                  <span className="text-sm text-gray-600">{commit.project}</span>
                  {commit.hasScreenshot && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      <CameraIcon className="w-3 h-3" />
                      {commit.screenshotCount} screenshot{commit.screenshotCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {commit.message}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {commit.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(commit.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {commit.hasScreenshot ? (
                  <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-200 transition-colors">
                    View Screenshots
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">No screenshots</span>
                )}
                <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors">
                  View Diff
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCommits.length === 0 && (
        <div className="text-center py-12">
          <CodeBracketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No commits found for the selected project.</p>
        </div>
      )}
    </div>
  );
};

export default CommitHistory;
