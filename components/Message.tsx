import React, { useState } from 'react';
import { ChatMessage, MessageSender } from '../types';
import { marked } from 'marked';

interface MessageProps {
  chatId: string;
  message: ChatMessage;
  onRegenerate: (chatId: string, messageId: string) => void;
  onFeedback: (chatId: string, messageId: string, feedback: 'liked' | 'disliked') => void;
  isReadOnly?: boolean;
}

const MessageInteractionButton: React.FC<{ icon: string; label: string; onClick: () => void; isActive?: boolean }> = ({ icon, label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded-md transition-colors duration-200 ${isActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
        aria-label={label}
        title={label}
    >
        <i className={`fa-solid ${icon}`}></i>
    </button>
);


const Message: React.FC<MessageProps> = ({ chatId, message, onRegenerate, onFeedback, isReadOnly = false }) => {
  const { sender, text, isError, attachment, feedback } = message;
  const isUser = sender === MessageSender.USER;
  const isToolCall = isUser && text.startsWith('[Verktyg anropat:');
  const [isCopied, setIsCopied] = useState(false);

  const createMarkup = (text: string) => {
    const rawMarkup = marked.parse(text, { breaks: true, gfm: true });
    return { __html: rawMarkup };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
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

  const canInteract = !isUser && !isError && message.id !== 'initial-welcome' && !isReadOnly;
  const containerPadding = canInteract ? 'pb-8' : '';

  return (
    <div className={`${containerClasses} message-enter group relative ${containerPadding}`}>
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
       {canInteract && (
        <div className="absolute bottom-2 left-0 ml-2 flex items-center space-x-1 bg-gray-900/70 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <MessageInteractionButton 
                icon="fa-arrows-rotate"
                label="Regenerera svar"
                onClick={() => onRegenerate(chatId, message.id)}
            />
             <MessageInteractionButton 
                icon={isCopied ? "fa-check" : "fa-copy"}
                label="Kopiera text"
                onClick={handleCopy}
                isActive={isCopied}
            />
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <MessageInteractionButton 
                icon="fa-thumbs-up"
                label="Gilla"
                onClick={() => onFeedback(chatId, message.id, 'liked')}
                isActive={feedback === 'liked'}
            />
             <MessageInteractionButton 
                icon="fa-thumbs-down"
                label="Ogilla"
                onClick={() => onFeedback(chatId, message.id, 'disliked')}
                isActive={feedback === 'disliked'}
            />
        </div>
      )}
    </div>
  );
};

export default Message;