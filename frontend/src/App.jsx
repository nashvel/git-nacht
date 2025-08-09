import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Features from './pages/Features.jsx';
import ProjectsDashboard from './pages/ProjectsDashboard.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import ScreenshotViewer from './pages/ScreenshotViewer.jsx';
import CommitHistory from './pages/CommitHistory.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';

// Placeholder component for pages to be created
const Placeholder = ({ title }) => (
  <div className="container mx-auto px-6 py-20 text-center">
    <h1 className="text-4xl font-bold">{title}</h1>
    <p className="text-gray-600 mt-4">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="features" element={<Features />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<ProjectsDashboard />} />
          <Route path="projects" element={<ProjectsDashboard />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="screenshots" element={<ScreenshotViewer />} />
          <Route path="commits" element={<CommitHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
