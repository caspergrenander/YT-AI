
import React, { useState } from 'react';
import { InteractivePerceptionState } from '../types';

interface InteractivePerceptionStatusProps {
    state: InteractivePerceptionState | null;
}

const modeInfo: { [key in InteractivePerceptionState['systemMode']]: { icon: string; color: string; description: string } } = {
    'Normal': { icon: 'fa-solid fa-brain', color: 'text-cyan-400', description: 'Standard analysis and response mode.' },
    'Fast-Response': { icon: 'fa-solid fa-bolt-lightning', color: 'text-yellow-400', description: 'High-speed, low-latency mode for critical anomalies.' },
    'Reflective': { icon: 'fa-solid fa-moon', color: 'text-purple-400', description: 'Quiet analysis of past data during low activity.' },
};

const FocusDonutChart: React.FC<{ data: { [key: string]: number } }> = ({ data }) => {
    const colors = ['#22d3ee', '#a855f7', '#f59e0b', '#ec4899', '#a3a3a3'];
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    // FIX: Correctly sort the data by numeric value. The original code `b - a` was attempting to subtract arrays, causing a TypeError. This also fixes follow-on errors where `value` was not inferred as a number.
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

    return (
        <div className="flex items-center space-x-6">
            <svg width="180" height="180" viewBox="0 0 140 140" className="-rotate-90">
                {sortedData.map(([key, value], index) => {
                    const dashoffset = accumulatedOffset;
                    const dasharray = value * circumference;
                    accumulatedOffset += dasharray;

                    return (
                        <circle
                            key={key}
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="transparent"
                            stroke={colors[index % colors.length]}
                            strokeWidth="18"
                            strokeDasharray={`${dasharray} ${circumference}`}
                            strokeDashoffset={-dashoffset}
                        />
                    );
                })}
                 <text x="70" y="75" textAnchor="middle" className="rotate-90 font-bold text-lg fill-white" style={{fontFamily: 'var(--font-heading)'}}>
                    FOCUS
                </text>
            </svg>
            <div className="space-y-2">
                {sortedData.map(([key, value], index) => (
                    <div key={key} className="flex items-center text-sm">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="text-gray-300 w-32">{key}</span>
                        <span className="font-mono font-semibold text-white">{(value * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnomalyGauge: React.FC<{ score: number }> = ({ score }) => {
    let color = 'bg-green-500';
    let label = 'Normal Variation';
    if (score > 0.6) {
        color = 'bg-red-500 animate-pulse';
        label = 'Critical Anomaly';
    } else if (score > 0.2) {
        color = 'bg-yellow-500';
        label = 'Deviation Detected';
    }

    return (
        <div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                <span>Pattern Entropy Score</span>
                <span className="font-mono font-bold text-white">{score.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div className={`${color} h-3 rounded-full transition-all duration-300`} style={{ width: `${score * 100}%` }}></div>
            </div>
            <p className="text-right text-xs font-semibold text-gray-300 mt-1">{label}</p>
        </div>
    );
};


const InteractivePerceptionStatus: React.FC<InteractivePerceptionStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }
    
    const { systemMode, anomalyScore } = state;
    const currentModeInfo = modeInfo[systemMode];

    const getStatusColor = () => {
        if (anomalyScore > 0.6) return 'bg-red-500';
        if (anomalyScore > 0.2) return 'bg-yellow-500';
        return 'bg-green-500';
    };


    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-3xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-satellite-dish mr-3"></i>
                        Interactive Perception
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg text-center">Live Focus Map</h3>
                        <FocusDonutChart data={state.liveFocusMap} />
                    </div>
                    <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                            <h3 className="font-semibold text-cyan-300 mb-2 text-lg">System Mode</h3>
                            <div className="flex items-center bg-black/20 p-3 rounded-md border-l-4" style={{ borderColor: currentModeInfo.color.startsWith('text-') ? `var(--tw-color-${currentModeInfo.color.split('-')[1]}-400)` : 'white' }}>
                                <i className={`${currentModeInfo.icon} ${currentModeInfo.color} text-3xl mr-4`}></i>
                                <div>
                                    <p className="font-bold text-white text-lg">{systemMode}</p>
                                    <p className="text-xs text-gray-400">{currentModeInfo.description}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-cyan-300 mb-2 text-lg">Anomaly Detection</h3>
                            <AnomalyGauge score={anomalyScore} />
                        </div>
                         <div>
                            <h3 className="font-semibold text-cyan-300 mb-2 text-lg">Last Anomaly</h3>
                            <p className="text-sm font-mono text-yellow-300 bg-black/20 p-2 rounded-md truncate" title={state.lastAnomaly}>
                               <i className={`fa-solid ${state.lastAnomaly === 'None' ? 'fa-check-circle text-green-400' : 'fa-triangle-exclamation text-yellow-400'} mr-2`}></i>
                               {state.lastAnomaly}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Interactive Perception: ${systemMode}`}>
                <i className="fa-solid fa-satellite-dish text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Interactive Perception
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default InteractivePerceptionStatus;