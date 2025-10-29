import React, { useState } from 'react';
import { CognitiveEconomyState } from '../types';

interface CognitiveEconomyStatusProps {
    state: CognitiveEconomyState | null;
}

const ResourceGauge: React.FC<{ value: number; label: string; icon: string; unit: string; max: number; color: string; }> = ({ value, label, icon, unit, max, color }) => {
    const percentage = (value / max) * 100;
    const angle = -90 + (percentage * 1.8);
    const getStrokeColor = (val: number) => {
        if (val > 85) return 'stroke-red-500';
        if (val > 60) return 'stroke-yellow-400';
        return `stroke-${color}-400`;
    };

    return (
        <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                        d="M 30 70 A 20 20 0 1 1 70 70"
                        fill="none"
                        strokeWidth="10"
                        className="stroke-gray-700"
                    />
                    <path
                        d="M 30 70 A 20 20 0 1 1 70 70"
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className={`${getStrokeColor(percentage)} transition-all duration-500`}
                        style={{
                            strokeDasharray: '62.83, 62.83',
                            strokeDashoffset: 62.83 * (1 - percentage / 100),
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <i className={`${icon} ${color.replace('stroke-', 'text-')} text-lg -mt-2`}></i>
                    <span className="text-xl font-bold font-mono text-white">{value.toFixed(unit === '%' ? 0 : 2)}{unit === 'ms' ? '' : unit}</span>
                    {unit === 'ms' && <span className="text-xs text-gray-400 -mt-1">ms</span>}
                </div>
            </div>
            <p className="text-xs font-semibold text-gray-300 mt-2">{label}</p>
        </div>
    );
};


const CognitiveEconomyStatus: React.FC<CognitiveEconomyStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { processLoad, memoryUsage, avgLatency, affectiveEnergy, cognitiveValueIndex, activeModules, lastOptimization } = state;

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-3xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-sliders mr-3"></i>
                        Cognitive Economy & Self-Optimization
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                    <h3 className="font-semibold text-cyan-300 mb-4 text-lg text-center">Real-time Resource Balancing</h3>
                    <div className="flex justify-around items-center">
                        <ResourceGauge value={processLoad * 100} label="Process Load" icon="fa-solid fa-microchip" unit="%" max={100} color="rose" />
                        <ResourceGauge value={memoryUsage * 100} label="Memory Usage" icon="fa-solid fa-memory" unit="%" max={100} color="amber" />
                        <ResourceGauge value={avgLatency} label="Avg. Latency" icon="fa-solid fa-clock" unit="ms" max={2000} color="cyan" />
                        <ResourceGauge value={affectiveEnergy * 100} label="Affective Energy" icon="fa-solid fa-heart-pulse" unit="%" max={100} color="purple" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="md:col-span-1 bg-gray-950/50 p-4 rounded-lg border border-white/10 text-center">
                        <h3 className="font-semibold text-cyan-300 text-lg">Cognitive Value Index</h3>
                        <p className="text-5xl font-bold font-mono text-shimmer my-2">{cognitiveValueIndex.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Prioriterar uppgifter baserat på <br/>(Impact × Relevans) / Kostnad.</p>
                    </div>
                    <div className="md:col-span-2 bg-gray-950/50 p-4 rounded-lg border border-white/10">
                         <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Resource Optimization</h3>
                         <div className="mb-3">
                            <p className="text-sm font-medium text-gray-300 mb-1">Active Modules:</p>
                             <div className="flex flex-wrap gap-2">
                                {activeModules.map(m => (
                                    <span key={m} className="text-xs py-1 px-2.5 bg-purple-500/20 text-purple-200 rounded-full border border-purple-500/30">{m}</span>
                                ))}
                            </div>
                         </div>
                         <div>
                            <p className="text-sm font-medium text-gray-300 mb-1">Last Action:</p>
                             <p className="text-sm font-mono text-cyan-300 bg-black/20 p-2 rounded-md">
                                <i className="fa-solid fa-bolt-lightning mr-2 text-yellow-400"></i>
                                {lastOptimization}
                            </p>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Cognitive Economy">
                <i className="fa-solid fa-sliders text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                 <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Cognitive Economy
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default CognitiveEconomyStatus;
