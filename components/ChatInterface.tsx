import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import ThinkingIndicator from './ThinkingIndicator';

interface ChatInterfaceProps {
  chatId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  onRegenerate: (chatId: string, messageId: string) => void;
  onFeedback: (chatId: string, messageId: string, feedback: 'liked' | 'disliked') => void;
  onUploadToDrive: (chatId: string, messageId: string) => void;
  onSendMessage: (text: string) => void;
  isReadOnly?: boolean;
  mode: 'gpt5' | 'pro';
  thinkingMessage: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, messages, isLoading, onRegenerate, onFeedback, onUploadToDrive, onSendMessage, isReadOnly = false, mode, thinkingMessage }) => {
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
      {isLoading && thinkingMessage && (
        <div className="flex justify-start message-enter">
            <ThinkingIndicator mode={mode} message={thinkingMessage} />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatInterface;