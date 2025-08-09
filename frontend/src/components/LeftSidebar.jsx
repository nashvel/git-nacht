import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  CodeBracketIcon,
  PhotoIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CameraIcon,
  DocumentTextIcon,
  CogIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';


const LeftSidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Projects', icon: CodeBracketIcon, path: '/dashboard/projects' },
    { name: 'Screenshots', icon: CameraIcon, path: '/dashboard/screenshots' },
    { name: 'Commits', icon: CodeBracketIcon, path: '/dashboard/commits' },
    { name: 'Analytics', icon: ChartBarIcon, path: '/dashboard/analytics' },
    { name: 'Documentation', icon: DocumentTextIcon, path: '/dashboard/docs' },
  ];

  const bottomNavItems = [
    { name: 'Profile', icon: UserIcon, path: '/dashboard/profile' },
    { name: 'Settings', icon: CogIcon, path: '/dashboard/settings' },
  ];

  const handleLogout = async (allDevices = false) => {
    try {
      await logout(allDevices);
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setShowLogoutMenu(false);
  };

  const toggleLogoutMenu = () => {
    setShowLogoutMenu(!showLogoutMenu);
  };

  return (
    <aside 
      className={`h-screen bg-gray-50 text-gray-900 flex flex-col fixed border-r border-gray-200 transition-all duration-300 ease-out z-30 shadow-lg ${
        isExpanded ? 'w-72' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* macOS-style Header */}
      <div className="p-5 bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md ${
            !isExpanded ? 'opacity-0' : 'opacity-100'
          }`}>
            <CodeBracketIcon className="h-6 w-6 text-white" />
          </div>
          <div className={`transition-all duration-300 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            <div className="text-xl font-bold text-gray-900">Git Nacht</div>
            <div className="text-sm text-gray-500">Visual Patch Notes</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                  location.pathname === item.path 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={!isExpanded ? item.name : ''}
              >
                <item.icon className={`h-6 w-6 flex-shrink-0 ${
                  location.pathname === item.path ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className={`ml-4 font-medium transition-all duration-300 whitespace-nowrap ${
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                  {item.name}
                </span>
                {!isExpanded && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 transition-all duration-300 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            Quick Actions
          </div>
          <div className="space-y-2">
            
            <button 
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-2xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center group"
              title={!isExpanded ? 'Search' : ''}
            >
              <MagnifyingGlassIcon className="h-6 w-6 flex-shrink-0" />
              <span className={`ml-3 transition-all duration-300 whitespace-nowrap ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                Search Projects
              </span>
              {!isExpanded && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                  Search Projects
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="mt-8">
          <ul className="space-y-2">
            {bottomNavItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                    location.pathname === item.path 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={!isExpanded ? item.name : ''}
                >
                  <item.icon className={`h-6 w-6 flex-shrink-0 ${
                    location.pathname === item.path ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  <span className={`ml-4 font-medium transition-all duration-300 whitespace-nowrap ${
                    isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}>
                    {item.name}
                  </span>
                  {!isExpanded && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 relative">
        <div 
          className="flex items-center p-3 rounded-2xl hover:bg-gray-100 cursor-pointer transition-all duration-200 group" 
          onClick={toggleLogoutMenu}
          title={!isExpanded ? 'User Menu' : ''}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
          <div className={`ml-3 min-w-0 transition-all duration-300 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            <div className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'Developer'}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email || 'dev@gitnacht.com'}</div>
          </div>
          <EllipsisHorizontalIcon className={`h-5 w-5 text-gray-400 ml-auto flex-shrink-0 transition-all duration-300 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`} />
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
              User Menu
            </div>
          )}
        </div>

        {/* Logout Menu */}
        {showLogoutMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowLogoutMenu(false)}
            ></div>
            
            {/* Menu */}
            <div className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 min-w-[200px] ${
              isExpanded ? 'left-4 right-4' : 'left-full ml-2'
            }`}>
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">{user?.name || 'Developer'}</div>
                <div className="text-xs text-gray-500">{user?.email || 'dev@gitnacht.com'}</div>
              </div>
              
              <div className="py-1">
                <Link
                  to="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowLogoutMenu(false)}
                >
                  <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                  View Profile
                </Link>
                
                <Link
                  to="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowLogoutMenu(false)}
                >
                  <CogIcon className="h-4 w-4 mr-3 text-gray-400" />
                  Settings
                </Link>
              </div>
              
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={() => handleLogout(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-400" />
                  Sign out
                </button>
                
                <button
                  onClick={() => handleLogout(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <DevicePhoneMobileIcon className="h-4 w-4 mr-3 text-red-400" />
                  Sign out all devices
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;
