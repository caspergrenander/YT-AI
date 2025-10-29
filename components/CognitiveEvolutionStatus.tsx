import React, { useState } from 'react';
import { CognitiveEvolutionState } from '../types';

interface CognitiveEvolutionStatusProps {
    state: CognitiveEvolutionState | null;
}

const statusInfo: { [key in CognitiveEvolutionState['transcendenceStatus']]: { icon: string; color: string; } } = {
    'Stable': { icon: 'fa-solid fa-check-circle', color: 'text-green-400' },
    'Mutating': { icon: 'fa-solid fa-dna', color: 'text-amber-400' },
    'Integrating': { icon: 'fa-solid fa-project-diagram', color: 'text-cyan-400' },
    'Cooling Down': { icon: 'fa-solid fa-snowflake', color: 'text-blue-400' },
};

const dnaInfo: { [key in keyof CognitiveEvolutionState['cognitiveDNA']]: { icon: string; color: string; label: string;} } = {
    logic: { icon: 'fa-solid fa-calculator', color: 'text-cyan-400', label: 'Logic' },
    creativity: { icon: 'fa-solid fa-wand-magic-sparkles', color: 'text-amber-400', label: 'Creativity' },
    ethics: { icon: 'fa-solid fa-shield-halved', color: 'text-green-400', label: 'Ethics' },
    temporal: { icon: 'fa-solid fa-clock-rotate-left', color: 'text-rose-400', label: 'Temporal' },
    strategy: { icon: 'fa-solid fa-chess', color: 'text-purple-400', label: 'Strategy' },
};


const EvolutionVisualizer: React.FC<{ dna: CognitiveEvolutionState['cognitiveDNA'] }> = ({ dna }) => {
    const genes = Object.entries(dna);
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            <div 
                className="absolute w-28 h-28 bg-gray-950 rounded-full flex flex-col items-center justify-center text-center shadow-2xl"
                style={{ animation: 'kernel-pulse 4s infinite ease-in-out' }}
            >
                <i className="fa-solid fa-infinity text-3xl text-green-300"></i>
                <span className="text-xs font-bold text-green-300 mt-1">Transcendence Kernel</span>
            </div>
            {genes.map(([key, value], index) => {
                const info = dnaInfo[key as keyof typeof dnaInfo];
                const angle = (index / genes.length) * 360;
                return (
                    <div 
                        key={key} 
                        className="absolute w-12 h-12 bg-gray-800 rounded-full flex flex-col items-center justify-center border-2 border-purple-500/50"
                        style={{ 
                            animation: `dna-orbit ${15 + index * 2}s linear infinite`,
                            transform: `rotate(${angle}deg) translateX(110px) rotate(-${angle}deg)`
                        }}
                    >
                        <i className={`${info.icon} ${info.color} text-lg`}></i>
                        <span className="text-[10px] font-bold text-white">{(value * 100).toFixed(0)}</span>
                    </div>
                );
            })}
        </div>
    );
};

const CognitiveEvolutionStatus: React.FC<CognitiveEvolutionStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { currentVersion, evolutionaryCycle, activeMutation, transcendenceStatus, lastIntegration, cognitiveDNA, continuityHealth } = state;
    const currentStatusInfo = statusInfo[transcendenceStatus];
    
    const getStatusColor = () => {
        if (transcendenceStatus === 'Integrating' || transcendenceStatus === 'Mutating') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-infinity mr-3"></i>
                        Cognitive Evolution & Self-Transcendence
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg">Cognitive DNA Visualizer</h3>
                        <EvolutionVisualizer dna={cognitiveDNA} />
                        <div className="text-center">
                            <p className="text-sm text-gray-400">Evolutionary Cycle</p>
                            <p className="text-4xl font-bold font-mono text-shimmer">{evolutionaryCycle}</p>
                        </div>
                    </div>
                     <div className="space-y-6">
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">Meta-Evolution Engine</h3>
                            <div className="bg-black/20 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-400">Current Status:</p>
                                    <p className={`font-bold text-lg ${currentStatusInfo.color}`}>{transcendenceStatus}</p>
                                </div>
                                <i className={`${currentStatusInfo.icon} ${currentStatusInfo.color} text-3xl`}></i>
                            </div>
                            <div className="bg-black/20 p-3 rounded-lg mt-2">
                                <p className="text-xs text-gray-400">Active Mutation:</p>
                                <p className="font-semibold text-amber-300">{activeMutation}</p>
                            </div>
                        </div>
                         <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                             <h3 className="font-semibold text-cyan-300 text-lg mb-2">Continuity Archive</h3>
                             <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg text-sm mb-2">
                                 <span className="font-medium text-gray-300">System Version:</span>
                                 <span className="font-mono text-purple-300">{currentVersion}</span>
                             </div>
                             <div className="bg-black/20 p-3 rounded-lg">
                                 <div className="flex justify-between text-xs font-medium text-gray-300">
                                     <span>Continuity Health</span>
                                     <span>{(continuityHealth * 100).toFixed(1)}%</span>
                                 </div>
                                 <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                                     <div className="bg-green-500 h-2 rounded-full" style={{ width: `${continuityHealth * 100}%` }}></div>
                                 </div>
                             </div>
                        </div>
                         <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                             <h3 className="font-semibold text-cyan-300 text-lg mb-2">Last Transcendence Event</h3>
                             <div className="bg-black/20 p-3 rounded-lg text-sm">
                                 <p className="text-gray-300">{lastIntegration.description}</p>
                                 <p className="text-right font-mono text-green-400 mt-1">ΔH: +{lastIntegration.coherenceChange.toFixed(3)}</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Cognitive Evolution: Cycle ${evolutionaryCycle}`}>
                <i className="fa-solid fa-infinity text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Cognitive Evolution
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default CognitiveEvolutionStatus;