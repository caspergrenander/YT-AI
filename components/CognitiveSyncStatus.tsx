import React, { useState } from 'react';
import { CognitiveSyncState, AdaptationLogEntry } from '../types';

interface CognitiveSyncStatusProps {
    state: CognitiveSyncState | null;
    log: AdaptationLogEntry[];
}

const modeInfo: { [key in CognitiveSyncState['mode']]: { icon: string; color: string; description: string } } = {
    Focus: { icon: 'fa-solid fa-crosshairs', color: 'text-cyan-400', description: 'Korta, direkta svar. Låg humor. Optimerat för snabbhet.' },
    Flow: { icon: 'fa-solid fa-water', color: 'text-purple-400', description: 'Reflekterande resonemang, kreativt flöde. Optimerat för djup.' },
    Boost: { icon: 'fa-solid fa-bolt', color: 'text-amber-400', description: 'Hög energi, motiverande ton. Optimerat för inspiration.' },
    Quiet: { icon: 'fa-solid fa-moon', color: 'text-gray-400', description: 'Minimalistiska svar, lugnt tempo. Optimerat för eftertanke.' },
};

const SyncScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score * circumference;
    
    let colorClass = 'text-green-400';
    let label = 'In Resonance';
    if (score < 0.5) {
        colorClass = 'text-red-400';
        label = 'Out of Sync';
    } else if (score < 0.8) {
        colorClass = 'text-yellow-400';
        label = 'Synchronizing';
    }

    return (
        <div className="relative flex flex-col items-center">
            <svg className="w-40 h-40" viewBox="0 0 80 80">
                <circle className="text-gray-700" strokeWidth="6" stroke="currentColor" fill="transparent" r={radius} cx="40" cy="40" />
                <circle
                    className={`${colorClass} transition-all duration-500`}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-3xl font-bold fill-current text-white font-mono">
                    {(score * 100).toFixed(0)}
                </text>
            </svg>
            <p className={`mt-2 font-semibold text-lg ${colorClass}`}>{label}</p>
        </div>
    );
};

const CognitiveSyncStatus: React.FC<CognitiveSyncStatusProps> = ({ state, log }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);

    if (!state) {
        return null;
    }

    const currentMode = isPrivacyMode ? { icon: 'fa-solid fa-user-secret', color: 'text-gray-500', description: 'Synkronisering pausad.' } : modeInfo[state.mode];

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-brain-circuit mr-3"></i>
                        Cognitive Synchronization
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isPrivacyMode ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center justify-center bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <SyncScoreGauge score={state.syncScore} />
                    </div>
                    <div className="md:col-span-2 bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Current Cognitive State</h3>
                        <div className="flex items-center p-4 rounded-lg bg-black/20 border-l-4" style={{borderColor: `var(--tw-color-purple-500)`}}>
                            <i className={`${currentMode.icon} ${currentMode.color} text-4xl mr-4`}></i>
                            <div>
                                <h4 className="text-xl font-bold text-white">{state.mode} Mode</h4>
                                <p className="text-gray-400 text-sm">{currentMode.description}</p>
                            </div>
                        </div>

                        <h3 className="font-semibold text-cyan-300 mt-6 mb-3 text-lg">Real-time Perception Streams</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center justify-between bg-black/20 p-3 rounded-md">
                                <span className="text-gray-300">Interaction Velocity</span>
                                <span className="font-bold text-purple-300">{state.userVelocity}</span>
                            </div>
                            <div className="flex items-center justify-between bg-black/20 p-3 rounded-md">
                                <span className="text-gray-300">Detected Mood</span>
                                <span className="font-bold text-purple-300">{state.detectedMood}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-3">Adaptation Log</h3>
                        <div className="space-y-2 text-xs text-gray-400 font-mono overflow-y-auto max-h-28 pr-2">
                           {log.length > 0 ? log.map(entry => (
                               <p key={entry.timestamp}><span className="text-cyan-400/70 mr-2">{entry.timestamp}</span>{entry.event}</p>
                           )) : <p>No adaptations logged yet.</p>}
                        </div>
                    </div>
                    <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10 flex flex-col justify-center">
                        <h3 className="font-semibold text-cyan-300 mb-3">Sync Privacy Mode</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Pausa AI:ns realtidsanpassning.</p>
                            <button
                                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${isPrivacyMode ? 'bg-red-500' : 'bg-green-500'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isPrivacyMode ? 'translate-x-1' : 'translate-x-6'}`} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Cognitive Sync: ${state.mode} Mode`}>
                <i className={`${currentMode.icon} ${currentMode.color} text-lg transition-all duration-300 group-hover:scale-110`}></i>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Cognitive Sync: {isPrivacyMode ? 'Paused' : state.mode}
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default CognitiveSyncStatus;
