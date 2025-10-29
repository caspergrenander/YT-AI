import React, { useState, useEffect } from 'react';
import { ChatMessage, MessageSender, ReasoningStep } from '../types';
import { marked } from 'marked';

interface MessageProps {
  chatId: string;
  message: ChatMessage;
  onRegenerate: (chatId: string, messageId: string) => void;
  onFeedback: (chatId: string, messageId: string, feedback: 'liked' | 'disliked') => void;
  onUploadToDrive: (chatId: string, messageId: string) => void;
  onSendMessage: (text: string) => void;
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

const structuredIconMap: { [key: string]: { title: string; icon: string; color: string } } = {
    '🎯': { title: 'Insikt', icon: 'fa-solid fa-bullseye', color: 'text-rose-400' },
    '📊': { title: 'Analys', icon: 'fa-solid fa-chart-pie', color: 'text-amber-400' },
    '🚀': { title: 'Rekommendation', icon: 'fa-solid fa-rocket', color: 'text-cyan-400' },
    '💡': { title: 'Bonus', icon: 'fa-solid fa-lightbulb', color: 'text-purple-400' }
};

const reasoningIconMap: { [key: string]: string } = {
    'Context Mapping': 'fa-solid fa-map-location-dot',
    'Hypothesis Generation': 'fa-solid fa-lightbulb',
    'Evidence Weighting': 'fa-solid fa-scale-balanced',
    'Scenario Projection': 'fa-solid fa-chart-line',
    'Recommendation Synthesis': 'fa-solid fa-gears',
    'Reflection': 'fa-solid fa-brain',
    'Confidence Scoring': 'fa-solid fa-percent',
};

const intentIconMap: { [key: string]: string } = {
    'Strategic': 'fa-solid fa-compass',
    'Algorithmic': 'fa-solid fa-robot',
    'Performance': 'fa-solid fa-crystal-ball',
    'Creative': 'fa-solid fa-palette',
    'Meta': 'fa-solid fa-brain',
};

const moduleIconMap: { [key: string]: string } = {
    'Strategic Planner': 'fa-solid fa-compass',
    'Algorithmic Intelligence': 'fa-solid fa-robot',
    'Multimodal Analyst': 'fa-solid fa-film',
    'Performance Auditor': 'fa-solid fa-crystal-ball',
    'Reflection Engine': 'fa-solid fa-brain',
    'VisionEngine': 'fa-solid fa-eye',
    'AudioEngine': 'fa-solid fa-ear-listen',
    'TextEngine': 'fa-solid fa-file-alt',
    'MetricsEngine': 'fa-solid fa-chart-line',
    'Coordinator (Core)': 'fa-solid fa-atom',
};

const getConfidenceInfo = (confidence: number): { text: string; icon: string; color: string; } => {
    if (confidence >= 0.9) {
        return { text: 'Hög säkerhet', icon: 'fa-solid fa-circle-check', color: 'text-cyan-400' };
    }
    if (confidence >= 0.7) {
        return { text: 'Sannolik analys', icon: 'fa-solid fa-check', color: 'text-cyan-300' };
    }
    if (confidence >= 0.5) {
        return { text: 'Utforskande', icon: 'fa-solid fa-lightbulb', color: 'text-blue-300' };
    }
    return { text: 'Låg säkerhet', icon: 'fa-solid fa-magnifying-glass', color: 'text-gray-400' };
};


const parseStructuredResponse = (text: string) => {
    const parts = text.split(/(?=🎯|📊|🚀|💡)/g).map(p => p.trim()).filter(Boolean);
    if (parts.length < 2 || !parts.every(p => Object.keys(structuredIconMap).includes(p.charAt(0)))) {
      return null;
    }

    return parts.map(part => {
        const icon = part.charAt(0);
        const content = part.substring(1).replace(/.*?:/, '').trim();
        return { ...structuredIconMap[icon], content };
    }).filter(p => p.content);
};

const SafetyScore: React.FC<{ score: number }> = ({ score }) => {
    const getScoreInfo = () => {
        if (score >= 80) return { text: 'Säker', color: 'text-green-400', icon: 'fa-solid fa-check-circle' };
        if (score >= 60) return { text: 'Granskning krävs', color: 'text-yellow-400', icon: 'fa-solid fa-triangle-exclamation' };
        return { text: 'Flaggad', color: 'text-red-400', icon: 'fa-solid fa-ban' };
    };
    const { text, color, icon } = getScoreInfo();
    return (
        <div title={`Säkerhetspoäng: ${score}`} className={`flex items-center ${color}`}>
            <i className={`${icon} mr-1.5`}></i>
            <span>{text}</span>
        </div>
    );
};

const Message: React.FC<MessageProps> = ({ chatId, message, onRegenerate, onFeedback, onUploadToDrive, onSendMessage, isReadOnly = false }) => {
  const { id, sender, text, isError, attachment, feedback, experts, confidence, reasoningTrace, intent, responseStyle, safetyScore, suggestedReplies, visionAnalysis, audioAnalysis, textAnalysis } = message;
  const isUser = sender === MessageSender.USER;
  const isToolCall = isUser && (text.startsWith('[Verktyg anropat:'));
  const [isCopied, setIsCopied] = useState(false);
  const [uploadMetadata, setUploadMetadata] = useState<any | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  const isProResponse = !isUser && !isError && message.metadata?.mode === 'pro';
  const structuredContent = !isUser && !isError && !isProResponse ? parseStructuredResponse(displayedText) : null;
  const hasSensoryData = !isUser && !isError && (visionAnalysis || audioAnalysis || textAnalysis);
  
  useEffect(() => {
    if (isUser || isError || id === 'initial-welcome') {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, isProResponse ? 5 : 15); // Faster typing for PRO mode

    return () => clearInterval(typingInterval);
  }, [text, id, isUser, isError, isProResponse]);


  useEffect(() => {
    let uploadMeta = null;

    if (message.metadata?.readyForUpload) {
        uploadMeta = message.metadata;
    } else if (sender === MessageSender.AI && text.includes('```json')) {
        try {
            const match = text.match(/```json\n([\s\S]*?)\n```/);
            if (match && match[1]) {
                const parsed = JSON.parse(match[1]);
                if (parsed.readyForUpload) {
                    uploadMeta = parsed;
                }
            }
        } catch (e) {
            console.error("Failed to parse metadata JSON", e);
        }
    }
    setUploadMetadata(uploadMeta);
}, [text, sender, message.metadata]);


  const createMarkup = (rawText: string) => {
    const cleanText = rawText.replace(/```json\n([\s\S]*?)\n```/, '').trim();
    const rawMarkup = marked.parse(cleanText, { breaks: true, gfm: true });
    return { __html: rawMarkup };
  };

  const handleCopy = () => {
    const cleanText = text.replace(/```json\n([\s\S]*?)\n```/, '').trim();
    navigator.clipboard.writeText(cleanText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const getBubbleStyle = (style?: string) => {
    switch(style) {
      case 'Analytic':
        return 'bg-gradient-to-br from-blue-900 via-gray-900 to-gray-900 border-cyan-400/50';
      case 'Mentor':
        return 'bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 border-purple-400/50';
      case 'Dialogic':
      default:
        return 'bg-gray-800/80 backdrop-blur-sm border-cyan-400/50';
    }
  };

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  
  let bubbleClasses = '';
  if (isUser) {
    bubbleClasses = isToolCall
      ? 'bg-gray-700/50 backdrop-blur-sm text-cyan-200 rounded-br-none border border-cyan-500/50'
      : 'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-br-none';
  } else if (isProResponse) {
    bubbleClasses = 'bg-gradient-to-br from-indigo-900 via-gray-900 to-gray-900 border-cyan-500/80 rounded-bl-none border';
  } else {
    bubbleClasses = message.isError
      ? 'bg-red-900/80 backdrop-blur-sm text-red-200 rounded-bl-none border border-red-500/80'
      : `${getBubbleStyle(responseStyle)} text-gray-200 rounded-bl-none border`;
  }

  const hoverShadowClass = message.isError ? 'hover:shadow-red-900/60' : (isToolCall ? 'hover:shadow-cyan-900/60' : (isProResponse ? 'hover:shadow-indigo-900/60' : 'hover:shadow-purple-900/50'));
  const aiGlowClass = !isUser && message.id !== 'initial-welcome' && !message.isError ? 'ai-message-glow' : '';
  
  const hasAnalysisData = !isUser && !isError && (intent || (experts && experts.length > 0) || confidence || safetyScore);
  const hasTrace = reasoningTrace && reasoningTrace.length > 0;
  const canInteract = !isUser && !isError && message.id !== 'initial-welcome' && !isReadOnly && !isProResponse;
  const hasUploadAction = uploadMetadata && !isReadOnly;
  const containerPadding = (canInteract || hasUploadAction || hasAnalysisData || isProResponse) ? 'pb-12' : '';


  if (isProResponse) {
    const { tool_output, notes, confidence: proConfidence, thinkingTrace } = message.metadata;
    const { titles, hooks, plan, winner, A, B } = tool_output || {};

    return (
      <div className={`flex-col flex justify-start message-enter group relative pb-12`}>
        <div className={`p-4 rounded-xl max-w-md md:max-w-xl lg:max-w-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${bubbleClasses} ${hoverShadowClass}`}>
          <div
            className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-p:font-semibold prose-p:text-gray-100"
            dangerouslySetInnerHTML={createMarkup(displayedText)}
          />

          {winner && A && B && (
            <div className="mt-4 pt-3 border-t border-cyan-500/20">
              <h4 className="text-xs font-semibold text-cyan-300 mb-2" style={{fontFamily: 'var(--font-heading)'}}>
                <i className="fa-solid fa-table-list mr-2"></i>Comparison Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center text-sm bg-black/20 p-2 rounded-md">
                <div>
                    <div className="font-bold text-gray-300">Video A</div>
                    <div className="font-mono text-xl text-white">{A.ctr.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">CTR</div>
                </div>
                 <div>
                    <div className="font-bold text-gray-300">Video B</div>
                    <div className="font-mono text-xl text-white">{B.ctr.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">CTR</div>
                </div>
              </div>
            </div>
          )}

          {titles && Array.isArray(titles) && (
            <div className="mt-4 pt-3 border-t border-cyan-500/20">
               <h4 className="text-xs font-semibold text-cyan-300 mb-2" style={{fontFamily: 'var(--font-heading)'}}>
                <i className="fa-solid fa-i-cursor mr-2"></i>Title Suggestions
              </h4>
               <ol className="prose prose-sm prose-invert list-decimal pl-5 space-y-1">
                  {titles.map((t: string) => <li key={t}>{t}</li>)}
               </ol>
            </div>
          )}

          {hooks && Array.isArray(hooks) && (
             <div className="mt-4 pt-3 border-t border-cyan-500/20">
               <h4 className="text-xs font-semibold text-cyan-300 mb-2" style={{fontFamily: 'var(--font-heading)'}}>
                <i className="fa-solid fa-image mr-2"></i>Thumbnail Hooks
              </h4>
               <ul className="prose prose-sm prose-invert list-disc pl-5 space-y-1">
                  {hooks.map((h: string) => <li key={h}>{h}</li>)}
               </ul>
            </div>
          )}
          
          {plan && Array.isArray(plan) && (
            <div className="mt-4 pt-3 border-t border-cyan-500/20">
                <h4 className="text-xs font-semibold text-cyan-300 mb-2" style={{fontFamily: 'var(--font-heading)'}}>
                    <i className="fa-solid fa-calendar-days mr-2"></i>7-Day Post Plan
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {plan.map((p: any) => (
                        <div key={p.day} className="bg-black/20 p-2 rounded-md text-center">
                            <div className="font-bold text-white">{p.day}</div>
                            <div className={`font-semibold ${p.type === 'Long-form' ? 'text-purple-300' : p.type === 'Short' ? 'text-cyan-300' : 'text-amber-300'}`}>{p.type}</div>
                            <div className="text-gray-400 truncate" title={p.topic}>{p.topic}</div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {notes && (
            <div className="mt-4 pt-3 border-t border-cyan-500/20 text-xs text-gray-400 italic">
              <i className="fa-solid fa-note-sticky mr-2"></i> {notes}
            </div>
          )}
        </div>

        <div className="absolute bottom-1 left-0 flex items-center space-x-2 w-full pr-2">
            {thinkingTrace && thinkingTrace.length > 0 && (
                <div className="group/trace relative">
                    <button className="flex items-center text-xs text-gray-400 hover:text-white transition-colors bg-gray-900/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 opacity-80 group-hover:opacity-100">
                        <i className="fa-solid fa-code-branch mr-1.5"></i>
                        <span>{thinkingTrace.length} Steps</span>
                    </button>
                    <div className="absolute bottom-full mb-2 hidden group-hover/trace:block w-64 bg-gray-950 border border-cyan-500/30 rounded-lg p-3 shadow-lg text-xs font-mono text-cyan-200 z-10 space-y-1">
                        {thinkingTrace.map((trace: string, index: number) => (
                            <p key={index}>{trace}</p>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex-grow"></div>
            <div className="text-xs text-cyan-300/80 bg-gray-900/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 flex items-center space-x-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <div title="PRO Mode" className="flex items-center">
                    <i className="fa-solid fa-bolt-lightning mr-1.5"></i>
                    <span>PRO MODE</span>
                </div>
                {tool_output?.tool && (
                    <div title={`Tool: ${tool_output.tool}`} className="flex items-center">
                        <i className="fa-solid fa-terminal mr-1.5"></i>
                        <span className="capitalize">{tool_output.tool}</span>
                    </div>
                )}
                {proConfidence && (() => {
                    const confidenceInfo = getConfidenceInfo(proConfidence);
                    return (
                        <div title={`Confidence: ${Math.round(proConfidence * 100)}%`} className={`flex items-center ${confidenceInfo.color}`}>
                            <i className={`${confidenceInfo.icon} mr-1.5`}></i>
                            <span>{confidenceInfo.text}</span>
                        </div>
                    );
                })()}
                 <div title={`Execution Time: ${message.metadata.exec_time.toFixed(3)}s`} className="flex items-center">
                    <i className="fa-solid fa-stopwatch mr-1.5"></i>
                    <span>{(message.metadata.exec_time * 1000).toFixed(0)}ms</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-col ${containerClasses} message-enter group relative ${containerPadding}`}>
      <div className={`p-4 rounded-xl max-w-md md:max-w-xl lg:max-w-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${bubbleClasses} ${aiGlowClass} ${hoverShadowClass}`}>
        {isToolCall && (
          <div className="flex items-center text-cyan-400 mb-2 font-semibold text-sm">
            <i className="fa-solid fa-terminal mr-2"></i>
            <span>Verktygsanrop</span>
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

        {hasSensoryData && (
          <div className="mb-3 border-b border-purple-500/20 pb-3">
              <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center" style={{fontFamily: 'var(--font-heading)'}}>
                  <i className="fa-solid fa-atom mr-2 animate-spin" style={{animationDuration: '3s'}}></i>
                  Multimodal Sensory Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {visionAnalysis && (
                      <div className="bg-black/20 p-2 rounded-md space-y-1">
                          <div className="font-bold text-cyan-300 flex items-center"><i className="fa-solid fa-eye w-5"></i>Vision</div>
                          <div className="flex items-center justify-between"><span>Dominant färg:</span> <div className="w-4 h-4 rounded border border-white/20" style={{backgroundColor: visionAnalysis.dominantColor}}></div></div>
                          <div className="flex items-center justify-between"><span>Fokus:</span> <span className="capitalize">{visionAnalysis.subjectFocus}</span></div>
                          <div className="flex items-center justify-between"><span>Känsla:</span> <span className="capitalize">{visionAnalysis.emotion}</span></div>
                          <div className="flex items-center justify-between"><span>Estetik-poäng:</span> <span className="font-mono">{visionAnalysis.aestheticScore.toFixed(2)}</span></div>
                      </div>
                  )}
                  {audioAnalysis && (
                      <div className="bg-black/20 p-2 rounded-md space-y-1">
                          <div className="font-bold text-cyan-300 flex items-center"><i className="fa-solid fa-ear-listen w-5"></i>Audio</div>
                          <div className="flex items-center justify-between"><span>Taltempo (WPM):</span> <span className="font-mono">{audioAnalysis.speechRate}</span></div>
                          <div className="flex items-center justify-between"><span>Medel-pitch (Hz):</span> <span className="font-mono">{audioAnalysis.avgPitch}</span></div>
                          <div className="flex items-center justify-between"><span>Energinivå:</span> <span className="capitalize">{audioAnalysis.energy}</span></div>
                          <div className="flex items-center justify-between"><span>Känsla:</span> <span className="capitalize">{audioAnalysis.emotion}</span></div>
                          <div className="flex items-center justify-between"><span>Tydlighet:</span> <span className="font-mono">{audioAnalysis.clarityScore.toFixed(2)}</span></div>
                      </div>
                  )}
                  {textAnalysis && (
                      <div className="bg-black/20 p-2 rounded-md col-span-full space-y-1">
                          <div className="font-bold text-cyan-300 flex items-center"><i className="fa-solid fa-file-alt w-5"></i>Text</div>
                          <div className="flex items-center justify-between"><span>Tonalitet:</span> <span className="capitalize">{textAnalysis.tone}</span></div>
                          <div className="flex items-center justify-between"><span>Hook-styrka:</span> <span className="font-mono">{textAnalysis.hookStrength.toFixed(2)}</span></div>
                          <div className="flex items-center justify-start gap-2 pt-1"><span>Ämnen:</span> {textAnalysis.topicClusters.map(t => <span key={t} className="bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded text-xs">{t}</span>)}</div>
                      </div>
                  )}
              </div>
          </div>
        )}

        {structuredContent ? (
            <div className="space-y-4">
                {structuredContent.map((part, index) => (
                    <div key={index}>
                        <h3 className={`flex items-center font-bold text-md mb-1.5 ${part.color}`} style={{fontFamily: 'var(--font-heading)'}}>
                            <i className={`${part.icon} mr-2.5`}></i>
                            {part.title}
                        </h3>
                        <div
                            className="prose prose-sm prose-invert max-w-none prose-p:my-1 pl-7"
                            dangerouslySetInnerHTML={{ __html: marked.parse(part.content, { breaks: true, gfm: true }) }}
                        />
                    </div>
                ))}
            </div>
        ) : displayedText.trim() && (
          <div
            className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-0 prose-headings:font-['Exo_2'] prose-headings:text-purple-300 prose-code:text-cyan-300 prose-code:bg-black/20 prose-code:p-1 prose-code:rounded-md"
            dangerouslySetInnerHTML={createMarkup(displayedText)}
          />
        )}
        
        {suggestedReplies && suggestedReplies.length > 0 && displayedText === text && !isReadOnly && (
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                {suggestedReplies.map((reply, index) => (
                    <button
                        key={index}
                        onClick={() => onSendMessage(reply)}
                        className="text-sm text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded-full transition-colors duration-200"
                    >
                        {reply}
                    </button>
                ))}
            </div>
        )}
      </div>

      {hasTrace && (
        <div className={`transition-all duration-500 ease-in-out overflow-hidden max-w-md md:max-w-xl lg:max-w-2xl ${showTrace ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="p-3 border border-cyan-500/30 bg-gray-900/50 rounded-lg backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-cyan-300 mb-2 flex items-center" style={{fontFamily: 'var(--font-heading)'}}>
                    <i className="fa-solid fa-code-branch mr-2"></i>
                    AI:ns Tankeprocess
                </h4>
                <ul className="space-y-2 text-xs pl-1">
                    {reasoningTrace.map((step, i) => (
                        <li key={i} className="flex items-start">
                            <i className={`${reasoningIconMap[step.step] || 'fa-solid fa-circle-question'} w-5 text-center text-cyan-400/80 pt-1`}></i>
                            <div className="flex-1">
                                <span className="font-semibold text-gray-300">{step.step}</span>
                                <p className="text-gray-400">{step.details}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      )}

       <div className="absolute bottom-1 left-0 flex items-center space-x-2 w-full pr-2">
        {canInteract && (
            <div className="flex items-center space-x-1 bg-gray-900/70 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
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
                {hasTrace && (
                    <MessageInteractionButton 
                        icon="fa-circle-question"
                        label="Förklara varför"
                        onClick={() => setShowTrace(!showTrace)}
                        isActive={showTrace}
                    />
                )}
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

        <div className="flex-grow"></div>

        {hasAnalysisData && (
             <div className="text-xs text-cyan-300/80 bg-gray-900/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 flex items-center space-x-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                {safetyScore !== undefined && safetyScore !== null && <SafetyScore score={safetyScore} />}
                {intent && (
                    <div title={`Avsikt: ${intent}`} className="flex items-center">
                        <i className={`${intentIconMap[intent] || 'fa-solid fa-question-circle'} mr-1.5`}></i>
                        <span>{intent}</span>
                    </div>
                )}
                {experts && experts.length > 0 && (
                    <div title={`Primär modul: ${experts[0]}${responseStyle ? `\nStil: ${responseStyle}` : ''}`} className="flex items-center">
                        <i className={`${moduleIconMap[experts[0]] || 'fa-solid fa-microchip'} mr-1.5`}></i>
                        <span>{experts[0].replace('Strategic Planner', 'Strateg').replace('Algorithmic Intelligence', 'Algoritm').replace('Multimodal Analyst', 'Kreativ').replace('Performance Auditor', 'Audit').replace('Coordinator (Core)', 'Kärna')}</span>
                    </div>
                )}
                {confidence !== undefined && confidence !== null && (() => {
                    const confidenceInfo = getConfidenceInfo(confidence);
                    return (
                        <div title={`Säkerhet: ${Math.round(confidence * 100)}%`} className={`flex items-center ${confidenceInfo.color}`}>
                            <i className={`${confidenceInfo.icon} mr-1.5`}></i>
                            <span>{confidenceInfo.text}</span>
                        </div>
                    );
                })()}
            </div>
        )}
        
        {hasUploadAction && (
          <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => onUploadToDrive(chatId, message.id)}
                className="group flex items-center bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 text-sm"
                style={{ '--glow-color': '#22d3ee' } as React.CSSProperties}
              >
                  <i className="fa-solid fa-cloud-arrow-up mr-2 transition-transform duration-300 group-hover:-translate-y-0.5"></i>
                  Skicka till Drive
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;