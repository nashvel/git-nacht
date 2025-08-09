import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import LeftSidebar from './LeftSidebar';
import MobileHeader from './MobileHeader';

const DashboardLayout = () => {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!isLeftSidebarOpen);

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      setLeftSidebarOpen(true);
    },
    onSwipedLeft: () => {
      setLeftSidebarOpen(false);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Removed overflow management since sidebar is now hover-based


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        {/* --- Desktop Left Sidebar --- */}
        <div className="hidden md:block">
          <LeftSidebar />
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 md:ml-20">
          {/* --- Mobile Header --- */}
          <MobileHeader 
            onLeftSidebarToggle={handleLeftSidebarToggle}
          />

          {/* --- Main Content --- */}
          <main {...swipeHandlers} className="min-h-screen bg-white md:bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* --- Mobile Left Sidebar Overlay --- */}
        <div className={`md:hidden fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute inset-0 bg-black opacity-50" onClick={handleLeftSidebarToggle}></div>
          <div className="relative w-64 h-full bg-white shadow-xl">
            <LeftSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
