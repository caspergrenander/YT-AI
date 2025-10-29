import React, { useState, useEffect, useMemo } from 'react';
import { ChatMessage, MessageSender, ChatSession } from './types';
import { getAIResponse, runAITool, AITool, uploadToDrive, syncAnalytics } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import ChatSelector from './components/ChatSelector';

const App: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResponding, setIsResponding] = useState<boolean>(false);
  const [startRenamingId, setStartRenamingId] = useState<string | null>(null);
  const [sharedSession, setSharedSession] = useState<ChatSession | null>(null);
  const [online, setOnline] = useState(window.navigator.onLine);
  const [aiStatus, setAiStatus] = useState<'idle' | 'working' | 'error'>("idle");

  const LOCAL_STORAGE_KEY = 'gpt5-core-chats';

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      if (window.navigator.onLine) {
        setAiStatus('working');
        syncAnalytics()
          .then(data => {
            if (data) {
              console.log("Analytics synced:", data);
            }
            setAiStatus('idle');
          })
          .catch(err => {
            console.error("Failed to sync analytics due to an unexpected error:", err);
            setAiStatus('error');
          });
      }

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
            handleNewChat(false);
          }
        } else {
          handleNewChat(false);
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      handleNewChat(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      title: "Ny GPT-5 Session",
      messages: [{
        id: 'initial-welcome',
        sender: MessageSender.AI,
        text: "GPT-5 online. Jag har analyserat din kanals senaste data. Redo att hitta guldkornen, eller behöver vi släcka några bränder?",
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
    setAiStatus('working');

    try {
      const aiResponse = await getAIResponse(text, currentChat.messages, attachment);
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: MessageSender.AI,
        text: aiResponse.message,
        metadata: aiResponse,
        experts: aiResponse.experts,
        confidence: aiResponse.confidence,
        reasoningTrace: aiResponse.reasoning_trace,
        intent: aiResponse.intent,
        responseStyle: aiResponse.response_style,
      };
      updateChatMessages(currentChat.id, prev => [...prev, aiMessage]);
      
      if (currentChat.messages.length <= 2 && currentChat.title === "Ny GPT-5 Session") {
        const newTitle = text ? text.substring(0, 30) + '...' : `Analys av ${attachment?.name}`;
        handleRenameChat(currentChat.id, newTitle);
      }
      setAiStatus('idle');
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: MessageSender.AI,
        text: error instanceof Error ? error.message : "Ett okänt fel uppstod.",
        isError: true,
      };
      updateChatMessages(currentChat.id, prev => [...prev, errorMessage]);
      setAiStatus('error');
    } finally {
      setIsResponding(false);
    }
  };

  const handleUploadToDrive = async (chatId: string, messageId: string) => {
    const chat = chatSessions.find(c => c.id === chatId);
    if (!chat) return;

    const aiMessage = chat.messages.find(m => m.id === messageId);
    if (!aiMessage) return;

    setAiStatus('working');
    try {
        let metadata;
        if (aiMessage.metadata && aiMessage.metadata.readyForUpload) {
            metadata = aiMessage.metadata.upload_metadata || aiMessage.metadata;
        } else {
            const metadataMatch = aiMessage.text.match(/```json\n([\s\S]*?)\n```/);
            if (metadataMatch && metadataMatch[1]) {
                const parsed = JSON.parse(metadataMatch[1]);
                if (parsed.readyForUpload) {
                    metadata = parsed;
                }
            }
        }

        if (!metadata) {
            throw new Error("Kunde inte extrahera giltig metadata från AI-svaret.");
        }
      
      if (!metadata.videoPath) {
        throw new Error("Metadata från AI:n saknar nödvändig 'videoPath' för optimering.");
      }
      
      updateChatMessages(chatId, prev => [...prev, { id: `info-${Date.now()}`, sender: MessageSender.AI, text: `Startar optimering av "${metadata.videoPath}"...`}]);
      
      const { result: toolResult } = await runAITool("optimize_video", { 
          videoPath: metadata.videoPath, 
          title: metadata.title,
          description: metadata.description
      });

      updateChatMessages(chatId, prev => [...prev, { id: `succ-${Date.now()}`, sender: MessageSender.AI, text: `✅ ${toolResult}`}]);
      setAiStatus('idle');

    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Ett okänt fel inträffade vid optimering.";
      updateChatMessages(chatId, prev => [...prev, { id: `err-${Date.now()}`, sender: MessageSender.AI, text: `❌ Optimeringsprocessen misslyckades: ${errorText}`, isError: true }]);
      setAiStatus('error');
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
      if (messageIndex < 1) return;

      const historyUpToMessage = chat.messages.slice(0, messageIndex - 1);
      const userPromptMessage = chat.messages[messageIndex - 1];

      updateChatMessages(chatId, chat.messages.slice(0, messageIndex));
      setIsResponding(true);
      setAiStatus('working');

      try {
        const aiResponse = await getAIResponse(userPromptMessage.text, historyUpToMessage, userPromptMessage.attachment);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: MessageSender.AI,
          text: aiResponse.message,
          metadata: aiResponse,
          experts: aiResponse.experts,
          confidence: aiResponse.confidence,
          reasoningTrace: aiResponse.reasoning_trace,
          intent: aiResponse.intent,
          responseStyle: aiResponse.response_style,
        };
        updateChatMessages(chatId, prev => [...prev, aiMessage]);
        setAiStatus('idle');
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: MessageSender.AI,
          text: error instanceof Error ? error.message : "Ett okänt fel uppstod.",
          isError: true,
        };
        updateChatMessages(chatId, prev => [...prev, errorMessage]);
        setAiStatus('error');
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
    setAiStatus('working');

    try {
      const { result: toolResult } = await runAITool(tool, { prompt: userInput });
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: MessageSender.AI,
        text: toolResult,
      };
      updateChatMessages(currentChat.id, prev => [...prev, aiMessage]);
      setAiStatus('idle');
    } catch(error) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: MessageSender.AI,
        text: error instanceof Error ? error.message : `Fel vid körning av verktyg ${tool}.`,
        isError: true,
      };
      updateChatMessages(currentChat.id, prev => [...prev, errorMessage]);
      setAiStatus('error');
    } finally {
      setIsResponding(false);
    }
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
            <h1 className="text-2xl font-bold text-shimmer">Laddar GPT-5 Kärnan...</h1>
        </div>
    );
  }
  
  const aiStatusMessage = {
      working: 'GPT-5 resonerar...',
      error: 'Ett fel uppstod i GPT-5 kärnan',
  }[aiStatus] || null;

  return (
    <div className="relative">
       <div className="absolute top-0 left-0 right-0 z-50 text-center text-sm">
            {!online && (
              <div className="bg-yellow-600 text-black py-1">
                Offline-läge – arbetar med senast sparade data
              </div>
            )}
            {online && aiStatusMessage && (
                <div className={`py-1 ${aiStatus === 'error' ? 'bg-red-600 text-white' : 'bg-blue-900/80 text-blue-300'}`}>
                    <i className={`fa-solid ${aiStatus === 'working' ? 'fa-cog fa-spin' : 'fa-triangle-exclamation'} mr-2`}></i>
                    {aiStatusMessage}
                </div>
            )}
       </div>
      <div className={`flex h-screen max-h-screen bg-gray-900 text-gray-100 ${(aiStatus !== 'idle' || !online) ? 'pt-6' : ''}`}>
        <Sidebar onSendMessage={handleSendMessage} onToolClick={handleToolClick} />
        <main className="flex-1 flex flex-col relative">
            <header className="flex items-center justify-between p-3 border-b border-cyan-500/30 bg-gray-950/60 backdrop-blur-xl z-10">
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
                  GPT-5 Core Interface
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
                  isReadOnly={!!sharedSession}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Välj en session eller starta en ny.</p>
                </div>
              </div>
            )}
            <InputBar onSendMessage={handleSendMessage} isLoading={isResponding} />
        </main>
      </div>
    </div>
  );
};

export default App;