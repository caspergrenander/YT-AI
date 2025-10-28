import React from 'react';
import { AITool } from '../services/geminiService';

interface SidebarProps {
  onPromptClick: (prompt: string) => void;
  onToolClick: (tool: AITool, promptText: string) => void;
}

const PromptButton: React.FC<{ text: string; icon?: string; onClick: () => void; isTool?: boolean }> = ({ text, icon, onClick, isTool = false }) => (
    <button
      onClick={onClick}
      className="group w-full text-left text-sm p-3 bg-white/5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center border border-white/10 hover:border-purple-400/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:bg-purple-500/10"
    >
      {icon && <i className={`${icon} w-6 text-center mr-2 ${isTool ? 'text-cyan-400' : 'text-purple-400'} group-hover:text-cyan-300 transition-all duration-300 group-hover:drop-shadow-[0_0_5px_#22d3ee] group-hover:scale-125 group-hover:-rotate-6`}></i>}
      <span className="z-10">{text}</span>
    </button>
  );

const Sidebar: React.FC<SidebarProps> = ({ onPromptClick, onToolClick }) => {
  const keyInsightsPrompts = [
    { text: "Analysera senaste videons prestanda", icon: "fa-solid fa-magnifying-glass-chart" },
    { text: "Vilka spel presterar bäst just nu?", icon: "fa-solid fa-gamepad" },
    { text: "Vad driver mest engagemang i mina videor?", icon: "fa-solid fa-fire" },
    { text: "Vilken typ av titel ger bäst CTR?", icon: "fa-solid fa-eye" },
  ];

  const toolPrompts = [
    { 
      text: "Transkribera video från URL", 
      icon: "fa-solid fa-closed-captioning", 
      tool: 'transcribe' as AITool, 
      promptText: "Ange YouTube-videons URL för transkribering:" 
    },
    { 
      text: "Generera Titel & Taggar", 
      icon: "fa-solid fa-pencil-alt", 
      tool: 'write' as AITool,
      promptText: "Beskriv videons innehåll för att generera metadata:"
    },
    { 
      text: "Föreslå Short-klipp", 
      icon: "fa-solid fa-scissors", 
      tool: 'clip' as AITool,
      promptText: "Ange URL eller ämne för videon att klippa från:"
    },
    { 
      text: "Översätt text till engelska", 
      icon: "fa-solid fa-language", 
      tool: 'translate' as AITool,
      promptText: "Ange texten du vill översätta:"
    },
  ];
  
  const conversationStarters = [
    "Föreslå en titel för en ny Helldivers 2 co-op video.",
    "Brainstorma 3 video-idéer baserat på mitt mest framgångsrika innehåll.",
  ];

  return (
    <aside className="w-64 md:w-80 h-full bg-gray-950/50 backdrop-blur-md border-r border-purple-500/20 p-4 flex-col hidden sm:flex overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-purple-400 text-glow" style={{ fontFamily: 'var(--font-heading)' }}>
          <i className="fa-solid fa-chart-line mr-2"></i>
          Dynamiska Insikter
        </h2>
        <div className="space-y-3">
          {keyInsightsPrompts.map((prompt, index) => (
            <PromptButton key={index} text={prompt.text} icon={prompt.icon} onClick={() => onPromptClick(prompt.text)} />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-cyan-400 text-glow" style={{ fontFamily: 'var(--font-heading)' }}>
          <i className="fa-solid fa-toolbox mr-2"></i>
          Lokala Agenter
        </h2>
        <div className="space-y-3">
          {toolPrompts.map((prompt, index) => (
            <PromptButton 
              key={index} 
              text={prompt.text} 
              icon={prompt.icon} 
              onClick={() => onToolClick(prompt.tool, prompt.promptText)}
              isTool={true}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-purple-400 text-glow" style={{ fontFamily: 'var(--font-heading)' }}>
          <i className="fa-solid fa-comments mr-2"></i>
          Kreativa Startare
        </h2>
        <div className="space-y-3">
          {conversationStarters.map((prompt, index) => (
            <PromptButton key={index} text={prompt} icon="fa-solid fa-sparkles" onClick={() => onPromptClick(prompt)} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;