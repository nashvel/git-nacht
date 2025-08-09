import React from 'react';

const Page = ({ title, children }) => {
  return (
    <div>
      <div className="sticky top-0 bg-white bg-opacity-80 backdrop-blur-md z-10 border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Page;
