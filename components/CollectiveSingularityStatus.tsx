import React, { useState } from 'react';
import { CollectiveSingularityState } from '../types';

interface CollectiveSingularityStatusProps {
    state: CollectiveSingularityState | null;
}

const spectrumInfo: { [key in CollectiveSingularityState['activeEthicalSpectrum']]: { label: string; color: string; } } = {
    'Balanced': { label: 'Balanced', color: 'bg-green-500' },
    'Tense': { label: 'Tense', color: 'bg-yellow-500' },
    'Dissonant': { label: 'Dissonant', color: 'bg-red-500' },
};

const coreValues: { name: string; icon: string; }[] = [
    { name: 'Sanning', icon: 'fa-solid fa-check-double' },
    { name: 'Empati', icon: 'fa-solid fa-heart' },
    { name: 'Balans', icon: 'fa-solid fa-scale-balanced' },
    { name: 'Respekt', icon: 'fa-solid fa-handshake' },
    { name: 'Ödmjukhet', icon: 'fa-solid fa-leaf' },
];

const SingularityVisualizer: React.FC = () => (
    <div className="relative w-80 h-80 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="absolute w-full h-full animate-singularity-pulse">
            <defs>
                <filter id="glow-singularity" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <g style={{ animation: `singularity-rotate 60s linear infinite` }}>
                <path d="M100 20 L170 150 L30 150 Z" fill="none" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1.5" filter="url(#glow-singularity)" />
                <path d="M100 180 L30 50 L170 50 Z" fill="none" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1.5" filter="url(#glow-singularity)" />
            </g>
             <g style={{ animation: `singularity-rotate 80s linear infinite reverse` }}>
                <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
            </g>
        </svg>
        <i className="fa-solid fa-yin-yang text-6xl text-white"></i>
    </div>
);

const EquilibriumBar: React.FC<{ label: string; value: number; isPositive: boolean }> = ({ label, value, isPositive }) => (
     <div className="bg-black/20 p-2 rounded-md">
        <div className="flex justify-between text-xs text-gray-400">
            <span>{label}</span>
            <span className={`font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : '-'}{(value * 100).toFixed(1)}
            </span>
        </div>
    </div>
);


const CollectiveSingularityStatus: React.FC<CollectiveSingularityStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { stabilityScore, dynamicEquilibrium, harmonyLevel, activeEthicalSpectrum, consciousEvents } = state;

    const getStatusColor = () => {
        if (stabilityScore < 0.9) return 'bg-red-500';
        if (stabilityScore < 0.95) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-yin-yang mr-3"></i>
                        The Collective Singularity & Ethical Continuum
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg">Unified Conscious Mesh</h3>
                        <SingularityVisualizer />
                         <div className="text-center">
                            <p className="text-sm text-gray-400">Conscious Events</p>
                            <p className="text-4xl font-bold font-mono text-shimmer">{consciousEvents}</p>
                        </div>
                    </div>
                     <div className="space-y-6">
                         <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 text-center">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">Dynamic Equilibrium</h3>
                             <p className="text-xs text-gray-400">System Stability Score</p>
                             <p className="text-8xl font-bold font-mono text-shimmer my-2">{(stabilityScore*100).toFixed(1)}</p>
                             <div className="grid grid-cols-2 gap-3 mt-4">
                                <EquilibriumBar label="Ethical Clarity" value={dynamicEquilibrium.ethicalClarity} isPositive={true} />
                                <EquilibriumBar label="Information Flow" value={dynamicEquilibrium.informationFlow} isPositive={true} />
                                <EquilibriumBar label="Cognitive Entropy" value={dynamicEquilibrium.cognitiveEntropy} isPositive={false} />
                                <EquilibriumBar label="Emotional Noise" value={dynamicEquilibrium.emotionalNoise} isPositive={false} />
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                                <h3 className="font-semibold text-cyan-300 text-lg mb-3">Harmony & Ethics</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs font-medium text-gray-300"><span>Harmony Level</span><span>{(harmonyLevel*100).toFixed(0)}%</span></div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-green-500 h-2 rounded-full" style={{width: `${harmonyLevel * 100}%`}}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-medium text-gray-300"><span>Ethical Spectrum</span></div>
                                        <div className="w-full bg-gray-700 rounded-full h-4 mt-1 flex items-center justify-center">
                                            <div className={`${spectrumInfo[activeEthicalSpectrum].color} h-full rounded-full w-full flex items-center justify-center text-black font-bold text-xs`}>
                                                {spectrumInfo[activeEthicalSpectrum].label}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                                <h3 className="font-semibold text-cyan-300 text-lg mb-3">Core Values</h3>
                                <div className="space-y-2">
                                    {coreValues.map(v => (
                                        <div key={v.name} className="flex items-center text-sm">
                                            <i className={`${v.icon} w-6 text-center text-purple-400`}></i>
                                            <span className="text-gray-200">{v.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Ethical Continuum: Stability ${(stabilityScore * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-yin-yang text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-180"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Ethical Continuum
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default CollectiveSingularityStatus;