import React, { useState } from 'react';
import { CollectiveIntelligenceState } from '../types';

interface CollectiveIntelligenceStatusProps {
    state: CollectiveIntelligenceState | null;
}

const SRSGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 40;
    // FIX: Explicitly cast Math.PI and score to numbers to prevent arithmetic operation errors.
    const circumference = 2 * Number(Math.PI) * radius;
    const offset = circumference - Number(score) * circumference;
    
    let colorClass = 'text-purple-400';
    let label = 'Splittrad Publik';
    if (score > 0.6) {
        colorClass = 'text-cyan-400';
        label = 'Kollektiv Rörelse';
    } else if (score > 0.3) {
        colorClass = 'text-green-400';
        label = 'Aktiv Kärna';
    }

    return (
        <div className="relative flex flex-col items-center">
            <svg className="w-52 h-52" viewBox="0 0 100 100">
                 <defs>
                    <filter id="glow-srs">
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
                    filter="url(#glow-srs)"
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-4xl font-bold fill-current text-white font-mono">
                    {(score * 100).toFixed(0)}
                </text>
                 <text x="50%" y="68%" textAnchor="middle" className="text-sm font-semibold fill-current text-gray-400">
                    SRS
                </text>
            </svg>
            <p className={`-mt-2 font-semibold text-xl ${colorClass}`}>{label}</p>
        </div>
    );
};

const ClusterChart: React.FC<{ data: CollectiveIntelligenceState['activeClusters'] }> = ({ data }) => {
    const clusterInfo: { [key: string]: { icon: string, color: string } } = {
        'Adrenaline-seekers': { icon: 'fa-solid fa-bolt', color: 'bg-rose-500' },
        'Strategy-watchers': { icon: 'fa-solid fa-chess-knight', color: 'bg-blue-500' },
        'Community-veterans': { icon: 'fa-solid fa-user-group', color: 'bg-green-500' },
        'Casual passers': { icon: 'fa-solid fa-street-view', color: 'bg-gray-500' },
    };
    // FIX: Explicitly cast sort values to numbers.
    const sortedData = Object.entries(data).sort((a, b) => Number(b[1]) - Number(a[1]));

    return (
        <div className="space-y-3">
            {sortedData.map(([name, value]) => {
                const info = clusterInfo[name];
                return (
                    <div key={name}>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <div className="flex items-center">
                                <i className={`${info.icon} w-5 text-center text-gray-300`}></i>
                                <span className="ml-2 font-medium text-gray-200">{name}</span>
                            </div>
                            {/* FIX: Explicitly cast value to a number for the arithmetic operation. */}
                            <span className="font-mono text-white">{(Number(value) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                            {/* FIX: Explicitly cast value to a number for calculating width. */}
                            <div className={`${info.color} h-2.5 rounded-full`} style={{ width: `${Number(value) * 100}%` }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const CollectiveIntelligenceStatus: React.FC<CollectiveIntelligenceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { socialResonanceScore, communicationMode, swarmDynamics, currentTrend, activeClusters } = state;

    const getStatusColor = () => {
        if (socialResonanceScore > 0.6) return 'bg-cyan-500';
        if (socialResonanceScore > 0.3) return 'bg-green-500';
        return 'bg-purple-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-users-viewfinder mr-3"></i>
                        Collective Intelligence & Social Dynamics
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="flex flex-col items-center justify-center bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-2 text-lg">Social Resonance Score</h3>
                        <SRSGauge score={socialResonanceScore} />
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Active Audience Clusters</h3>
                        <ClusterChart data={activeClusters} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                     <div className="lg:col-span-2 bg-gray-950/50 p-4 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Swarm Dynamics Model</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-black/20 p-2 rounded-md"><b className="text-green-400">Attraction:</b> {swarmDynamics.attraction}</div>
                            <div className="bg-black/20 p-2 rounded-md"><b className="text-red-400">Repulsion:</b> {swarmDynamics.repulsion}</div>
                            <div className="bg-black/20 p-2 rounded-md"><b className="text-blue-400">Alignment:</b> {swarmDynamics.alignment}</div>
                            <div className="bg-black/20 p-2 rounded-md"><b className="text-purple-400">Momentum:</b> {swarmDynamics.momentum}</div>
                        </div>
                     </div>
                     <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                         <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Current Trend</h3>
                         <p className="text-lg font-bold text-white">{currentTrend.name}</p>
                         <p className="text-sm font-semibold text-purple-300">{currentTrend.phase}</p>
                         <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                             <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1 rounded-full animate-pulse"></div>
                         </div>
                         <h3 className="font-semibold text-cyan-300 mt-4 mb-2 text-lg">Communication Mode</h3>
                         <p className={`font-bold text-lg ${communicationMode === 'Swarm' ? 'text-cyan-300' : 'text-gray-300'}`}>{communicationMode}</p>
                     </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Collective Intelligence: ${communicationMode} Mode`}>
                <i className="fa-solid fa-users text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Collective Intelligence
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default CollectiveIntelligenceStatus;