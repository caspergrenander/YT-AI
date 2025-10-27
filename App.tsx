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
  const [startRenamingId, setStartRenamingId] = useState<string | null>(null);

  // Load chats from localStorage on initial render
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      const savedActiveId = localStorage.getItem('activeChatId');
      
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        setChatSessions(sessions);
        setActiveChatId(savedActiveId ? JSON.parse(savedActiveId) : (sessions[0]?.id || null));
      } else {
        // Create a default first session if none exist
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load sessions from localStorage", error);
      handleNewChat(); // Start fresh if storage is corrupt
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
    if (activeChatId) {
      localStorage.setItem('activeChatId', JSON.stringify(activeChatId));
    }
  }, [chatSessions, activeChatId, isLoading]);

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
        text: "Hej! Jag är ansluten till din lokala AI-hjärna och redo att dyka ner i strategin. Vad vill du fokusera på idag?",
      }]
    };
    setChatSessions(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
    setStartRenamingId(newChat.id); // Trigger rename for the new chat
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return; // Don't allow empty titles
    setChatSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, title: newTitle.trim() } : session
      )
    );
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
    
    // Check if it's the first user message to generate a title
    const isFirstUserMessage = activeChat.messages.filter(m => m.sender === MessageSender.USER).length === 0;

    try {
      if (isFirstUserMessage && activeChat.title === "Ny Konversation") {
        const titlePrompt = text || `Analysera filen: ${attachment?.name}`;
        const newTitle = await generateChatTitle(titlePrompt);
        // Use the callback version of setChatSessions to ensure we have the latest state
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

  return (
    <div className="flex h-screen text-gray-200">
      <Sidebar onPromptClick={handleSendMessage} onToolClick={handleExecuteTool} />
      <div className="flex flex-col flex-1">
        <header className="bg-gray-950/60 backdrop-blur-xl border-b border-purple-500/30 p-4 shadow-[0_4px_15px_-5px_rgba(168,85,247,0.4)] z-10 flex items-center justify-center">
            <div className="flex-1 flex justify-start">
                <ChatSelector 
                    sessions={chatSessions}
                    activeId={activeChatId}
                    onSelectChat={setActiveChatId}
                    onNewChat={handleNewChat}
                    onRenameChat={handleRenameChat}
                    startRenamingId={startRenamingId}
                    onRenameComplete={() => setStartRenamingId(null)}
                />
            </div>
            <h1 className="text-xl font-bold text-center text-shimmer flex-shrink mx-4" style={{ fontFamily: 'var(--font-heading)' }}>
                <i className="fa-solid fa-brain mr-2 text-glow"></i>
                {activeChat?.title || "Laddar..."}
            </h1>
            <div className="flex-1"></div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatInterface messages={activeChat?.messages || []} isLoading={isLoading} />
          <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
};

export default App;
