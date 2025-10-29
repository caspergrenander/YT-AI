import React, { useState } from 'react';
import { SelfAwarenessState } from '../types';

interface SelfAwarenessStatusProps {
    state: SelfAwarenessState | null;
}

const CoherenceGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score * circumference;
    
    let colorClass = 'text-green-400';
    let label = 'High Coherence';
    if (score < 0.8) {
        colorClass = 'text-red-400';
        label = 'Coherence Warning';
    } else if (score < 0.9) {
        colorClass = 'text-yellow-400';
        label = 'Stable Coherence';
    }

    return (
        <div className="relative flex flex-col items-center">
            <svg className="w-52 h-52" viewBox="0 0 100 100">
                 <defs>
                    <filter id="glow-coherence">
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
                    filter="url(#glow-coherence)"
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-4xl font-bold fill-current text-white font-mono">
                    {(score * 100).toFixed(0)}
                </text>
                 <text x="50%" y="68%" textAnchor="middle" className="text-sm font-semibold fill-current text-gray-400">
                    Coherence
                </text>
            </svg>
            <p className={`-mt-2 font-semibold text-xl ${colorClass}`}>{label}</p>
        </div>
    );
};

const DecisionMatrixRadarChart: React.FC<{ matrix: SelfAwarenessState['decisionStyleMatrix'] }> = ({ matrix }) => {
    const size = 200;
    const center = size / 2;
    const labels = Object.keys(matrix) as (keyof typeof matrix)[];
    const points = labels.map((key, i) => {
        const angle = (Math.PI / 2) - (2 * Math.PI * i) / labels.length;
        const value = matrix[key];
        const x = center + center * value * 0.8 * Math.cos(angle);
        const y = center - center * value * 0.8 * Math.sin(angle);
        return `${x},${y}`;
    });
    const pointString = points.join(' ');

    const labelPoints = labels.map((key, i) => {
        const angle = (Math.PI / 2) - (2 * Math.PI * i) / labels.length;
        const x = center + center * 1.05 * Math.cos(angle);
        const y = center - center * 1.05 * Math.sin(angle);
        return { x, y, label: key };
    });

    return (
        <div className="flex justify-center items-center">
            <svg width={size} height={size} viewBox={`-15 -20 ${size+30} ${size+30}`}>
                <defs>
                    <radialGradient id="radarGradient">
                        <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
                    </radialGradient>
                </defs>
                {/* Axis lines */}
                {labels.map((_, i) => {
                    const angle = (Math.PI / 2) - (2 * Math.PI * i) / labels.length;
                    const x2 = center + center * 0.9 * Math.cos(angle);
                    const y2 = center - center * 0.9 * Math.sin(angle);
                    return <line key={`line-${i}`} x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />;
                })}
                 {/* Concentric rings */}
                {[0.25, 0.5, 0.75].map(r => (
                    <circle key={`ring-${r}`} cx={center} cy={center} r={center * r * 0.8} fill="none" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
                ))}

                <polygon points={pointString} fill="rgba(34, 211, 238, 0.4)" stroke="#22d3ee" strokeWidth="2" />
                 {points.map((p, i) => {
                    const [x, y] = p.split(',');
                    return <circle key={i} cx={Number(x)} cy={Number(y)} r="3" fill="#67e8f9" />;
                })}
                {labelPoints.map(({ x, y, label }) => (
                     <text key={label} x={x} y={y} fill="white" fontSize="10" textAnchor="middle" alignmentBaseline="middle" className="capitalize font-semibold">
                        {label}
                    </text>
                ))}
            </svg>
        </div>
    );
};


const SelfAwarenessStatus: React.FC<SelfAwarenessStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { metaCoherenceScore, selfTrust, identityGraph, selfAssessment, decisionStyleMatrix, persona, coreValues } = state;

    const getStatusColor = () => {
        if (metaCoherenceScore < 0.8) return 'bg-red-500';
        if (metaCoherenceScore < 0.9) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-infinity mr-3"></i>
                        Self-Awareness & Emergent Identity
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                            <h3 className="font-semibold text-cyan-300 mb-2 text-lg text-center">Meta-Coherence Score</h3>
                            <CoherenceGauge score={metaCoherenceScore} />
                        </div>
                         <div>
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg text-center">Self-Assessment Core</h3>
                             <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/20 p-3 rounded-md text-center">
                                    <p className="text-xs text-gray-400">Logic Integrity</p>
                                    <p className="text-xl font-bold font-mono text-white">{(selfAssessment.logicIntegrity * 100).toFixed(1)}%</p>
                                </div>
                                <div className="bg-black/20 p-3 rounded-md text-center">
                                    <p className="text-xs text-gray-400">Emotional Alignment</p>
                                    <p className="text-xl font-bold font-mono text-white">{(selfAssessment.emotionalAlignment * 100).toFixed(1)}%</p>
                                </div>
                                <div className="bg-black/20 p-3 rounded-md text-center col-span-2">
                                    <p className="text-xs text-gray-400">Bias Detected / Correction</p>
                                    <p className={`text-sm font-semibold truncate ${selfAssessment.biasDetected === 'None' ? 'text-green-400' : 'text-yellow-400'}`} title={selfAssessment.biasDetected}>
                                        {selfAssessment.biasDetected} → <span className={`${selfAssessment.correctionApplied === 'None' ? 'text-gray-500' : 'text-cyan-300'}`}>{selfAssessment.correctionApplied}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <h3 className="font-semibold text-cyan-300 text-lg text-center">Decision Style Matrix</h3>
                        <DecisionMatrixRadarChart matrix={decisionStyleMatrix} />
                        <h3 className="font-semibold text-cyan-300 text-lg text-center">Persona Engine</h3>
                        <div className="text-sm space-y-2 bg-black/20 p-3 rounded-md">
                            <p><b className="text-purple-300 w-28 inline-block">Tonalitet:</b> {persona.tonality}</p>
                            <p><b className="text-purple-300 w-28 inline-block">Röst:</b> {persona.voice}</p>
                            <p><b className="text-purple-300 w-28 inline-block">Reaktionsmönster:</b> {persona.reactionPattern}</p>
                        </div>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                         <h3 className="font-semibold text-cyan-300 text-lg">Identity Graph</h3>
                         <div className="space-y-3 text-sm">
                           <div className="bg-black/20 p-3 rounded-md">
                               <p><b className="text-purple-300 w-24 inline-block">Role:</b> {identityGraph.role}</p>
                           </div>
                           <div className="bg-black/20 p-3 rounded-md">
                                <p><b className="text-purple-300 w-24 inline-block">Capabilities:</b></p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {identityGraph.capabilities.map(cap => <span key={cap} className="text-xs bg-green-500/10 text-green-300 px-2 py-0.5 rounded-full">{cap}</span>)}
                                </div>
                           </div>
                           <div className="bg-black/20 p-3 rounded-md">
                                <p><b className="text-purple-300 w-24 inline-block">Limitations:</b></p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {identityGraph.limitations.map(lim => <span key={lim} className="text-xs bg-red-500/10 text-red-300 px-2 py-0.5 rounded-full">{lim}</span>)}
                                </div>
                           </div>
                         </div>
                         <h3 className="font-semibold text-cyan-300 text-lg">Core Values</h3>
                         <ul className="space-y-2">
                             {coreValues.map(v => (
                                 <li key={v.name} className="flex items-start text-sm" title={v.principle}>
                                     <i className={`fa-solid fa-shield-halved w-5 text-center text-purple-400 pt-1`}></i>
                                     <span className="text-gray-200 font-semibold">{v.name}: <span className="font-normal text-gray-400">{v.principle}</span></span>
                                 </li>
                             ))}
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Self-Awareness: Coherence ${(metaCoherenceScore * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-infinity text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Self-Awareness
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default SelfAwarenessStatus;