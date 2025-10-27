import React, { useState, useEffect } from 'react';
import { ChatMessage, MessageSender } from './types';
import { getLocalAIResponse } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Send an initial welcome message from the AI
    const welcomeMessage: ChatMessage = {
      id: 'initial-welcome',
      sender: MessageSender.AI,
      text: "Hej! Jag är ansluten till din lokala AI-hjärna och redo att dyka ner i strategin. Fråga mig om dina topp-presterande videor, eller klicka på en av startarna för att komma igång. Vad vill du fokusera på idag?",
    };
    setMessages([welcomeMessage]);
    setIsLoading(false);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: MessageSender.USER,
      text,
    };

    const history = messages;

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await getLocalAIResponse(text, history);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: MessageSender.AI,
        text: aiResponseText,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: MessageSender.AI,
        text: "Ledsen, jag kunde inte ansluta till AI-hjärnan. Kontrollera din anslutning och försök igen.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen bg-black/30 text-gray-200">
      <Sidebar onPromptClick={handlePromptClick} />
      <div className="flex flex-col flex-1">
        <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/30 p-4 shadow-lg z-10">
          <h1 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            <i className="fa-solid fa-brain mr-2 text-glow"></i>
            YouTube AI-Assistent
          </h1>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatInterface messages={messages} isLoading={isLoading} />
          <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
};

export default App;