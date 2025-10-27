import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';

interface ChatSelectorProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  startRenamingId: string | null;
  onRenameComplete: () => void;
}

const ChatSelector: React.FC<ChatSelectorProps> = ({ sessions, activeId, onSelectChat, onNewChat, onRenameChat, startRenamingId, onRenameComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to automatically start renaming when a new chat is created
  useEffect(() => {
    if (startRenamingId) {
      const sessionToRename = sessions.find(s => s.id === startRenamingId);
      if (sessionToRename) {
        setEditingId(startRenamingId);
        setRenameValue(sessionToRename.title);
        setIsOpen(true); // Make sure dropdown is open
        onRenameComplete();
      }
    }
  }, [startRenamingId, sessions, onRenameComplete]);

  // Effect to focus the input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (editingId) {
          handleRenameSubmit();
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingId, renameValue]);

  const handleSelect = (id: string) => {
    if (editingId) {
      handleRenameSubmit();
    }
    onSelectChat(id);
    setIsOpen(false);
  };

  const handleRenameSubmit = () => {
    if (editingId && renameValue.trim()) {
      onRenameChat(editingId, renameValue);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setRenameValue(session.title);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200"
      >
        <i className="fa-solid fa-bars text-purple-400"></i>
        <span className="hidden md:inline">Konversationer</span>
        <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900/90 backdrop-blur-lg border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-900/50 z-20 animate-slide-in-fade">
          <div className="p-2">
            <button
              onClick={onNewChat}
              className="w-full text-left p-2.5 rounded-md hover:bg-purple-500/20 transition-colors flex items-center text-white font-semibold"
            >
              <i className="fa-solid fa-plus mr-3"></i>
              Ny Konversation
            </button>
          </div>
          <div className="border-t border-purple-500/30 my-1"></div>
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                onDoubleClick={() => startEditing(session)}
                className={`w-full text-left rounded-md transition-colors flex items-center justify-between ${
                  activeId === session.id && !editingId ? 'bg-purple-500/30' : ''
                } ${editingId !== session.id ? 'hover:bg-purple-500/20' : ''} cursor-pointer`}
              >
                {editingId === session.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-700/80 text-white p-2.5 rounded-md outline-none ring-2 ring-cyan-400"
                  />
                ) : (
                  <button onClick={() => handleSelect(session.id)} className="w-full text-left p-2.5 flex items-center justify-between">
                     <span className="truncate pr-2">{session.title}</span>
                    {activeId === session.id && (
                      <i className="fa-solid fa-check text-cyan-400"></i>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSelector;
