import React, { useState } from 'react';
import { CulturalIntelligenceState } from '../types';

interface CulturalIntelligenceStatusProps {
    state: CulturalIntelligenceState | null;
}

const CCSGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score * circumference;
    
    let colorClass = 'text-green-400';
    let label = 'Culturally Aligned';
    if (score < 0.7) {
        colorClass = 'text-red-400';
        label = 'Drift Warning';
    } else if (score < 0.85) {
        colorClass = 'text-yellow-400';
        label = 'Consistent';
    }

    return (
        <div className="relative flex flex-col items-center">
            <svg className="w-52 h-52" viewBox="0 0 100 100">
                 <defs>
                    <filter id="glow-ccs">
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
                    filter="url(#glow-ccs)"
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-4xl font-bold fill-current text-white font-mono">
                    {(score * 100).toFixed(0)}
                </text>
                 <text x="50%" y="68%" textAnchor="middle" className="text-sm font-semibold fill-current text-gray-400">
                    CCS
                </text>
            </svg>
            <p className={`-mt-2 font-semibold text-xl ${colorClass}`}>{label}</p>
        </div>
    );
};

const CulturalIntelligenceStatus: React.FC<CulturalIntelligenceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { culturalProfile, culturalConsistencyScore, narrativeAnalysis, trackedCulturalTokens } = state;

    const getStatusColor = () => {
        if (culturalConsistencyScore < 0.7) return 'bg-red-500';
        if (culturalConsistencyScore < 0.85) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-masks-theater mr-3"></i>
                        Cultural & Narrative Intelligence
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="flex flex-col items-center justify-center bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-2 text-lg">Cultural Consistency Score</h3>
                        <CCSGauge score={culturalConsistencyScore} />
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Community Cultural Profile</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-md">
                                <span className="font-medium text-gray-300">Language Variant</span>
                                <span className="font-mono text-purple-300">{culturalProfile.languageVariant}</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-md">
                                <span className="font-medium text-gray-300">Dominant Humor</span>
                                <span className="font-mono text-purple-300 capitalize">{culturalProfile.humorType}</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-md">
                                <span className="font-medium text-gray-300">Visual Aesthetic</span>
                                <span className="font-mono text-purple-300 capitalize">{culturalProfile.visualAesthetic}</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-2 rounded-md">
                                <span className="font-medium text-gray-300">Irony Level</span>
                                <div className="w-24 bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{width: `${culturalProfile.ironyLevel * 100}%`}}></div>
                                </div>
                            </div>
                             <div className="flex justify-between items-center bg-black/20 p-2 rounded-md">
                                <span className="font-medium text-gray-300">Meme Cycle</span>
                                <span className="font-mono text-purple-300">{culturalProfile.dominantMemeCycle}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                     <div className="lg:col-span-2 bg-gray-950/50 p-4 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Narrative Intelligence</h3>
                         <div className="bg-black/20 p-3 rounded-md mb-3">
                            <p className="font-semibold text-gray-200">Dominant Structure:</p>
                            <p className="font-mono text-lg text-purple-300">{narrativeAnalysis.structure}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-black/20 p-2 rounded-md text-center">
                                <p className="font-semibold text-gray-200">Time to Conflict</p>
                                <p className="font-mono text-xl text-cyan-300">{narrativeAnalysis.timeToConflict.toFixed(1)}s</p>
                            </div>
                             <div className="bg-black/20 p-2 rounded-md text-center">
                                <p className="font-semibold text-gray-200">Payoff Satisfaction</p>
                                <p className="font-mono text-xl text-cyan-300">{(narrativeAnalysis.payoffSatisfaction * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                     </div>
                     <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                         <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Tracked Tokens</h3>
                         <div className="space-y-2">
                            {trackedCulturalTokens.map(token => (
                                <p key={token} className="text-sm font-mono text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded">
                                    {token}
                                </p>
                            ))}
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Cultural Intelligence: ${culturalProfile.languageVariant}`}>
                <i className="fa-solid fa-masks-theater text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Cultural Intelligence
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default CulturalIntelligenceStatus;
