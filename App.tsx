import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChatMessage, MessageSender, ChatSession } from './types';
import { getLocalAIResponse, executeAITool, AITool, generateChatTitle, uploadToDrive, improveVideo } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import ChatSelector from './components/ChatSelector';

const App: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For initial load
  const [isResponding, setIsResponding] = useState<boolean>(false); // For AI responses
  const [startRenamingId, setStartRenamingId] = useState<string | null>(null);
  const [sharedSession, setSharedSession] = useState<ChatSession | null>(null);

  const LOCAL_STORAGE_KEY = 'casper-autopilot-chats';

  // Load chats from localStorage or URL hash on initial render
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const encodedData = hash.substring(7);
        const jsonString = atob(encodedData);
        const sessionData = JSON.parse(jsonString) as ChatSession;
        setSharedSession(sessionData);
        setChatSessions([sessionData]);
        setActiveChatId(sessionData.id);
      } else {
        const savedChats = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedChats) {
          const parsedChats = JSON.parse(savedChats);
          if (parsedChats.length > 0) {
            setChatSessions(parsedChats);
            setActiveChatId(parsedChats[0].id);
          } else {
            handleNewChat(false); // Create a new chat if storage is empty
          }
        } else {
          handleNewChat(false); // Create a new chat on first visit
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      handleNewChat(false); // Start fresh if loading fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (!sharedSession) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatSessions));
    }
  }, [chatSessions, sharedSession]);
  
  const activeChat = useMemo(() => {
    return chatSessions.find(c => c.id === activeChatId) ?? null;
  }, [chatSessions, activeChatId]);
  
  const updateChatMessages = (chatId: string, messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[])) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === chatId
          ? { ...session, messages: typeof messages === 'function' ? messages(session.messages) : messages }
          : session
      )
    );
  };
  
  const handleNewChat = (activate: boolean = true) => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: "Ny Konversation",
      messages: [{
        id: 'initial-welcome',
        sender: MessageSender.AI,
        text: "Hej! Jag är din lokala AI-kollega, Casper. Hur kan vi tillsammans krossa dina YouTube-mål idag? Ladda upp en fil eller ställ en fråga för att komma igång!",
      }],
    };
    setChatSessions(prev => [newChat, ...prev]);
    if (activate) {
      setActiveChatId(newChat.id);
    }
    return newChat;
  };

  const handleSendMessage = async (text: string, attachment?: { data: string; mimeType: string; name: string }) => {
    if (!activeChatId || isResponding) return;

    let currentChat = activeChat;
    if (!currentChat) {
      currentChat = handleNewChat();
    }
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: MessageSender.USER,
      text,
      attachment,
    };
    updateChatMessages(currentChat.id, prev => [...prev, userMessage]);
    setIsResponding(true);

    try {
      const aiResponseText = await getLocalAIResponse(text, currentChat.messages, chatSessions, currentChat, attachment);
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: MessageSender.AI,
        text: aiResponseText,
      };
      updateChatMessages(currentChat.id, prev => [...prev, aiMessage]);
      
      // Auto-rename chat if it's the first user message
      if (currentChat.messages.length <= 2 && currentChat.title === "Ny Konversation") {
        const newTitle = await generateChatTitle(text || `Analys av ${attachment?.name}`);
        handleRenameChat(currentChat.id, newTitle);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: MessageSender.AI,
        text: error instanceof Error ? error.message : "Ett okänt fel uppstod.",
        isError: true,
      };
      updateChatMessages(currentChat.id, prev => [...prev, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleUploadToDrive = async (chatId: string, messageId: string) => {
    const chat = chatSessions.find(c => c.id === chatId);
    if (!chat) return;

    const aiMessageIndex = chat.messages.findIndex(m => m.id === messageId);
    const aiMessage = chat.messages[aiMessageIndex];
    if (!aiMessage || aiMessageIndex === 0) return;
    
    // The user message with the attachment should be right before the AI's response
    const userMessage = chat.messages[aiMessageIndex - 1];
    if (!userMessage || !userMessage.attachment) {
       updateChatMessages(chatId, prev => [...prev, { id: `err-${Date.now()}`, sender: MessageSender.AI, text: "Kunde inte hitta den ursprungliga filen att ladda upp. Försök igen.", isError: true }]);
       return;
    }

    try {
      const metadataMatch = aiMessage.text.match(/```json\n([\s\S]*?)\n```/);
      if (!metadataMatch || !metadataMatch[1]) {
        throw new Error("Kunde inte extrahera metadata från AI-svaret.");
      }
      const metadata = JSON.parse(metadataMatch[1]);
      
      updateChatMessages(chatId, prev => [...prev, { id: `info-${Date.now()}`, sender: MessageSender.AI, text: `Startar uppladdning av "${userMessage.attachment?.name}" till Google Drive...`}]);
      
      const responseMessage = await uploadToDrive(userMessage.attachment, metadata);
      
      updateChatMessages(chatId, prev => [...prev, { id: `succ-${Date.now()}`, sender: MessageSender.AI, text: `✅ ${responseMessage}`}]);

    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Ett okänt fel inträffade vid uppladdning.";
      updateChatMessages(chatId, prev => [...prev, { id: `err-${Date.now()}`, sender: MessageSender.AI, text: `❌ Uppladdningen misslyckades: ${errorText}`, isError: true }]);
    }
  };

  const handleImproveVideo = async (chatId: string, videoId: string) => {
    updateChatMessages(chatId, prev => [...prev, { id: `info-${Date.now()}`, sender: MessageSender.AI, text: `🤖 Startar autonom förbättringsprocess för video [${videoId}]...`}]);
    
    try {
        const responseMessage = await improveVideo(videoId);
        updateChatMessages(chatId, prev => [...prev, { id: `succ-${Date.now()}`, sender: MessageSender.AI, text: `✅ ${responseMessage}`}]);
    } catch (error) {
        const errorText = error instanceof Error ? error.message : "Ett okänt fel inträffade vid videoförbättringen.";
        updateChatMessages(chatId, prev => [...prev, { id: `err-${Date.now()}`, sender: MessageSender.AI, text: `❌ Förbättringen misslyckades: ${errorText}`, isError: true }]);
    }
  };

  const handleSelectChat = (id: string) => setActiveChatId(id);

  const handleDeleteChat = (id: string) => {
    setChatSessions(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      const remainingChats = chatSessions.filter(c => c.id !== id);
      setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setChatSessions(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };
  
  const handleFeedback = (chatId: string, messageId: string, feedback: 'liked' | 'disliked') => {
      updateChatMessages(chatId, (messages) =>
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, feedback: msg.feedback === feedback ? null : feedback } : msg
        )
      );
  };
  
  const handleRegenerate = async (chatId: string, messageId: string) => {
      const chat = chatSessions.find(c => c.id === chatId);
      if (!chat || isResponding) return;
      
      const messageIndex = chat.messages.findIndex(m => m.id === messageId);
      if (messageIndex < 1) return; // Cannot regenerate the very first message or non-existent messages

      const historyUpToMessage = chat.messages.slice(0, messageIndex - 1);
      const userPromptMessage = chat.messages[messageIndex - 1];

      // Remove the old AI response and any subsequent messages
      updateChatMessages(chatId, chat.messages.slice(0, messageIndex));
      setIsResponding(true);

      try {
        const aiResponseText = await getLocalAIResponse(userPromptMessage.text, historyUpToMessage, chatSessions, chat, userPromptMessage.attachment);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: MessageSender.AI,
          text: aiResponseText,
        };
        updateChatMessages(chatId, prev => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: MessageSender.AI,
          text: error instanceof Error ? error.message : "Ett okänt fel uppstod.",
          isError: true,
        };
        updateChatMessages(chatId, prev => [...prev, errorMessage]);
      } finally {
        setIsResponding(false);
      }
  };

  const handleToolClick = async (tool: AITool, promptText: string) => {
    const userInput = prompt(promptText);
    if (!userInput || !activeChatId) return;

    let currentChat = activeChat;
    if (!currentChat) {
      currentChat = handleNewChat();
    }
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: MessageSender.USER,
      text: `[Verktyg anropat: ${tool}] - ${userInput}`,
    };
    updateChatMessages(currentChat.id, prev => [...prev, userMessage]);
    setIsResponding(true);

    try {
      const toolResult = await executeAITool(tool, { prompt: userInput });
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: MessageSender.AI,
        text: toolResult,
      };
      updateChatMessages(currentChat.id, prev => [...prev, aiMessage]);
    } catch(error) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: MessageSender.AI,
        text: error instanceof Error ? error.message : `Fel vid körning av verktyg ${tool}.`,
        isError: true,
      };
      updateChatMessages(currentChat.id, prev => [...prev, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };
  
  const handlePromptClick = (prompt: string) => {
      handleSendMessage(prompt);
  };
  
  const handleShareChat = (id: string) => {
    const session = chatSessions.find(s => s.id === id);
    if (session) {
      const jsonString = JSON.stringify(session);
      const encodedData = btoa(jsonString);
      const url = `${window.location.origin}${window.location.pathname}#share=${encodedData}`;
      navigator.clipboard.writeText(url);
    }
  };

  if (isLoading) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold text-shimmer">Laddar AI Hjärnan...</h1>
        </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen bg-gray-900 text-gray-100">
      <Sidebar onPromptClick={handlePromptClick} onToolClick={handleToolClick} />
      <main className="flex-1 flex flex-col relative">
          <header className="flex items-center justify-between p-3 border-b border-purple-500/30 bg-gray-950/60 backdrop-blur-xl z-10">
              <ChatSelector 
                sessions={chatSessions}
                activeId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onRenameChat={handleRenameChat}
                onDeleteChat={handleDeleteChat}
                onShareChat={handleShareChat}
                startRenamingId={startRenamingId}
                onRenameComplete={() => setStartRenamingId(null)}
              />
              <h1 className="text-xl font-bold text-shimmer hidden md:block" style={{ fontFamily: 'var(--font-heading)' }}>
                Casper_AutoPilot
              </h1>
              <div className="w-48"></div>
          </header>
          {activeChat ? (
            <ChatInterface 
                chatId={activeChat.id}
                messages={activeChat.messages} 
                isLoading={isResponding}
                onRegenerate={handleRegenerate}
                onFeedback={handleFeedback}
                onUploadToDrive={handleUploadToDrive}
                onImproveVideo={handleImproveVideo}
                isReadOnly={!!sharedSession}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Välj en konversation eller starta en ny.</p>
              </div>
            </div>
          )}
          <InputBar onSendMessage={handleSendMessage} isLoading={isResponding} />
      </main>
    </div>
  );
};

export default App;