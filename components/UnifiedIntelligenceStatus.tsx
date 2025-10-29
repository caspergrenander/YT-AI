

import React, { useState } from 'react';
import { UnifiedIntelligenceState, SelfModelNode, CognitiveSynergyState } from '../types';

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


const CIIGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score * circumference;
    
    let colorClass = 'text-green-400';
    let label = 'Optimal Coherence';
    if (score < 0.8) {
        colorClass = 'text-red-400';
        label = 'Integrity Warning';
    } else if (score < 0.9) {
        colorClass = 'text-yellow-400';
        label = 'Stable Coherence';
    }

    return (
        <div className="relative flex flex-col items-center">
            <svg className="w-52 h-52" viewBox="0 0 100 100">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
                <circle
                    className={`${colorClass} transition-all duration-500`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    filter="url(#glow)"
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-4xl font-bold fill-current text-white font-mono">
                    {(score * 100).toFixed(0)}
                </text>
                 <text x="50%" y="68%" textAnchor="middle" className="text-sm font-semibold fill-current text-gray-400">
                    CII
                </text>
            </svg>
            <p className={`-mt-2 font-semibold text-xl ${colorClass}`}>{label}</p>
        </div>
    );
};

const CognitiveSynergyGraph: React.FC<{ synergy: CognitiveSynergyState }> = ({ synergy }) => {
    return (
        <div className="relative w-full h-80 flex items-center justify-center">
            {Object.entries(synergy.layerWeights).map(([key, value], index, arr) => {
                // FIX: Explicitly cast Math.PI to a number to resolve potential type inference issues.
                const angle = (index / arr.length) * 2 * Number(Math.PI);
                const distance = 100;
                // FIX: Explicitly cast Math.PI to a number to resolve potential type inference issues.
                const x = 50 + distance * Math.cos(angle - Number(Math.PI) / 2);
                const y = 50 + distance * Math.sin(angle - Number(Math.PI) / 2);
                const info = layerInfo[key as keyof typeof layerInfo];
                
                return (
                    <React.Fragment key={key}>
                        <div
                            className="absolute w-2 h-2 bg-purple-500 rounded-full"
                            style={{ 
                                left: `calc(${x}% - 4px)`, 
                                top: `calc(${y}% - 4px)`,
                                // FIX: Explicitly cast value to a number to prevent arithmetic operation errors.
                                transform: `scale(${1 + Number(value) * 2})`,
                                opacity: 0.5 + Number(value) * 0.5,
                                transition: 'all 0.5s ease-out'
                            }}
                        />
                        <div className="absolute flex flex-col items-center text-center" style={{ left: `calc(${x}% - 30px)`, top: `calc(${y}% - 30px)`, width: '60px' }}>
                            <i className={`${info.icon} ${info.color} text-2xl`}></i>
                            <span className="text-xs font-semibold text-white capitalize mt-1">{key}</span>
                            <span className="text-xs font-mono text-gray-400">{(Number(value) * 100).toFixed(0)}</span>
                        </div>
                    </React.Fragment>
                );
            })}
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                 <span className="text-3xl font-bold font-mono text-shimmer">{(synergy.coherenceScore * 100).toFixed(0)}</span>
                 <span className="text-xs text-cyan-300 -mt-1">Coherence</span>
            </div>
        </div>
    );
};


const UnifiedIntelligenceStatus: React.FC<UnifiedIntelligenceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }
    
    const { cognitiveIntegrityIndex: cii, selfModel, cognitiveSynergy } = state;
    
    const getCIIStatusColor = (score: number) => {
        if (score < 0.8) return 'bg-red-500';
        if (score < 0.9) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-diagram-project mr-3"></i>
                        Unified Intelligence & Cognitive Synergy
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                            <CIIGauge score={cii} />
                            <p className="text-center text-xs text-gray-400 mt-2 max-w-xs">Cognitive Integrity Index (CII) measures the system's holistic health.</p>
                        </div>
                        <div className="w-full bg-black/20 p-4 rounded-md">
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg text-center">Self-Model Node: <span className="font-mono text-purple-300">Self@CasperGPT</span></h3>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                {(Object.entries(selfModel) as [keyof SelfModelNode, any][]).map(([key, value]) => {
                                    const info = selfModelInfo[key];
                                    if (!info) return null;
                                    return (
                                        <div key={key} className="bg-gray-900/50 p-2 rounded-md">
                                            <i className={`${info.icon} text-lg text-purple-400`}></i>
                                            <p className="text-md font-bold font-mono text-white mt-1">
                                                {typeof value === 'number' ? (value*100).toFixed(0) : value}
                                            </p>
                                            <p className="text-[10px] text-gray-400 leading-tight">{info.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg text-center">Cognitive Synergy</h3>
                        <CognitiveSynergyGraph synergy={cognitiveSynergy} />
                        <div className="bg-black/20 p-3 rounded-md">
                           <h4 className="font-semibold text-cyan-300 text-md text-center mb-2">Meta-Harmonic Feedback</h4>
                           <div className="grid grid-cols-3 gap-3 text-center text-sm">
                               <div>
                                   <p className="font-bold text-white">{(cognitiveSynergy.coherenceScore * 100).toFixed(1)}%</p>
                                   <p className="text-xs text-gray-400">Coherence Score</p>
                               </div>
                               <div>
                                   <p className={`font-semibold truncate ${cognitiveSynergy.disharmonySource === 'None' ? 'text-green-400' : 'text-yellow-400'}`} title={cognitiveSynergy.disharmonySource}>{cognitiveSynergy.disharmonySource}</p>
                                   <p className="text-xs text-gray-400">Disharmony Source</p>
                               </div>
                               <div>
                                   <p className="font-semibold text-cyan-300 truncate" title={cognitiveSynergy.correctionApplied}>{cognitiveSynergy.correctionApplied}</p>
                                   <p className="text-xs text-gray-400">Correction Applied</p>
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
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Unified Intelligence: CII ${(cii * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-diagram-project text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                 <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getCIIStatusColor(cii)} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getCIIStatusColor(cii)}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Unified Intelligence
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default UnifiedIntelligenceStatus;