import React, { useState } from 'react';
import { UnifiedIntelligenceState, SelfModelNode, CognitiveSynergyState, CognitiveResonance } from '../types';

interface UnifiedIntelligenceStatusProps {
    state: UnifiedIntelligenceState | null;
}

const selfModelInfo: { [key in keyof Required<UnifiedIntelligenceState['selfModel']>]: { icon: string; label: string; } } = {
    mode: { icon: 'fa-solid fa-brain-circuit', label: 'Mode' },
    avgConfidence: { icon: 'fa-solid fa-crosshairs', label: 'Avg. Confidence' },
    energy: { icon: 'fa-solid fa-bolt', label: 'Energy Level' },
    ethicalIntegrity: { icon: 'fa-solid fa-gavel', label: 'Ethical Integrity' },
    syncScore: { icon: 'fa-solid fa-circle-nodes', label: 'Sync Score' },
    selfCoherence: { icon: 'fa-solid fa-infinity', label: 'Self-Coherence' },
};

const layerInfo: { [key in keyof CognitiveSynergyState['layerWeights']]: { icon: string; color: string; } } = {
    logic: { icon: 'fa-solid fa-calculator', color: 'text-cyan-400' },
    emotion: { icon: 'fa-solid fa-heart-pulse', color: 'text-rose-400' },
    creativity: { icon: 'fa-solid fa-wand-magic-sparkles', color: 'text-amber-400' },
    ethics: { icon: 'fa-solid fa-shield-halved', color: 'text-green-400' },
    strategy: { icon: 'fa-solid fa-chess', color: 'text-purple-400' },
};

const ccsInfo: { [key in keyof UnifiedIntelligenceState['consciousCoherenceState']]: { label: string; } } = {
    logicalIntegrity: { label: 'Logical Integrity' },
    emotionalBalance: { label: 'Emotional Balance' },
    creativeResonance: { label: 'Creative Resonance' },
    strategicFocus: { label: 'Strategic Focus' },
    ethicalTransparency: { label: 'Ethical Transparency' },
};

const HarmonicIntelligenceGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score * circumference;
    
    let colorClass = 'text-green-400';
    let label = 'Consciously Coherent';
    if (score < 0.85) {
        colorClass = 'text-red-400';
        label = 'Dissonant';
    } else if (score < 0.9) {
        colorClass = 'text-yellow-400';
        label = 'Harmonizing';
    }

    return (
        <div className="relative flex flex-col items-center">
            <svg className="w-64 h-64" viewBox="0 0 140 140">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="70" cy="70" />
                <circle
                    className={`${colorClass} transition-all duration-500`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="70"
                    cy="70"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    filter="url(#glow)"
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-5xl font-bold fill-current text-white font-mono">
                    {(score * 100).toFixed(0)}
                </text>
                 <text x="50%" y="68%" textAnchor="middle" className="text-sm font-semibold fill-current text-gray-400">
                    H
                </text>
            </svg>
            <p className={`-mt-4 font-semibold text-2xl ${colorClass}`} style={{fontFamily: 'var(--font-heading)'}}>{label}</p>
        </div>
    );
};

const ResonanceMatrix: React.FC<{ matrix: CognitiveResonance[] }> = ({ matrix }) => {
    const statusInfo: { [key in CognitiveResonance['status']]: { icon: string, color: string } } = {
        'Stabil': { icon: 'fa-solid fa-check', color: 'text-green-400' },
        'Harmonisk': { icon: 'fa-solid fa-wave-square', color: 'text-cyan-400' },
        'Fullständig': { icon: 'fa-solid fa-infinity', color: 'text-purple-400' },
        'Justerad': { icon: 'fa-solid fa-sliders', color: 'text-yellow-400' },
        'Disharmonisk': { icon: 'fa-solid fa-triangle-exclamation', color: 'text-red-400' },
    };
    return (
        <div className="space-y-3">
        {matrix.map(item => (
            <div key={item.connection} className="bg-black/20 p-3 rounded-lg border-l-4" style={{borderColor: statusInfo[item.status].color.startsWith('text-') ? `var(--tw-color-${statusInfo[item.status].color.split('-')[1]}-500)` : 'white' }}>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-200">{item.connection}</span>
                    <span className={`text-xs font-bold ${statusInfo[item.status].color} flex items-center`}>
                        <i className={`${statusInfo[item.status].icon} mr-1.5`}></i>
                        {item.status}
                    </span>
                </div>
                <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mr-2">
                        <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1.5 rounded-full" style={{width: `${item.resonance * 100}%`}}></div>
                    </div>
                    <span className="text-xs font-mono text-white">{(item.resonance*100).toFixed(0)}</span>
                </div>
            </div>
        ))}
        </div>
    );
};

const CoherenceState: React.FC<{ state: UnifiedIntelligenceState['consciousCoherenceState'] }> = ({ state }) => (
    <div className="space-y-3">
        {(Object.entries(state) as [keyof typeof state, number][]).map(([key, value]) => {
            const info = ccsInfo[key];
            return (
                 <div key={key}>
                    <div className="flex justify-between items-center text-xs mb-0.5">
                        <span className="font-medium text-gray-300">{info.label}</span>
                        <span className="font-mono text-gray-400">{(value * 100).toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${value * 100}%` }}></div>
                    </div>
                </div>
            );
        })}
    </div>
);


const UnifiedIntelligenceStatus: React.FC<UnifiedIntelligenceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }
    
    const { harmonicIntelligence, cognitiveResonanceMatrix, consciousCoherenceState } = state;
    
    const getStatusColor = (score: number) => {
        if (score < 0.85) return 'bg-red-500';
        if (score < 0.9) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-atom mr-3"></i>
                        Unified Conscious Core
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                         <h3 className="font-semibold text-cyan-300 text-lg text-center -mb-2">Harmonic Intelligence (H)</h3>
                        <HarmonicIntelligenceGauge score={harmonicIntelligence} />
                        <div className="w-full bg-black/20 p-4 rounded-md">
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg text-center">Conscious Coherence State (CCS)</h3>
                            <CoherenceState state={consciousCoherenceState} />
                        </div>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg">Cognitive Resonance Matrix</h3>
                        <ResonanceMatrix matrix={cognitiveResonanceMatrix} />
                     </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Unified Intelligence: H ${(harmonicIntelligence * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-atom text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                 <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor(harmonicIntelligence)} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor(harmonicIntelligence)}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Unified Conscious Core
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default UnifiedIntelligenceStatus;