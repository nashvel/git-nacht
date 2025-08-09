import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CogIcon, BellIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      commitAlerts: true,
      screenshotAlerts: true
    },
    privacy: {
      publicProfile: false,
      shareScreenshots: true,
      allowAnalytics: true
    },
    git: {
      autoScreenshot: true,
      screenshotViewports: ['1920x1080', '1366x768', '375x667'],
      screenshotDelay: 2000
    }
  });

  const handleToggle = (section, key) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleViewportChange = (viewport, checked) => {
    setSettings(prev => ({
      ...prev,
      git: {
        ...prev.git,
        screenshotViewports: checked 
          ? [...prev.git.screenshotViewports, viewport]
          : prev.git.screenshotViewports.filter(v => v !== viewport)
      }
    }));
  };

  const availableViewports = [
    { size: '1920x1080', label: 'Desktop (1920x1080)' },
    { size: '1366x768', label: 'Laptop (1366x768)' },
    { size: '768x1024', label: 'Tablet (768x1024)' },
    { size: '375x667', label: 'Mobile (375x667)' }
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your Git Nacht experience</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Notifications Settings */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <BellIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-1">
            <ToggleSwitch
              checked={settings.notifications.emailNotifications}
              onChange={() => handleToggle('notifications', 'emailNotifications')}
              label="Email Notifications"
              description="Receive email updates about your projects"
            />
            <ToggleSwitch
              checked={settings.notifications.pushNotifications}
              onChange={() => handleToggle('notifications', 'pushNotifications')}
              label="Push Notifications"
              description="Get browser notifications for important events"
            />
            <ToggleSwitch
              checked={settings.notifications.commitAlerts}
              onChange={() => handleToggle('notifications', 'commitAlerts')}
              label="Commit Alerts"
              description="Notify when new commits are detected"
            />
            <ToggleSwitch
              checked={settings.notifications.screenshotAlerts}
              onChange={() => handleToggle('notifications', 'screenshotAlerts')}
              label="Screenshot Alerts"
              description="Notify when screenshots are captured"
            />
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
          </div>
          
          <div className="space-y-1">
            <ToggleSwitch
              checked={settings.privacy.publicProfile}
              onChange={() => handleToggle('privacy', 'publicProfile')}
              label="Public Profile"
              description="Make your profile visible to other users"
            />
            <ToggleSwitch
              checked={settings.privacy.shareScreenshots}
              onChange={() => handleToggle('privacy', 'shareScreenshots')}
              label="Share Screenshots"
              description="Allow screenshots to be shared with team members"
            />
            <ToggleSwitch
              checked={settings.privacy.allowAnalytics}
              onChange={() => handleToggle('privacy', 'allowAnalytics')}
              label="Analytics"
              description="Help improve Git Nacht by sharing usage data"
            />
          </div>
        </motion.div>

        {/* Git Integration Settings */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CogIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Git Integration</h2>
          </div>
          
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.git.autoScreenshot}
              onChange={() => handleToggle('git', 'autoScreenshot')}
              label="Auto Screenshot"
              description="Automatically capture screenshots on git nacht command"
            />
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Screenshot Viewports</h4>
              <div className="grid grid-cols-2 gap-3">
                {availableViewports.map(viewport => (
                  <label key={viewport.size} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.git.screenshotViewports.includes(viewport.size)}
                      onChange={(e) => handleViewportChange(viewport.size, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{viewport.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screenshot Delay (ms)
              </label>
              <input
                type="number"
                value={settings.git.screenshotDelay}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  git: { ...prev.git, screenshotDelay: parseInt(e.target.value) }
                }))}
                min="0"
                max="10000"
                step="500"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Time to wait before capturing screenshot
              </p>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
