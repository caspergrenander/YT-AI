import React from 'react';
import { ChatMessage, MessageSender } from '../types';
import { marked } from 'marked';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { sender, text, isError, attachment } = message;
  const isUser = sender === MessageSender.USER;
  const isToolCall = isUser && text.startsWith('[Verktyg anropat:');

  const createMarkup = (text: string) => {
    const rawMarkup = marked.parse(text, { breaks: true, gfm: true });
    return { __html: rawMarkup };
  };

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  
  let bubbleClasses = '';
  if (isUser) {
    bubbleClasses = isToolCall
      ? 'bg-gray-700/50 backdrop-blur-sm text-cyan-200 rounded-br-none border border-cyan-500/50'
      : 'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-br-none';
  } else {
    bubbleClasses = message.isError
      ? 'bg-red-900/80 backdrop-blur-sm text-red-200 rounded-bl-none border border-red-500/80'
      : 'bg-gray-800/80 backdrop-blur-sm text-gray-200 rounded-bl-none border border-purple-400/50';
  }

  const hoverShadowClass = message.isError ? 'hover:shadow-red-900/60' : (isToolCall ? 'hover:shadow-cyan-900/60' : 'hover:shadow-purple-900/50');
  const aiGlowClass = !isUser && message.id !== 'initial-welcome' && !message.isError ? 'ai-message-glow' : '';

  return (
    <div className={`${containerClasses} message-enter`}>
      <div className={`p-4 rounded-xl max-w-md md:max-w-xl lg:max-w-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${bubbleClasses} ${aiGlowClass} ${hoverShadowClass}`}>
        {isToolCall && (
          <div className="flex items-center text-cyan-400 mb-2 font-semibold text-sm">
            <i className="fa-solid fa-terminal mr-2"></i>
            <span>Verktygskörning</span>
          </div>
        )}
        
        {attachment && (
            <div className="mb-2 rounded-lg overflow-hidden">
                {attachment.mimeType.startsWith('image/') ? (
                    <img 
                        src={attachment.data} 
                        alt={attachment.name} 
                        className="max-w-xs max-h-64 object-contain rounded-lg border border-black/20" 
                    />
                ) : (
                    <div className="flex items-center p-3 bg-black/20 rounded-lg border border-gray-600/50">
                        <i className="fa-solid fa-file-lines text-xl text-gray-300 mr-3"></i>
                        <span className="text-sm text-gray-200 truncate font-medium">{attachment.name}</span>
                    </div>
                )}
            </div>
        )}

        {text.trim() && (
          <div
            className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-0 prose-headings:font-['Exo_2'] prose-headings:text-cyan-300 prose-code:text-purple-300 prose-code:bg-black/20 prose-code:p-1 prose-code:rounded-md"
            dangerouslySetInnerHTML={createMarkup(message.text)}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
