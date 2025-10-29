import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import Loader from './Loader';

interface ChatInterfaceProps {
  chatId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  onRegenerate: (chatId: string, messageId: string) => void;
  onFeedback: (chatId: string, messageId: string, feedback: 'liked' | 'disliked') => void;
  onUploadToDrive: (chatId: string, messageId: string) => void;
  onSendMessage: (text: string) => void;
  isReadOnly?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, messages, isLoading, onRegenerate, onFeedback, onUploadToDrive, onSendMessage, isReadOnly = false }) => {
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
        <Message 
          key={msg.id} 
          chatId={chatId}
          message={msg} 
          onRegenerate={onRegenerate}
          onFeedback={onFeedback}
          onUploadToDrive={onUploadToDrive}
          onSendMessage={onSendMessage}
          isReadOnly={isReadOnly}
        />
      ))}
      {isLoading && (
        <div className="flex justify-start">
            <div className="flex items-center bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg max-w-lg border-t border-purple-500/50">
                <Loader />
                <span className="text-sm text-gray-400 ml-3 animate-pulse">GPT-5 formulerar svar...</span>
            </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatInterface;