import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CodeBracketIcon,
  StarIcon,
  ArrowRightIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const SharedChange = () => {
  const { projectId, changeId } = useParams();
  const [project, setProject] = useState(null);
  const [change, setChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSharedChange = async () => {
      try {
        setLoading(true);
        
        // Load project data (public endpoint needed)
        const projectData = await api.getProject(projectId);
        setProject(projectData);
        
        // Load commits to find the specific change
        const commitsResponse = await fetch(`${api.baseURL}/github/repo/commits?url=${encodeURIComponent(projectData.repository)}&limit=50`, {
          headers: api.getAuthHeaders()
        });
        
        if (commitsResponse.ok) {
          const commitsData = await commitsResponse.json();
          const commitsArray = Array.isArray(commitsData) ? commitsData : [];
          
          // Find the specific change by ID
          const foundChange = commitsArray.find(commit => {
            const commitHash = commit.hash || commit.short_hash || commit.sha || commit.id;
            return commitHash === changeId || commitHash?.substring(0, 7) === changeId;
          });
          
          if (foundChange) {
            const repoPath = projectData.repository.replace('https://github.com/', '');
            const commitHash = foundChange.hash || foundChange.short_hash || foundChange.sha || foundChange.id;
            const commitUrl = commitHash ? `https://github.com/${repoPath}/commit/${commitHash}` : '#';
            
            setChange({
              id: commitHash,
              title: foundChange.message || 'No commit message',
              description: foundChange.message || 'No description available',
              author: foundChange.author_name || foundChange.author?.name || 'Unknown',
              date: foundChange.date || foundChange.commit_date || new Date().toISOString(),
              commitHash: commitHash?.substring(0, 7) || 'unknown',
              commitUrl: commitUrl,
              screenshot: null // TODO: Add screenshot support
            });
          } else {
            setError('Change not found');
          }
        } else {
          setError('Failed to load change data');
        }
      } catch (err) {
        console.error('Failed to load shared change:', err);
        setError('Failed to load change');
      } finally {
        setLoading(false);
      }
    };

    if (projectId && changeId) {
      loadSharedChange();
    }
  }, [projectId, changeId]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CodeBracketIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading change...</p>
        </div>
      </div>
    );
  }

  if (error || !project || !change) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CodeBracketIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Not Found</h1>
          <p className="text-gray-600 mb-6">The shared change you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Explore Git Nacht
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <CodeBracketIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Git Nacht</h1>
                <p className="text-sm text-gray-600">Visual Patch Notes</p>
              </div>
            </div>
            <Link 
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Project Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CodeBracketIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.name}</h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">{project.description}</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CodeBracketIcon className="w-4 h-4" />
              <span>{project.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4" />
              <span>{project.framework}</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4" />
              <span>Public View</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Change */}
        <motion.div
          className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <CodeBracketIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Change</h2>
                <p className="text-gray-600">Latest update from this project</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <a 
                      href={change.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {change.title}
                    </a>
                    <a
                      href={change.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium hover:bg-blue-200 transition-colors"
                    >
                      {change.commitHash}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span className="font-medium">{change.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(change.date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshot placeholder - will be implemented when screenshots are available */}
              {change.screenshot && (
                <div className="mb-6">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <img 
                      src={change.screenshot} 
                      alt="Visual changes" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">Visual changes from this commit</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-center text-white shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Like what you see?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join Git Nacht to create beautiful visual patch notes for your own projects. 
              Track changes, share updates, and showcase your development progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg"
              >
                Create Free Account
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link 
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-colors font-semibold text-lg border-2 border-blue-400"
              >
                Sign In
              </Link>
            </div>
            
            <p className="text-sm text-blue-200 mt-6">
              Free forever • No credit card required • Start in seconds
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CodeBracketIcon className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">Git Nacht</span>
          </div>
          <p className="text-gray-600">
            Visual patch notes for developers • Share your progress beautifully
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedChange;
