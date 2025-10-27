import React, { useState, useEffect } from 'react';
import { ChatMessage, MessageSender } from './types';
import { getLocalAIResponse, executeAITool, AITool } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
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
      const errorMessageText = error instanceof Error ? error.message : "Ett okänt fel inträffade.";
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: MessageSender.AI,
        text: `**🛑 Oj, något gick fel!**\n\n${errorMessageText}`,
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExecuteTool = async (tool: AITool, promptText: string, params: Record<string, any> = {}) => {
    const input = window.prompt(promptText);
    if (!input) return;

    const toolMessage: ChatMessage = {
        id: `tool-${Date.now()}`,
        sender: MessageSender.USER,
        text: `[Verktyg anropat: ${tool}]\nInput: \`${input}\``,
    };

    setMessages(prev => [...prev, toolMessage]);
    setIsLoading(true);

    try {
        const toolResultText = await executeAITool(tool, { ...params, input });
        const resultMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: MessageSender.AI,
            text: `**✅ Resultat från verktyget '${tool}':**\n\n${toolResultText}`,
        };
        setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
        const errorMessageText = error instanceof Error ? error.message : "Ett okänt fel inträffade.";
        const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: MessageSender.AI,
            text: `**🛑 Oj, verktyget misslyckades!**\n\n${errorMessageText}`,
            isError: true,
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
    <div className="flex h-screen text-gray-200">
      <Sidebar onPromptClick={handlePromptClick} onToolClick={handleExecuteTool} />
      <div className="flex flex-col flex-1">
        <header className="bg-gray-950/60 backdrop-blur-xl border-b border-purple-500/30 p-4 shadow-[0_4px_15px_-5px_rgba(168,85,247,0.4)] z-10">
          <h1 className="text-xl font-bold text-center text-shimmer" style={{ fontFamily: 'var(--font-heading)' }}>
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
