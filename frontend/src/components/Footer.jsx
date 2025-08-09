import React from 'react';

const SocialIcon = ({ children }) => (
  <a href="#" className="text-gray-400 hover:text-white">
    <span className="sr-only">Social Media</span>
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-30 blur-3xl"></div>
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Wayvi</h3>
            <div className="flex space-x-4 mt-4">
              {/* Placeholder for social icons */}
              <SocialIcon>T</SocialIcon>
              <SocialIcon>F</SocialIcon>
              <SocialIcon>L</SocialIcon>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Real-Time Tracking</a></li>
              <li><a href="#" className="hover:text-white">Route Optimization</a></li>
              <li><a href="#" className="hover:text-white">Rider Alerts</a></li>
              <li><a href="#" className="hover:text-white">Analytics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Developers</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">API Documentation</a></li>
              <li><a href="#" className="hover:text-white">SDKs</a></li>
              <li><a href="#" className="hover:text-white">API Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Jobs</a></li>
              <li><a href="#" className="hover:text-white">Newsroom</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Support Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Sales</a></li>
              <li><a href="#" className="hover:text-white">Privacy & Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; 2025 Wayvi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
