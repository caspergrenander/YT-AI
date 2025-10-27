import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 py-1">
      <div 
        className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-typing-wave"
        style={{ animationDelay: '0s' }}
      ></div>
      <div 
        className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-typing-wave"
        style={{ animationDelay: '0.3s' }}
      ></div>
      <div 
        className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-typing-wave"
        style={{ animationDelay: '0.6s' }}
      ></div>
    </div>
  );
};

export default Loader;