import React, { useState, useEffect, useMemo } from 'react';
import { ChatMessage, MessageSender, ChatSession } from './types';
import { getLocalAIResponse, executeAITool, AITool, generateChatTitle } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import ChatSelector from './components/ChatSelector';

const App: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [startRenamingId, setStartRenamingId] = useState<string | null>(null);
  const [sharedSession, setSharedSession] = useState<ChatSession | null>(null);

  // Load chats from localStorage or URL hash on initial render
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
          const encodedData = hash.substring(7); // Remove '#share='
          const jsonString = atob(encodedData);
          const sessionData = JSON.parse(jsonString) as ChatSession;
          setSharedSession(sessionData);
          setIsLoading(false);
          return; // Stop further execution to stay in share mode
      }

      const savedSessions = localStorage.getItem('chatSessions');
      const savedActiveId = localStorage.getItem('activeChatId');
      
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        if (sessions.length > 0) {
            setChatSessions(sessions);
            const activeId = savedActiveId ? JSON.parse(savedActiveId) : sessions[0].id;
            setActiveChatId(sessions.some(s => s.id === activeId) ? activeId : sessions[0].id);
        } else {
             handleNewChat();
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load session from hash or localStorage", error);
      if (window.location.hash) {
          window.location.hash = ''; // Clear corrupted hash
      }
      handleNewChat();
    } finally {
        if (!window.location.hash.startsWith('#share=')) {
            setIsLoading(false);
        }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && chatSessions.length > 0 && !sharedSession) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
    if (activeChatId && !sharedSession) {
      localStorage.setItem('activeChatId', JSON.stringify(activeChatId));
    }
  }, [chatSessions, activeChatId, isLoading, sharedSession]);

  const activeChat = useMemo(() => {
    return chatSessions.find(session => session.id === activeChatId);
  }, [chatSessions, activeChatId]);

  const updateChatSession = (chatId: string, updatedMessages: ChatMessage[], newTitle?: string) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === chatId
          ? { ...session, messages: updatedMessages, title: newTitle || session.title }
          : session
      )
    );
  };
  
  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: `session-${Date.now()}`,
      title: "Ny Konversation",
      messages: [{
        id: 'initial-welcome',
        sender: MessageSender.AI,
        text: "Hej! Jag är din lokala AI-hjärna, Casper_AutoPilot. Jag kör helt offline på din dator. Hur kan vi optimera ditt YouTube-innehåll idag?",
      }]
    };
    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setStartRenamingId(newChat.id);
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setChatSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, title: newTitle.trim() } : session
      )
    );
  };

  const handleDeleteChat = (idToDelete: string) => {
    const originalIndex = chatSessions.findIndex(s => s.id === idToDelete);
    const updatedSessions = chatSessions.filter(s => s.id !== idToDelete);
  
    if (updatedSessions.length === 0) {
      handleNewChat();
    } else {
      setChatSessions(updatedSessions);
      if (activeChatId === idToDelete) {
        const newActiveIndex = Math.max(0, originalIndex - 1);
        setActiveChatId(updatedSessions[newActiveIndex].id);
      }
    }
  };
  
  const handleShareChat = (chatId: string) => {
    const sessionToShare = chatSessions.find(s => s.id === chatId);
    if (sessionToShare) {
        try {
            const jsonString = JSON.stringify(sessionToShare);
            const encodedData = btoa(jsonString); // Base64 encode
            const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encodedData}`;
            navigator.clipboard.writeText(shareUrl);
            // Visual feedback is handled in ChatSelector
        } catch (error) {
            console.error("Failed to create share link:", error);
            alert("Kunde inte skapa delningslänk. Konversationen kan vara för stor.");
        }
    }
  };

  const handleSendMessage = async (text: string, attachment?: { data: string; mimeType: string; name: string }) => {
    if ((!text.trim() && !attachment) || !activeChat) return;

    const userMessage: ChatMessage = { 
        id: `user-${Date.now()}`, 
        sender: MessageSender.USER, 
        text,
        attachment, 
    };
    const currentMessages = [...activeChat.messages, userMessage];
    updateChatSession(activeChat.id, currentMessages);
    setIsLoading(true);
    
    const isFirstUserMessage = activeChat.messages.filter(m => m.sender === MessageSender.USER).length === 0;

    try {
      if (isFirstUserMessage && activeChat.title === "Ny Konversation") {
        const titlePrompt = text || `Analysera filen: ${attachment?.name}`;
        const newTitle = await generateChatTitle(titlePrompt);
        setChatSessions(prev => prev.map(s => s.id === activeChat.id ? { ...s, title: newTitle } : s));
      }

      const aiResponseText = await getLocalAIResponse(text, activeChat.messages, chatSessions, activeChat, attachment);
      const aiMessage: ChatMessage = { id: `ai-${Date.now()}`, sender: MessageSender.AI, text: aiResponseText };
      updateChatSession(activeChat.id, [...currentMessages, aiMessage]);
    } catch (error) {
      const errorMessageText = error instanceof Error ? error.message : "Ett okänt fel inträffade.";
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: MessageSender.AI,
        text: `**🛑 Oj, något gick fel!**\n\n${errorMessageText}`,
        isError: true,
      };
      updateChatSession(activeChat.id, [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteTool = async (tool: AITool, promptText: string, params: Record<string, any> = {}) => {
    if (!activeChat) return;
    const input = window.prompt(promptText);
    if (!input) return;

    const toolMessage: ChatMessage = {
        id: `tool-${Date.now()}`,
        sender: MessageSender.USER,
        text: `[Verktyg anropat: ${tool}]\nInput: \`${input}\``,
    };
    const currentMessages = [...activeChat.messages, toolMessage];
    updateChatSession(activeChat.id, currentMessages);
    setIsLoading(true);

    try {
        const toolResultText = await executeAITool(tool, { ...params, input });
        const resultMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: MessageSender.AI,
            text: `**✅ Resultat från verktyget '${tool}':**\n\n${toolResultText}`,
        };
        updateChatSession(activeChat.id, [...currentMessages, resultMessage]);
    } catch (error) {
        const errorMessageText = error instanceof Error ? error.message : "Ett okänt fel inträffade.";
        const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: MessageSender.AI,
            text: `**🛑 Oj, verktyget misslyckades!**\n\n${errorMessageText}`,
            isError: true,
        };
        updateChatSession(activeChat.id, [...currentMessages, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegenerateResponse = async (chatId: string, messageId: string) => {
    const session = chatSessions.find(s => s.id === chatId);
    if (!session) return;

    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex < 1 || session.messages[messageIndex].sender !== MessageSender.AI) return;

    const historyUpToPrompt = session.messages.slice(0, messageIndex);
    const lastUserMessage = historyUpToPrompt[historyUpToPrompt.length - 1];

    if (lastUserMessage.sender !== MessageSender.USER) return;

    setIsRegenerating(true);
    try {
      const aiResponseText = await getLocalAIResponse(
        lastUserMessage.text, 
        historyUpToPrompt, 
        chatSessions, 
        session, 
        lastUserMessage.attachment
      );
      
      const newAiMessage: ChatMessage = { id: `ai-${Date.now()}`, sender: MessageSender.AI, text: aiResponseText };
      
      const updatedMessages = [...historyUpToPrompt, newAiMessage];
      updateChatSession(chatId, updatedMessages);

    } catch (error) {
       const errorMessageText = error instanceof Error ? error.message : "Ett okänt fel inträffade.";
       const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: MessageSender.AI,
        text: `**🛑 Oj, något gick fel vid regenerering!**\n\n${errorMessageText}`,
        isError: true,
      };
      const updatedMessages = [...historyUpToPrompt, errorMessage];
      updateChatSession(chatId, updatedMessages);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleMessageFeedback = (chatId: string, messageId: string, feedback: 'liked' | 'disliked') => {
    setChatSessions(prev => prev.map(session => {
        if (session.id !== chatId) return session;

        const updatedMessages = session.messages.map(message => {
            if (message.id !== messageId) return message;
            
            const newFeedback = message.feedback === feedback ? null : feedback;
            return { ...message, feedback: newFeedback };
        });

        return { ...session, messages: updatedMessages };
    }));
  };

  if (isLoading) {
    // A simple full-page loader
    return <div className="w-screen h-screen flex items-center justify-center bg-gray-950 text-white">Laddar...</div>;
  }

  if (sharedSession) {
    return (
      <div className="flex h-screen text-gray-200">
        <div className="flex flex-col flex-1">
          <header className="bg-gray-950/60 backdrop-blur-xl border-b border-purple-500/30 p-4 shadow-[0_4px_15px_-5px_rgba(168,85,247,0.4)] z-10 flex items-center justify-between">
            <h1 className="text-xl font-bold text-center text-shimmer" style={{ fontFamily: 'var(--font-heading)' }}>
              <i className="fa-solid fa-share-nodes mr-2 text-glow"></i>
              Delad Konversation: {sharedSession.title}
            </h1>
            <a href={window.location.pathname} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Tillbaka till Appen
            </a>
          </header>
          <main className="flex-1 overflow-hidden flex flex-col">
            <ChatInterface 
              chatId={sharedSession.id}
              messages={sharedSession.messages} 
              isLoading={false} 
              onRegenerate={() => {}}
              onFeedback={() => {}}
              isReadOnly={true}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen text-gray-200">
      <Sidebar onPromptClick={handleSendMessage} onToolClick={handleExecuteTool} />
      <div className="flex flex-col flex-1">
        <header className="bg-gray-950/60 backdrop-blur-xl border-b border-purple-500/30 p-4 shadow-[0_4px_15px_-5px_rgba(168,85,247,0.4)] z-10 flex items-center justify-between">
            <div className="flex-1 flex justify-start">
                <ChatSelector 
                    sessions={chatSessions}
                    activeId={activeChatId}
                    onSelectChat={setActiveChatId}
                    onNewChat={handleNewChat}
                    onRenameChat={handleRenameChat}
                    onDeleteChat={handleDeleteChat}
                    onShareChat={handleShareChat}
                    startRenamingId={startRenamingId}
                    onRenameComplete={() => setStartRenamingId(null)}
                />
            </div>
            <h1 className="text-xl font-bold text-center text-shimmer flex-shrink mx-4" style={{ fontFamily: 'var(--font-heading)' }}>
                <i className="fa-solid fa-brain mr-2 text-glow"></i>
                Local AI Brain: <span className="text-white/80 font-medium">{activeChat?.title || "Laddar..."}</span>
            </h1>
            <div className="flex-1 flex justify-end items-center">
                <div className="flex items-center space-x-2 text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span>Lokal Anslutning</span>
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatInterface 
            chatId={activeChat?.id || ''}
            messages={activeChat?.messages || []} 
            isLoading={isLoading || isRegenerating} 
            onRegenerate={handleRegenerateResponse}
            onFeedback={handleMessageFeedback}
          />
          <InputBar onSendMessage={handleSendMessage} isLoading={isLoading || isRegenerating} />
        </main>
      </div>
    </div>
  );
};

export default App;