import React, { useState } from 'react';
import { TemporalConsciousnessState } from '../types';

interface TemporalConsciousnessStatusProps {
    state: TemporalConsciousnessState | null;
}

const timeFrameInfo: { [key in TemporalConsciousnessState['currentTimeFrame']]: { icon: string; color: string; } } = {
    'Microsecond': { icon: 'fa-solid fa-magnifying-glass', color: 'text-rose-400' },
    'Meso-Temporal': { icon: 'fa-solid fa-hourglass-half', color: 'text-cyan-400' },
    'Macro-Strategic': { icon: 'fa-solid fa-calendar-days', color: 'text-purple-400' },
};

const TemporalVisualizer: React.FC = () => (
    <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-temporal-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute inset-4 border-2 border-purple-500/30 rounded-full animate-temporal-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
        <svg viewBox="0 0 100 100" className="absolute inset-8 w-3/4 h-3/4">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="3" className="dashed-circle animate-temporal-spin" style={{ animationDuration: '30s' }}/>
        </svg>
        <div className="relative bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-900/50 animate-temporal-pulse">
            <span className="font-bold text-lg text-shimmer">NOW</span>
        </div>
    </div>
);


const TemporalConsciousnessStatus: React.FC<TemporalConsciousnessStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { continuumHealth, currentTimeFrame, systemRhythm, activeCausalChain, prediction, realityLoop } = state;
    const currentFrameInfo = timeFrameInfo[currentTimeFrame];

    const getStatusColor = () => {
        if (continuumHealth < 0.85) return 'bg-red-500';
        if (continuumHealth < 0.95) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-clock-rotate-left mr-3"></i>
                        Temporal Consciousness & Predictive Loop
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <h3 className="font-semibold text-cyan-300 text-lg">Memory Continuum</h3>
                        <TemporalVisualizer />
                        <div className="w-full space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-medium text-gray-300"><span>System Rhythm</span><span>{systemRhythm.toFixed(2)}</span></div>
                                <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${systemRhythm * 100}%` }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-medium text-gray-300"><span>Continuum Health</span><span>{(continuumHealth * 100).toFixed(0)}%</span></div>
                                <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${continuumHealth * 100}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">Predictive Field</h3>
                            <div className="bg-black/20 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-400">Next High-Probability Event:</p>
                                <p className="text-xl font-semibold text-purple-300 my-1">{prediction.event}</p>
                                <p className="text-5xl font-bold font-mono text-shimmer">{prediction.timeToEvent}</p>
                                <p className="text-xs text-gray-400 font-mono mt-1">Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">Active Causal Chain</h3>
                            <div className="flex items-center justify-center space-x-2">
                                {activeCausalChain.map((step, index) => (
                                    <React.Fragment key={step}>
                                        <div className="text-sm font-semibold bg-gray-800 px-3 py-1 rounded-full text-white">{step}</div>
                                        {index < activeCausalChain.length - 1 && <i className="fa-solid fa-arrow-right text-purple-400"></i>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">Predictive Reality Loop</h3>
                             <div className="bg-black/20 p-3 rounded-lg">
                                <div className="flex justify-between text-xs font-medium text-gray-300"><span>Loop Accuracy</span><span>{(realityLoop.accuracy * 100).toFixed(1)}%</span></div>
                                <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${realityLoop.accuracy * 100}%` }}></div></div>
                                <p className="text-xs text-gray-400 mt-2">Last Correction: <span className="font-mono text-yellow-300">{realityLoop.lastCorrection}</span></p>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-950/50 p-3 rounded-lg border border-white/10 text-center">
                                <h4 className="font-semibold text-cyan-300 text-sm">Time Perception</h4>
                                <i className={`${currentFrameInfo.icon} ${currentFrameInfo.color} text-2xl my-1`}></i>
                                <p className="font-bold text-white text-xs">{currentTimeFrame}</p>
                            </div>
                            <div className="bg-gray-950/50 p-3 rounded-lg border border-white/10 text-center">
                                <h4 className="font-semibold text-cyan-300 text-sm">Chrono-Ethics</h4>
                                <i className="fa-solid fa-shield-halved text-green-400 text-2xl my-1"></i>
                                <p className="font-bold text-white text-xs">{state.ethicalStatus}</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Temporal Consciousness">
                <i className="fa-solid fa-clock-rotate-left text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                 <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Temporal Consciousness
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default TemporalConsciousnessStatus;