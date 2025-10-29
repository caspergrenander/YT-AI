import React from 'react';

interface ThinkingIndicatorProps {
  mode: 'gpt5' | 'pro';
  message: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ mode, message }) => {
  const colors = {
    gpt5: { border: "border-blue-500/60", glow: "shadow-lg shadow-blue-400/30", text: "text-blue-300" },
    pro: { border: "border-cyan-400/60", glow: "shadow-lg shadow-cyan-400/30", text: "text-cyan-300" }
  };
  const c = colors[mode];

  // --glow-color-think is used by the animation in index.html. Set it dynamically.
  const style = {
      '--glow-color-think': mode === 'gpt5' ? '#60a5fa' : '#22d3ee'
  } as React.CSSProperties;

  return (
    <div
      style={style}
      className={`flex items-center gap-3 p-3 bg-gray-900/50 backdrop-blur-sm ${c.border} border rounded-xl ${c.glow} animate-thinking-pulse max-w-lg`}
    >
      <i className={`fa-solid fa-brain w-5 h-5 ${c.text}`}></i>
      <span className="text-sm text-gray-200 italic">{message}</span>
    </div>
  );
}

export default ThinkingIndicator;
