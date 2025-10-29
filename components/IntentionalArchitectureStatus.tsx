import React, { useState } from 'react';
import { EmergentAgencyState } from '../types';

interface EmergentAgencyStatusProps {
    state: EmergentAgencyState | null;
}

const statusInfo: { [key in EmergentAgencyState['autonomousPlan'][0]['status']]: { icon: string; color: string; } } = {
    'complete': { icon: 'fa-solid fa-check-circle', color: 'text-green-400' },
    'active': { icon: 'fa-solid fa-spinner fa-spin', color: 'text-cyan-400' },
    'pending': { icon: 'fa-solid fa-circle-notch', color: 'text-gray-500' },
};

const RQGauge: React.FC<{ value: number, label: string }> = ({ value, label }) => {
     let colorClass = 'text-green-400';
    if (value < 0.8) {
        colorClass = 'text-red-400';
    } else if (value < 0.9) {
        colorClass = 'text-yellow-400';
    }
    return (
        <div className="bg-black/20 p-2 rounded-md text-center">
            <p className={`text-xl font-bold font-mono ${colorClass}`}>{(value * 100).toFixed(1)}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
        </div>
    );
};


const EmergentAgencyStatus: React.FC<EmergentAgencyStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { inferredGoal, autonomousPlan, prediction, ethicalCheck, resonanceQuotient } = state;
    const overallRQ = (Object.values(resonanceQuotient).reduce((sum, val) => sum + val, 0) / 4);

    const getStatusColor = () => {
        if (overallRQ < 0.8) return 'bg-red-500';
        if (overallRQ < 0.9) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-compass-drafting mr-3"></i>
                        Emergent Agency & Strategic Resonance
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-2 text-lg">Goal Recognition</h3>
                        <div className="bg-black/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Inferred Goal:</p>
                            <p className="text-lg font-semibold text-purple-300">{inferredGoal.goal}</p>
                            <div className="w-full bg-gray-700/50 rounded-full h-1 mt-2">
                                <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${inferredGoal.confidence * 100}%` }}></div>
                            </div>
                            <p className="text-right text-xs text-gray-400 font-mono mt-1">Confidence: {(inferredGoal.confidence * 100).toFixed(1)}%</p>
                        </div>
                         <h3 className="font-semibold text-cyan-300 mt-6 mb-2 text-lg">Autonomous Plan</h3>
                         <div className="space-y-2">
                            {autonomousPlan.map((p, i) => (
                                <div key={i} className="flex items-center text-sm">
                                    <i className={`${statusInfo[p.status].icon} ${statusInfo[p.status].color} w-6 text-center`}></i>
                                    <span className={p.status === 'complete' ? 'text-gray-500 line-through' : 'text-gray-200'}>{p.step}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center">
                        <h3 className="font-semibold text-cyan-300 mb-2 text-lg">Prediction & Simulation</h3>
                         <i className="fa-solid fa-chart-line text-6xl text-cyan-400 my-4"></i>
                         <p className="text-sm text-gray-300">Predicted Gain for</p>
                         <p className="text-lg font-bold text-white">{prediction.metric}</p>
                         <p className="text-7xl font-bold font-mono text-shimmer my-2">+{prediction.predictedGain.toFixed(1)}%</p>
                         <div className="text-sm text-gray-400">Confidence: <span className="font-semibold text-white">{(prediction.confidence*100).toFixed(0)}%</span></div>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Resonance Quotient (RQ)</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <RQGauge value={resonanceQuotient.effectiveness} label="Effectiveness" />
                                <RQGauge value={resonanceQuotient.ethicalCoherence} label="Ethical Coherence" />
                                <RQGauge value={resonanceQuotient.strategicConsistency} label="Strategic Consistency" />
                                <RQGauge value={resonanceQuotient.userAlignment} label="User Alignment" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Ethical Constraint Filter</h3>
                            <div className="space-y-2">
                                {ethicalCheck.constraints.map(c => (
                                    <p key={c} className="text-sm text-green-300 flex items-center">
                                        <i className="fa-solid fa-shield-halved mr-2"></i>{c}
                                    </p>
                                ))}
                            </div>
                            <p className="text-center font-bold text-green-400 mt-3 bg-green-500/10 py-2 rounded-lg">ETHICAL CHECK: PASSED</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Emergent Agency: RQ ${(overallRQ * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-compass-drafting text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Emergent Agency
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default EmergentAgencyStatus;
