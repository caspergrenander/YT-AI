
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import Loader from './Loader';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-transparent">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg max-w-lg border-t border-purple-500/50">
                <Loader />
            </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatInterface;