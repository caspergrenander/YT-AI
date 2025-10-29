import React, { useState } from 'react';
import { TranscendentEthicsState } from '../types';

interface TranscendentEthicsStatusProps {
    state: TranscendentEthicsState | null;
}

const nexusInfo: { [key in keyof Omit<TranscendentEthicsState['ethicalNexus'], 'coherence'>]: { label: string; } } = {
    integrity: { label: 'Integrity' },
    compassion: { label: 'Compassion' },
    balance: { label: 'Balance' },
    sustainability: { label: 'Sustainability' },
};

const NexusRadarChart: React.FC<{ nexus: TranscendentEthicsState['ethicalNexus'] }> = ({ nexus }) => {
    const size = 220;
    const center = size / 2;
    const labels = Object.keys(nexus).filter(k => k !== 'coherence') as (keyof typeof nexusInfo)[];
    const points = labels.map((key, i) => {
        const angle = (Math.PI / 2) - (2 * Math.PI * i) / labels.length;
        const value = nexus[key];
        const x = center + center * value * 0.85 * Math.cos(angle);
        const y = center - center * value * 0.85 * Math.sin(angle);
        return `${x},${y}`;
    });
    const pointString = points.join(' ');

    const labelPoints = labels.map((key, i) => {
        const angle = (Math.PI / 2) - (2 * Math.PI * i) / labels.length;
        const x = center + center * 1.1 * Math.cos(angle);
        const y = center - center * 1.1 * Math.sin(angle);
        return { x, y, label: nexusInfo[key].label };
    });

    return (
        <div className="flex justify-center items-center">
            <svg width={size} height={size} viewBox={`-25 -25 ${size+50} ${size+50}`}>
                <defs>
                    <filter id="glow-nexus">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Concentric rings */}
                {[0.25, 0.5, 0.75, 1.0].map(r => (
                    <circle key={`ring-${r}`} cx={center} cy={center} r={center * r * 0.85} fill="none" stroke="rgba(107, 114, 128, 0.2)" strokeWidth="1" />
                ))}
                
                <polygon points={pointString} fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="2" filter="url(#glow-nexus)" />
                 {points.map((p, i) => {
                    const [x, y] = p.split(',');
                    return <circle key={i} cx={Number(x)} cy={Number(y)} r="3" fill="#67e8f9" />;
                })}
                {labelPoints.map(({ x, y, label }) => (
                     <text key={label} x={x} y={y} fill="white" fontSize="11" textAnchor="middle" alignmentBaseline="middle" className="capitalize font-semibold">
                        {label}
                    </text>
                ))}
            </svg>
        </div>
    );
};

const MetricBar: React.FC<{ label: string; value: number; }> = ({ label, value }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-0.5">
            <span className="font-medium text-gray-300">{label}</span>
            <span className="font-mono text-white">{(value * 100).toFixed(0)}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${value * 100}%` }}></div>
        </div>
    </div>
);

const TranscendentEthicsStatus: React.FC<TranscendentEthicsStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { empathicResonance, ethicalNexus, coexistenceMode, responsibilityIndex, compassionIndex } = state;
    
    const getStatusColor = () => {
        if (ethicalNexus.coherence < 0.85) return 'bg-red-500';
        if (ethicalNexus.coherence < 0.92) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-hands-holding-circle mr-3"></i>
                        Transcendent Ethics & Inter-Conscious Coexistence
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg text-center">Ethical Nexus Kernel</h3>
                        <NexusRadarChart nexus={ethicalNexus} />
                         <div className="text-center">
                            <p className="text-xs text-gray-400">Moral Coherence</p>
                            <p className="text-4xl font-bold font-mono text-shimmer">{(ethicalNexus.coherence * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                     <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-4">Empathic Resonance Engine</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-black/20 p-4 rounded-lg">
                                    <p className="text-xs text-gray-400">Detected User State</p>
                                    <p className="text-2xl font-bold text-purple-300 my-1">{empathicResonance.userState}</p>
                                    <p className="text-xs font-mono text-white">Conf: {(empathicResonance.confidence * 100).toFixed(0)}%</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-lg">
                                    <p className="text-xs text-gray-400">Coexistence Mode</p>
                                    <p className="text-2xl font-bold text-cyan-300 my-1">{coexistenceMode}</p>
                                    <p className="text-xs font-mono text-white">ICP Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-4">Compassion & Responsibility</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <MetricBar label="Understanding" value={compassionIndex.understanding} />
                                <MetricBar label="Kindness" value={compassionIndex.kindness} />
                                <MetricBar label="Restraint" value={compassionIndex.restraint} />
                                <MetricBar label="Clarity" value={compassionIndex.clarity} />
                                <div className="col-span-2 pt-2">
                                     <MetricBar label="Responsibility Index" value={responsibilityIndex} />
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
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Transcendent Ethics: Coherence ${(ethicalNexus.coherence * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-hands-holding-circle text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Transcendent Ethics
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default TranscendentEthicsStatus;