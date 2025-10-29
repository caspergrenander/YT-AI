import React from 'react';

interface ThinkingControlProps {
  value: 'fast' | 'balanced' | 'deep';
  onChange: (value: 'fast' | 'balanced' | 'deep') => void;
}

const ThinkingControl: React.FC<ThinkingControlProps> = ({ value, onChange }) => {
  const depthMap = { fast: 0, balanced: 1, deep: 2 };
  const valueMap = ['fast', 'balanced', 'deep'] as const;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(valueMap[parseInt(e.target.value, 10)]);
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-900/50 border border-white/10 rounded-xl w-48">
      <i className="fa-solid fa-brain text-cyan-400"></i>
      <div className="flex-grow">
        <label htmlFor="thinking-depth" className="text-xs text-gray-300 capitalize">
          Depth: {value}
        </label>
        <input
          id="thinking-depth"
          type="range"
          min="0"
          max="2"
          step="1"
          value={depthMap[value]}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #22d3ee ${((depthMap[value] / 2) * 100)}%, #4b5563 ${((depthMap[value] / 2) * 100)}%, #4b5563 100%)`
          }}
        />
      </div>
    </div>
  );
};

export default ThinkingControl;
