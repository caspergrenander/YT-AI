import React, { useState, KeyboardEvent } from 'react';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };
  
  const buttonClasses = `group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50`;

  return (
    <div className="p-4 bg-gray-950/60 backdrop-blur-xl border-t border-purple-500/30">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ställ en fråga till din AI-assistent eller brainstorma en idé..."
          rows={1}
          className="flex-1 p-3 bg-gray-900/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-200 disabled:opacity-50 border border-transparent focus:border-cyan-400/50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`${buttonClasses} ${!isLoading ? 'pulse-btn-glow' : ''}`}
        >
          {isLoading ? (
            <i className="fa-solid fa-circle-notch fa-spin"></i>
          ) : (
            <i className="fa-solid fa-paper-plane transition-transform duration-200 group-hover:scale-125"></i>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputBar;