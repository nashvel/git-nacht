import React, { useState } from 'react';
import { Bars3Icon, CodeBracketIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobileHeader = ({ onLeftSidebarToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setShowUserMenu(false);
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-20">
      <button onClick={onLeftSidebarToggle}>
        <Bars3Icon className="h-6 w-6 text-gray-800" />
      </button>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
          <CodeBracketIcon className="h-4 w-4 text-white" />
        </div>
        <div className="text-xl font-bold text-gray-800">Git Nacht</div>
      </div>
      
      {/* User Menu */}
      <div className="relative">
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
        >
          <UserIcon className="h-4 w-4 text-white" />
        </button>
        
        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowUserMenu(false)}
            ></div>
            
            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-40 min-w-[180px]">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Developer'}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email || 'dev@gitnacht.com'}</div>
              </div>
              
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-400" />
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;
