import React from 'react';
import { FaGithub, FaFacebook } from 'react-icons/fa';

const SocialLogins = () => {
  return (
    <>
      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400">Or continue with</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800/50 text-sm font-medium text-white hover:bg-gray-700/50 transition-colors"
        >
          <FaGithub className="w-5 h-5 mr-2" />
          GitHub
        </button>
        <button
          type="button"
          className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800/50 text-sm font-medium text-white hover:bg-gray-700/50 transition-colors"
        >
          <FaFacebook className="w-5 h-5 mr-2 text-blue-500" />
          Facebook
        </button>
      </div>
    </>
  );
};

export default SocialLogins;
