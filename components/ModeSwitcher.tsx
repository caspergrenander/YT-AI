import React from 'react';

interface ModeSwitcherProps {
  mode: 'gpt5' | 'pro';
  onModeChange: (mode: 'gpt5' | 'pro') => void;
}

const ModeButton: React.FC<{
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 border text-sm font-semibold ${
                isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                    : 'bg-white/5 border-purple-500/30 text-gray-300 hover:bg-white/10'
            }`}
        >
            <i className={`fa-solid ${icon}`}></i>
            <span>{label}</span>
        </button>
    );
};

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
    return (
        <div className="flex items-center gap-2 p-1 bg-gray-900/50 border border-white/10 rounded-xl">
            <ModeButton
                icon="fa-brain"
                label="GPT-5"
                isActive={mode === 'gpt5'}
                onClick={() => onModeChange('gpt5')}
            />
            <ModeButton
                icon="fa-bolt-lightning"
                label="PRO"
                isActive={mode === 'pro'}
                onClick={() => onModeChange('pro')}
            />
        </div>
    );
};

export default ModeSwitcher;
