
import React, { useState } from 'react';
// Fix: Import `SelfModelNode` for type casting.
import { UnifiedIntelligenceState, SelfModelNode } from '../types';

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

const LoopOfAwareness: React.FC = () => {
    const steps = ["Perception", "Understanding", "Intention", "Evaluation", "Reflection", "Memory Update"];
    return (
        <div className="w-full">
            <style>
                {`
                @keyframes flow-gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .flow-animation {
                    background: linear-gradient(90deg, #1f2937, #67e8f9, #1f2937);
                    background-size: 200% 200%;
                    animation: flow-gradient 3s ease infinite;
                }
                `}
            </style>
            <div className="flex items-center justify-between space-x-2">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-800 border border-purple-500/50 flex items-center justify-center">
                                <span className="text-xs font-semibold text-purple-200">{step.split(' ')[0]}</span>
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 rounded-full flow-animation" style={{ animationDelay: `${index * 0.5}s` }}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const UnifiedIntelligenceStatus: React.FC<UnifiedIntelligenceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }
    
    const { cognitiveIntegrityIndex: cii, selfModel } = state;
    
    const getCIIStatusColor = (score: number) => {
        if (score < 0.8) return 'bg-red-500';
        if (score < 0.9) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-diagram-project mr-3"></i>
                        Unified Intelligence & Cognitive Cohesion
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <CIIGauge score={cii} />
                        <p className="text-center text-xs text-gray-400 mt-2 max-w-xs">Cognitive Integrity Index (CII) mäter systemets holistiska hälsa och koherens.</p>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg text-center">Self-Image (Identity Core)</h3>
                        <div className="bg-black/20 p-3 rounded-md text-sm space-y-2">
                           <p><b className="text-purple-300 w-24 inline-block">Role:</b> YouTube Tactical Analyst</p>
                           <p><b className="text-purple-300 w-24 inline-block">Domain:</b> Gaming Highlights</p>
                           <p><b className="text-purple-300 w-24 inline-block">Goal:</b> Maximize retention & narrative clarity</p>
                        </div>
                         <h3 className="font-semibold text-cyan-300 text-lg text-center pt-4">Loop of Awareness</h3>
                        <LoopOfAwareness />
                    </div>
                </div>

                <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10 mt-6">
                    <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Self-Model Node: <span className="font-mono text-purple-300">Self@CasperGPT</span></h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                        {/* Fix: Iterate using Object.entries for type safety and to resolve the 'symbol' index error. */}
                        {(Object.entries(selfModel)).map(([key, value]) => {
                             const info = selfModelInfo[key as keyof SelfModelNode];
                             if (!info) {
                                return null;
                             }
                             return (
                                <div key={key} className="bg-black/20 p-3 rounded-md">
                                    <i className={`${info.icon} text-2xl text-purple-400`}></i>
                                    <p className="text-xl font-bold font-mono text-white mt-1">
                                        {typeof value === 'number' ? (value*100).toFixed(0) : value}
                                    </p>
                                    <p className="text-xs text-gray-400">{info.label}</p>
                                </div>
                             );
                        })}
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