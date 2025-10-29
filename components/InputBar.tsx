import React, { useState, KeyboardEvent, useRef } from 'react';

interface InputBarProps {
  onSendMessage: (text: string, attachment?: { data: string; mimeType: string; name: string }) => void;
  isLoading: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || attachment) && !isLoading) {
      onSendMessage(text, attachment);
      setText('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setAttachment({
          data: loadEvent.target?.result as string,
          mimeType: file.type,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const buttonClasses = `group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50`;

  return (
    <div className="p-4 bg-gray-950/60 backdrop-blur-xl border-t border-purple-500/30">
      {attachment && (
        <div className="mb-2 p-2 bg-gray-800/50 rounded-lg flex items-center justify-between animate-slide-in-fade">
          <div className="flex items-center space-x-2 truncate">
            {attachment.mimeType.startsWith('image/') ? (
                <img src={attachment.data} alt="Preview" className="w-8 h-8 rounded object-cover" />
            ) : (
                <i className="fa-solid fa-file-lines text-xl text-gray-400"></i>
            )}
            <span className="text-sm text-gray-300 truncate">{attachment.name}</span>
          </div>
          <button 
              onClick={() => {
                setAttachment(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Remove attachment"
          >
              <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.txt"
            disabled={isLoading}
        />
        <button 
            type="button" 
            onClick={handleUploadClick}
            disabled={isLoading}
            className="group bg-gray-700/50 hover:bg-cyan-500/20 text-cyan-300 font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 border border-cyan-500/30"
            aria-label="Attach file"
        >
            <i className="fa-solid fa-paperclip transition-transform duration-200 group-hover:scale-125"></i>
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ställ en fråga eller ladda upp en fil..."
          rows={1}
          className="flex-1 p-3 bg-gray-900/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-200 disabled:opacity-50 border border-transparent focus:border-cyan-400/50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || (!text.trim() && !attachment)}
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
