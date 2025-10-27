import React from 'react';

interface SidebarProps {
  onPromptClick: (prompt: string) => void;
}

const PromptButton: React.FC<{ text: string; icon?: string; onClick: () => void }> = ({ text, icon, onClick }) => (
    <button
      onClick={onClick}
      className="group w-full text-left text-sm p-3 bg-white/5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-purple-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 left-0 h-full w-1 bg-purple-400 transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300"></div>
      
      {icon && <i className={`${icon} w-6 text-center mr-2 text-purple-400 group-hover:text-cyan-300 transition-colors duration-300 z-10`}></i>}
      <span className="z-10">{text}</span>
    </button>
  );


const Sidebar: React.FC<SidebarProps> = ({ onPromptClick }) => {
  const keyInsightsPrompts = [
    { text: "Vilka spel presterar bäst just nu?", icon: "fa-solid fa-gamepad" },
    { text: "Vad driver mest engagemang i mina videor?", icon: "fa-solid fa-fire" },
    { text: "Vilken typ av titel ger bäst CTR?", icon: "fa-solid fa-eye" },
  ];

  const toolPrompts = [
    { text: "Skapa hashtags för 'Helldivers 2'", icon: "fa-solid fa-hashtag" },
    { text: "Skriv en beskrivning för en video om 'Generation Zero i Stockholm'", icon: "fa-solid fa-pencil" },
    { text: "Analysera min idé: 'En challenge i Deep Rock'", icon: "fa-solid fa-lightbulb" },
  ];
  
  const conversationStarters = [
    "Föreslå en titel för en ny Helldivers 2 co-op video.",
    "Brainstorma 3 video-idéer baserat på mitt mest framgångsrika innehåll.",
  ];

  return (
    <aside className="w-64 md:w-80 h-full bg-black/20 backdrop-blur-md border-r border-purple-500/20 p-4 flex-col hidden sm:flex overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-purple-400 text-glow">
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
        <h2 className="text-lg font-semibold mb-4 text-purple-400 text-glow">
          <i className="fa-solid fa-toolbox mr-2"></i>
          Verktygslåda
        </h2>
        <div className="space-y-3">
          {toolPrompts.map((prompt, index) => (
            <PromptButton key={index} text={prompt.text} icon={prompt.icon} onClick={() => onPromptClick(prompt.text)} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-purple-400 text-glow">
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