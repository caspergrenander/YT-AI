import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';

interface ChatSelectorProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  onShareChat: (id: string) => void;
  startRenamingId: string | null;
  onRenameComplete: () => void;
}

const ChatSelector: React.FC<ChatSelectorProps> = ({ sessions, activeId, onSelectChat, onNewChat, onRenameChat, onDeleteChat, onShareChat, startRenamingId, onRenameComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startRenamingId) {
      const sessionToRename = sessions.find(s => s.id === startRenamingId);
      if (sessionToRename) {
        setEditingId(startRenamingId);
        setRenameValue(sessionToRename.title);
        setIsOpen(true);
        onRenameComplete();
      }
    }
  }, [startRenamingId, sessions, onRenameComplete]);

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

  const handleItemClick = (session: ChatSession) => {
    if (editingId && editingId !== session.id) {
        handleRenameSubmit();
    }
    if (session.id === activeId) {
        startEditing(session);
    } else {
        onSelectChat(session.id);
        setIsOpen(false);
    }
  };

  const handleRenameSubmit = () => {
    if (editingId && renameValue.trim()) {
      onRenameChat(editingId, renameValue);
    }
    setEditingId(null);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    if(window.confirm(`Är du säker på att du vill radera konversationen "${session.title}" permanent?`)) {
        onDeleteChat(session.id);
    }
  }

  const handleShareClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    onShareChat(session.id);
    setCopiedId(session.id);
    setTimeout(() => {
        setCopiedId(null);
    }, 2000);
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
  
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (b.id.split('-')[1] as any) - (a.id.split('-')[1] as any));

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
          <div className="p-2 space-y-2">
            <button
              onClick={onNewChat}
              className="w-full text-left p-2.5 rounded-md hover:bg-purple-500/20 transition-colors flex items-center text-white font-semibold"
            >
              <i className="fa-solid fa-plus mr-3"></i>
              Ny Konversation
            </button>
            <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                <input
                    type="text"
                    placeholder="Sök konversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800/80 text-white p-2.5 pl-9 rounded-md outline-none focus:ring-2 focus:ring-cyan-400"
                />
            </div>
          </div>
          <div className="border-t border-purple-500/30"></div>
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                className={`group w-full text-left rounded-md transition-colors flex items-center justify-between ${
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
                  <>
                    <button onClick={() => handleItemClick(session)} className="flex-grow text-left p-2.5 flex items-center min-w-0">
                      <span className="truncate pr-2">{session.title}</span>
                      {activeId === session.id && (
                        <i className="fa-solid fa-check text-cyan-400 ml-auto flex-shrink-0"></i>
                      )}
                    </button>
                    <div className="flex items-center flex-shrink-0 mr-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            onClick={(e) => handleShareClick(e, session)}
                            className="p-2 rounded-full text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                            aria-label={`Dela ${session.title}`}
                            title="Kopiera delningslänk"
                        >
                            <i className={`fa-solid ${copiedId === session.id ? 'fa-check text-cyan-400' : 'fa-share-nodes'} text-xs transition-all`}></i>
                        </button>
                        <button
                            onClick={(e) => handleDeleteClick(e, session)}
                            className="p-2 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            aria-label={`Radera ${session.title}`}
                        >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                  </>
                )}
              </div>
            ))}
             {filteredSessions.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                    Inga konversationer hittades.
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSelector;