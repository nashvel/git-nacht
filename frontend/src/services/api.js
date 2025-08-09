// API Configuration and Service
// Safe environment variable access for React
const API_BASE_URL = (() => {
  try {
    // In Create React App, process.env is replaced at build time
    return process?.env?.REACT_APP_API_URL || 'http://localhost:8000/api';
  } catch (error) {
    // Fallback if process is not available
    console.warn('Environment variables not available, using default API URL');
    return 'http://localhost:8000/api';
  }
})();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    console.log('Getting auth headers, token:', token ? 'present' : 'missing');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
      ...(options.body && { body: JSON.stringify(options.body) })
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          // Only clear tokens and redirect if we're not on the login page
          // and if this isn't a login request
          if (!window.location.pathname.includes('/signin') && !endpoint.includes('/auth/login')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/signin';
          }
          throw new Error('Authentication failed');
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password, rememberMe = false) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password, remember_me: rememberMe }
    });
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { name, email, password }
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async logoutAllDevices() {
    return this.request('/auth/logout-all', { method: 'POST' });
  }

  async getUserSessions() {
    return this.request('/auth/sessions');
  }

  // Projects
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: projectData
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: projectData
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Screenshot methods
  async getScreenshots(page = 1, limit = 10, projectId = null) {
    const params = new URLSearchParams({ page, limit });
    if (projectId) params.append('project_id', projectId);
    
    return this.request(`/screenshots?${params}`);
  }

  async createScreenshot(screenshotData) {
    return this.request('/screenshots', {
      method: 'POST',
      body: screenshotData
    });
  }

  // GitHub integration methods
  async connectGitHub(githubToken, githubUsername = null) {
    return this.request('/github/connect', {
      method: 'POST',
      body: { github_token: githubToken, github_username: githubUsername }
    });
  }

  async getGitHubStatus() {
    return this.request('/github/status');
  }

  async getRepositoryInfo(repoUrl) {
    const params = new URLSearchParams({ url: repoUrl });
    return this.request(`/github/repo/info?${params}`);
  }

  async getRepositoryCommits(repoUrl, limit = 10) {
    const params = new URLSearchParams({ url: repoUrl, limit });
    return this.request(`/github/repo/commits?${params}`);
  }

  async disconnectGitHub() {
    return this.request('/github/disconnect', { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
