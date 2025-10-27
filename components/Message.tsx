
import React from 'react';
import { ChatMessage, MessageSender } from '../types';
import { marked } from 'marked';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  
  const createMarkup = (text: string) => {
    const rawMarkup = marked.parse(text, { breaks: true, gfm: true });
    return { __html: rawMarkup };
  };


  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-br-none'
    : 'bg-gray-800/80 backdrop-blur-sm text-gray-200 rounded-bl-none border border-purple-500/20';

  return (
    <div className={containerClasses}>
      <div className={`p-4 rounded-xl max-w-md md:max-w-xl lg:max-w-2xl shadow-lg ${bubbleClasses}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div
            className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-0"
            dangerouslySetInnerHTML={createMarkup(message.text)}
          />
        )}
      </div>
    </div>
  );
};

export default Message;