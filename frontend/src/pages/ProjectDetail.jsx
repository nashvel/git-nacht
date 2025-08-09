import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  LinkIcon,
  StarIcon,
  EyeIcon,
  UsersIcon,
  CodeBracketIcon,
  CameraIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent-changes');
  const [commits, setCommits] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [recentChanges, setRecentChanges] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const loadProjectAndCommits = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        // Load project data from API
        const api = (await import('../services/api')).default;
        const projectData = await api.getProject(projectId);
        setProject(projectData);

        // Load commits and recent changes from GitHub API
        if (projectData && projectData.repository) {
          try {
            const commitsResponse = await fetch(`${api.baseURL}/github/repo/commits?url=${encodeURIComponent(projectData.repository)}&limit=10`, {
              headers: api.getAuthHeaders()
            });
            
            if (commitsResponse.ok) {
              const commitsData = await commitsResponse.json();
              
              // Ensure commitsData is an array before processing
              const commitsArray = Array.isArray(commitsData) ? commitsData : [];
              setCommits(commitsArray);
              
              // Convert commits to recent changes format
              const recentChangesData = commitsArray.map(commit => {
                // Extract repository path from project repository URL
                const repoPath = projectData.repository.replace('https://github.com/', '');
                
                // Handle different possible commit data structures
                const commitHash = commit.hash || commit.short_hash || commit.sha || commit.id;
                const commitMessage = commit.message || 'No commit message';
                const authorName = commit.author_name || commit.author?.name || 'Unknown';
                const commitDate = commit.date || commit.commit_date || new Date().toISOString();
                
                const commitUrl = commitHash ? `https://github.com/${repoPath}/commit/${commitHash}` : '#';
                
                return {
                  id: commitHash || Date.now() + Math.random(),
                  title: commitMessage,
                  description: commitMessage,
                  author: authorName,
                  date: commitDate,
                  status: 'success',
                  device: 'desktop',
                  screenshot: null,
                  likes: 0,
                  comments: [],
                  tags: [],
                  commitHash: commitHash?.substring(0, 7) || 'unknown',
                  commitUrl: commitUrl // Add GitHub commit URL
                };
              });
              setRecentChanges(recentChangesData);
            } else {
              console.warn('Failed to load commits:', commitsResponse.status);
              setCommits([]);
              setRecentChanges([]);
            }
          } catch (error) {
            console.error('Error loading commits:', error);
            setCommits([]);
            setRecentChanges([]);
          }
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        // Only redirect if project truly doesn't exist (404), not on other errors
        if (error.message && error.message.includes('404')) {
          navigate('/dashboard/projects');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProjectAndCommits();

    // TODO: Load screenshots from API
    setScreenshots([]);
    
    // Initialize empty comments
    setComments({});
  }, [projectId, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommitStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      case 'desktop': return '🖥️';
      default: return '🖥️';
    }
  };

  const handleAddComment = (changeId) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      author: 'You',
      text: newComment,
      date: new Date().toLocaleString()
    };
    
    setComments(prev => ({
      ...prev,
      [changeId]: [...(prev[changeId] || []), comment]
    }));
    
    setNewComment('');
  };

  const handleCopyShareUrl = (changeId) => {
    // Generate shareable URL for the specific change
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/share/${projectId}/${changeId}`;
    
    navigator.clipboard.writeText(shareUrl);
    alert('Share URL copied to clipboard! Anyone can view this change without signing in.');
  };

  const handleLikeChange = (changeId) => {
    setRecentChanges(prev => prev.map(change => 
      change.id === changeId 
        ? { ...change, likes: change.likes + 1 }
        : change
    ));
  };

  // Skeleton components for ProjectDetail
  const ProjectDetailSkeleton = () => (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-8">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-28 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex items-center gap-4">
              <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading || !project) {
    return <ProjectDetailSkeleton />;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/dashboard/projects" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Projects
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CodeBracketIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 text-lg mb-2">{project.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <CodeBracketIcon className="w-4 h-4 text-blue-500" />
                  <span>{project.language || 'JavaScript'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DocumentTextIcon className="w-4 h-4 text-green-500" />
                  <span>{project.framework || 'Web'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{project.stars} stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{project.contributors} contributors</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Updated {project.lastActivity}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href={project.repository} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Repository
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-600">Commits</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{project.commitCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-600">Screenshots</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{project.screenshotCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-600">Coverage</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{project.coverage}%</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-600">Size</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{project.size}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['recent-changes', 'overview', 'commits', 'screenshots', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'recent-changes' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Changes</h3>
              <div className="space-y-8">
                {recentChanges.map((change, index) => (
                  <motion.div
                    key={change.id}
                    className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Change Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <a 
                            href={change.commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {change.title}
                          </a>
                          <a
                            href={change.commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                          >
                            {change.commitHash}
                          </a>
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">{change.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="font-medium">{change.author}</span>
                          <span>{change.date}</span>
                          <div className="flex gap-1">
                            {change.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Change Image - Only show if screenshot exists */}
                    {change.screenshot && (
                      <div className="mb-4">
                        <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-2 max-w-md">
                          <img 
                            src={change.screenshot} 
                            alt="Visual changes" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-gray-500 text-center">Visual changes from this commit</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLikeChange(change.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                          <HeartIcon className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">{change.likes}</span>
                        </button>
                        <button 
                          onClick={() => handleCopyShareUrl(change.commitHash)}
                          className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                          <ShareIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Share</span>
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Share this change:</span> <code className="bg-white px-2 py-1 rounded text-xs ml-1">{window.location.origin}/share/{projectId}/{change.commitHash}</code>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        Comments ({(comments[change.id] || []).length})
                      </h5>
                      
                      {/* Existing Comments */}
                      <div className="space-y-3 mb-4">
                        {(comments[change.id] || []).map((comment) => (
                          <div key={comment.id} className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{comment.author[0]}</span>
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500">{comment.date}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">Y</span>
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(change.id)}
                          />
                          <button
                            onClick={() => handleAddComment(change.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Language</label>
                      <p className="text-gray-900">{project.language}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Framework</label>
                      <p className="text-gray-900">{project.framework}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">License</label>
                      <p className="text-gray-900">{project.license}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <p className="text-gray-900">{project.createdAt}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Default Branch</label>
                      <p className="text-gray-900">{project.branch}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Topics</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.topics.map((topic, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">README</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {project.readme}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commits' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Commits</h3>
              <div className="space-y-4">
                {commits.map((commit) => (
                  <motion.div
                    key={commit.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: commit.id * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      {getCommitStatusIcon(commit.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{commit.message}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{commit.author}</span>
                        <span>{commit.hash}</span>
                        <span>{commit.date}</span>
                        <span className="flex items-center gap-1">
                          <CameraIcon className="w-3 h-3" />
                          {commit.screenshotCount} screenshots
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'screenshots' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Screenshots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screenshots.map((screenshot) => (
                  <motion.div
                    key={screenshot.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: screenshot.id * 0.1 }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-4xl">{getDeviceIcon(screenshot.device)}</div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{screenshot.title}</h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{screenshot.viewport}</p>
                      <p>Commit: {screenshot.commit}</p>
                      <p>{screenshot.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Commit Activity</h4>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Screenshot Trends</h4>
                  <div className="h-32 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
