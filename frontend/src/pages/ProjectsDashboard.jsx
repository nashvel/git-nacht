import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  FolderIcon, 
  PhotoIcon, 
  CodeBracketIcon,
  ChartBarIcon,
  StarIcon,
  EyeIcon,
  UsersIcon,
  ClockIcon,
  XMarkIcon,
  CameraIcon,
  DocumentTextIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', repository: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await api.getProjects();
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Failed to load projects:', error);
        setProjects([]);
      }
    };
    
    loadProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!newProject.repository.trim()) {
        setError('Repository URL is required');
        setLoading(false);
        return;
      }
      
      // Auto-generate project name from repository URL if not provided
      let projectName = newProject.name.trim();
      if (!projectName) {
        const repoUrl = newProject.repository.trim();
        const match = repoUrl.match(/\/([^\/]+?)(?:\.git)?$/);
        projectName = match ? match[1] : 'Untitled Project';
      }
      
      // Create project via API
      const createdProject = await api.createProject({
        name: projectName,
        description: newProject.description.trim(),
        repository: newProject.repository.trim()
      });
      
      // Add to local state
      setProjects([...projects, createdProject]);
      
      // Reset form
      setNewProject({ name: '', description: '', repository: '' });
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('Failed to create project:', error);
      setError(error.message || 'Failed to create project. Please check the repository URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteProject(projectId);
      
      // Remove project from local state
      setProjects(projects.filter(p => p.id !== projectId));
      
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStats = {
    totalProjects: projects.length,
    totalScreenshots: projects.reduce((sum, p) => sum + (p?.screenshotCount || 0), 0),
    totalCommits: projects.reduce((sum, p) => sum + (p?.commitCount || 0), 0),
    avgCoverage: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p?.coverage || 0), 0) / projects.length) : 0
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600 text-lg">Manage your Git repositories and visual patch notes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalStats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Screenshots</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalStats.totalScreenshots}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CameraIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commits</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalStats.totalCommits}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <CodeBracketIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Coverage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalStats.avgCoverage}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.filter(project => project && project.id).map((project, index) => (
          <Link key={project.id} to={`/dashboard/projects/${project.id}`}>
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                  <FolderIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{project.stars}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteProject(project.id, project.name);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete project"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">{project.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{project.framework}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">{project.commitCount}</span>
                </div>
                <p className="text-xs text-gray-500">Commits</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CameraIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">{project.screenshotCount}</span>
                </div>
                <p className="text-xs text-gray-500">Screenshots</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ChartBarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">{project.coverage}%</span>
                </div>
                <p className="text-xs text-gray-500">Coverage</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>{project.lastActivity}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <EyeIcon className="w-4 h-4" />
                <span>{project.contributors} contributors</span>
              </div>
            </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Repository</h2>
              <p className="text-gray-600">Connect your Git repository to start tracking visual changes</p>
            </div>
            
            <form onSubmit={handleCreateProject}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Git Repository URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/repository.git"
                    value={newProject.repository}
                    onChange={(e) => setNewProject({ ...newProject, repository: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supports GitHub, GitLab, Bitbucket, and other Git repositories
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Will be auto-detected from repository"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Brief description of your project"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    rows="3"
                  />
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setNewProject({ name: '', description: '', repository: '' });
                  }}
                  disabled={loading}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Import Repository'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;
