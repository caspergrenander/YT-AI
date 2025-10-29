
import React from 'react';
// Fix: Import `AITool` from the centralized types module instead of the service.
import { AITool } from '../types';

interface SidebarProps {
  onSendMessage: (prompt: string) => void;
  onToolClick: (tool: AITool, promptText: string) => void;
}

const ExpertButton: React.FC<{ text: string; icon: string; onClick: () => void; accentColor: 'purple' | 'cyan' | 'amber' | 'rose' }> = ({ text, icon, onClick, accentColor }) => {
    const colors = {
        purple: { text: 'text-purple-400', border: 'hover:border-purple-400/80', shadow: 'hover:shadow-purple-500/40', bg: 'hover:bg-purple-500/10' },
        cyan: { text: 'text-cyan-400', border: 'hover:border-cyan-400/80', shadow: 'hover:shadow-cyan-500/40', bg: 'hover:bg-cyan-500/10' },
        amber: { text: 'text-amber-400', border: 'hover:border-amber-400/80', shadow: 'hover:shadow-amber-500/40', bg: 'hover:bg-amber-500/10' },
        rose: { text: 'text-rose-400', border: 'hover:border-rose-400/80', shadow: 'hover:shadow-rose-500/40', bg: 'hover:bg-rose-500/10' },
    };
    const c = colors[accentColor];

    return (
    <button
      onClick={onClick}
      className={`group w-full text-left text-sm p-3 bg-white/5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center border border-white/10 ${c.border} ${c.shadow} ${c.bg}`}
    >
      <i className={`${icon} w-6 text-center mr-2 ${c.text} transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6`}></i>
      <span className="z-10">{text}</span>
    </button>
  );
}


const Sidebar: React.FC<SidebarProps> = ({ onSendMessage, onToolClick }) => {

  const expertSections = [
      {
          title: "Strategic Planner",
          icon: "fa-solid fa-compass",
          accent: "purple" as const,
          prompts: [
              { text: "Formulera en 3-månaders tillväxtstrategi", icon: "fa-solid fa-calendar-days" },
              { text: "Identifiera 'content gaps' i min nisch", icon: "fa-solid fa-magnifying-glass-chart" },
              { text: "Sätt upp mätbara KPI:er för nästa kvartal", icon: "fa-solid fa-flag-checkered" },
          ]
      },
      {
          title: "Algorithmic Intelligence",
          icon: "fa-solid fa-robot",
          accent: "rose" as const,
          prompts: [
              { text: "Analysera varför min senaste video underpresterade", icon: "fa-solid fa-chart-line" },
              { text: "Förutsäg CTR för en ny titel/miniatyr-idé", icon: "fa-solid fa-percentage" },
              { text: "Vilka algoritmiska signaler bör jag fokusera på nu?", icon: "fa-solid fa-broadcast-tower" },
          ]
      },
      {
          title: "Multimodal Analyst",
          icon: "fa-solid fa-film",
          accent: "amber" as const,
          prompts: [
              { text: "Ge visuell feedback på den här miniatyren", icon: "fa-solid fa-eye" },
              { text: "Analysera den emotionella tonen i mitt manus", icon: "fa-solid fa-comment-dots" },
              { text: "Jämför två miniatyrer och förklara skillnaden", icon: "fa-solid fa-images" },
          ]
      },
      {
          title: "Performance Auditor",
          icon: "fa-solid fa-crystal-ball",
          accent: "cyan" as const,
          prompts: [
              { text: "Simulera visningar för en video om [ämne]", icon: "fa-solid fa-chart-bar" },
              { text: "Prediktera engagemang för nästa veckas video", icon: "fa-solid fa-users" },
              { text: "Skapa en 'bästa/värsta fall'-prognos", icon: "fa-solid fa-wand-magic-sparkles" },
          ]
      }
  ];

  return (
    <aside className="w-64 md:w-80 h-full bg-gray-950/50 backdrop-blur-md border-r border-cyan-500/20 p-4 flex-col hidden sm:flex overflow-y-auto">
      {expertSections.map(section => (
        <div className="mb-8" key={section.title}>
            <h2 className={`text-lg font-semibold mb-4 text-${section.accent}-400 text-glow`} style={{ fontFamily: 'var(--font-heading)', '--glow-color': `var(--tw-color-${section.accent}-400)` } as React.CSSProperties}>
                <i className={`${section.icon} mr-2`}></i>
                {section.title}
            </h2>
            <div className="space-y-3">
                {section.prompts.map((prompt) => (
                    <ExpertButton 
                        key={prompt.text} 
                        text={prompt.text} 
                        icon={prompt.icon} 
                        onClick={() => onSendMessage(prompt.text)}
                        accentColor={section.accent}
                    />
                ))}
            </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;