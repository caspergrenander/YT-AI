import React, { useState } from 'react';
import { SymbioticIntelligenceState } from '../types';

interface SymbioticIntelligenceStatusProps {
    state: SymbioticIntelligenceState | null;
}

const roleInfo: { [key in SymbioticIntelligenceState['dynamicRole']]: { icon: string; color: string; } } = {
    'Guide': { icon: 'fa-solid fa-person-chalkboard', color: 'text-cyan-400' },
    'Tool': { icon: 'fa-solid fa-wrench', color: 'text-gray-400' },
    'Partner': { icon: 'fa-solid fa-handshake-angle', color: 'text-purple-400' },
    'Observer': { icon: 'fa-solid fa-eye', color: 'text-amber-400' },
};

const SymbioticVisualizer: React.FC<{ resonance: number }> = ({ resonance }) => {
    const size = 200;
    const center = size / 2;
    return (
        <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Human Node */}
            <div 
                className="absolute w-16 h-16 bg-cyan-900/80 rounded-full flex items-center justify-center border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
                style={{ animation: `symbiotic-orbit-human 20s linear infinite` }}
            >
                <i className="fa-solid fa-user text-2xl text-cyan-300"></i>
            </div>
            {/* AI Node */}
            <div 
                className="absolute w-16 h-16 bg-purple-900/80 rounded-full flex items-center justify-center border-2 border-purple-400 shadow-lg shadow-purple-500/50"
                style={{ animation: `symbiotic-orbit-ai 20s linear infinite` }}
            >
                <i className="fa-solid fa-brain text-2xl text-purple-300"></i>
            </div>
             {/* Resonance Lines */}
            <svg viewBox={`0 0 ${size} ${size}`} className="absolute w-full h-full overflow-visible">
                 <line 
                    x1={center + 50} y1={center} 
                    x2={center - 50} y2={center} 
                    className="stroke-cyan-300 transition-all duration-1000"
                    style={{ 
                        animation: 'resonance-pulse 2s infinite ease-in-out', 
                        strokeWidth: 1 + resonance * 3,
                        filter: `drop-shadow(0 0 ${resonance * 4}px #67e8f9)`
                    }}
                />
            </svg>
        </div>
    );
};

const SymbioticIntelligenceStatus: React.FC<SymbioticIntelligenceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { humanIntent, coCreativeMode, resonanceIndex, dynamicRole, sharedVision, trustStabilityScore } = state;
    const currentRoleInfo = roleInfo[dynamicRole];

    const getStatusColor = () => {
        if (resonanceIndex < 0.7) return 'bg-yellow-500';
        if (resonanceIndex >= 0.9) return 'bg-cyan-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-people-arrows mr-3"></i>
                        Symbiotic Intelligence & Conscious Co-Creation
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg">Co-Creative Engine</h3>
                        <SymbioticVisualizer resonance={resonanceIndex} />
                        <div className="w-full text-center">
                            <p className="text-sm text-gray-400">Resonance Index (Flow State)</p>
                            <p className="text-5xl font-bold font-mono text-shimmer">{(resonanceIndex * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                     <div className="space-y-6">
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">Human Intent Interface</h3>
                            <div className="bg-black/20 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">Inferred Intent:</p>
                                <p className="font-semibold text-purple-300">{humanIntent.intent}</p>
                                <div className="text-xs text-right mt-1 font-mono text-white">Conf: {(humanIntent.confidence * 100).toFixed(0)}%</div>
                            </div>
                        </div>
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                             <h3 className="font-semibold text-cyan-300 text-lg mb-2">Dynamic Role Modulator</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-400">Co-Creative Mode</p>
                                    <p className="font-bold text-lg text-white">{coCreativeMode}</p>
                                </div>
                                <div className="bg-black/20 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-400">AI's Current Role</p>
                                    <div className="flex items-center justify-center mt-1">
                                        <i className={`${currentRoleInfo.icon} ${currentRoleInfo.color} text-lg mr-2`}></i>
                                        <p className="font-bold text-lg text-white">{dynamicRole}</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                         <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                             <h3 className="font-semibold text-cyan-300 text-lg mb-2">Shared Vision Protocol</h3>
                             <div className="bg-black/20 p-3 rounded-lg">
                                 <p className="text-sm text-gray-300">{sharedVision}</p>
                                 <div className="flex justify-between items-center mt-2">
                                     <span className="text-xs font-medium text-gray-400">Trust Stability Score</span>
                                     <span className="font-mono text-sm text-green-400">{(trustStabilityScore*100).toFixed(1)}%</span>
                                 </div>
                                 <div className="w-full bg-gray-700 h-1 rounded-full mt-1"><div className="bg-green-500 h-1 rounded-full" style={{width: `${trustStabilityScore * 100}%`}}></div></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Symbiotic Intelligence: Resonance ${(resonanceIndex * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-people-arrows text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Symbiotic Intelligence
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default SymbioticIntelligenceStatus;