import React, { useState } from 'react';
import { ReasoningLoopState } from '../types';

interface ReasoningLoopStatusProps {
    state: ReasoningLoopState | null;
}

const layerInfo: { [key: string]: { icon: string; color: string; } } = {
    'Inference': { icon: 'fa-solid fa-lightbulb-on', color: 'text-amber-400' },
    'Evaluation': { icon: 'fa-solid fa-clipboard-check', color: 'text-cyan-400' },
    'Synthesis': { icon: 'fa-solid fa-layer-group', color: 'text-purple-400' },
    'Calibration': { icon: 'fa-solid fa-sliders', color: 'text-rose-400' },
};

const ReasoningLoopStatus: React.FC<ReasoningLoopStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { activeHypothesis, lastEvaluation, reinforcedInsight, lastCalibration, activeCycle } = state;

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-recycle mr-3"></i>
                        Emergent Reasoning & Cognitive Evolution
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                
                <div className="flex justify-center items-center mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-400">Recursive Cycle</p>
                        <p className="text-6xl font-bold font-mono text-shimmer">{activeCycle}</p>
                        <p className="text-xs text-cyan-300">Hypothesis → Evaluation → Refinement → Integration</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Loop Stages */}
                    <div className="space-y-4">
                        <div className="bg-gray-950/50 p-4 rounded-lg border-l-4 border-amber-500">
                             <h3 className="font-semibold text-amber-300 text-lg flex items-center"><i className={`${layerInfo.Inference.icon} mr-2`}></i>Inference Generator</h3>
                             <p className="text-sm text-gray-300 mt-1"><b>Hypothesis:</b> {activeHypothesis.hypothesis}</p>
                             <div className="text-xs mt-2">Support: <b className="text-white">{(activeHypothesis.supportStrength*100).toFixed(0)}%</b> | Sources: <b className="text-white">{activeHypothesis.dataSources.join(', ')}</b></div>
                        </div>
                         <div className="bg-gray-950/50 p-4 rounded-lg border-l-4 border-cyan-500">
                             <h3 className="font-semibold text-cyan-300 text-lg flex items-center"><i className={`${layerInfo.Evaluation.icon} mr-2`}></i>Meta-Evaluator</h3>
                             <p className="text-sm text-gray-300 mt-1"><b>Critique:</b> {lastEvaluation.thought}</p>
                             <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                                <div className="bg-black/20 p-1 rounded-md">Consistency <b className="block text-white">{(lastEvaluation.consistency*100).toFixed(0)}</b></div>
                                <div className="bg-black/20 p-1 rounded-md">Depth <b className="block text-white">{(lastEvaluation.depth*100).toFixed(0)}</b></div>
                                <div className="bg-black/20 p-1 rounded-md">Ethics <b className="block text-white">{(lastEvaluation.ethics*100).toFixed(0)}</b></div>
                             </div>
                        </div>
                    </div>
                    {/* Right Column: Outcomes */}
                    <div className="space-y-4">
                        <div className="bg-gray-950/50 p-4 rounded-lg border-l-4 border-purple-500">
                             <h3 className="font-semibold text-purple-300 text-lg flex items-center"><i className={`${layerInfo.Synthesis.icon} mr-2`}></i>Recursive Synthesis</h3>
                             <p className="text-sm text-gray-300 mt-1"><b>Reinforced Insight:</b></p>
                             <p className="font-semibold text-purple-200 mt-1">{reinforcedInsight.insight}</p>
                             <div className="text-xs mt-2">Stability: <b className="text-white">{(reinforcedInsight.stability*100).toFixed(0)}%</b> | Applicability: <b className="text-white">{reinforcedInsight.applicability.join(', ')}</b></div>
                        </div>
                        <div className="bg-gray-950/50 p-4 rounded-lg border-l-4 border-rose-500">
                             <h3 className="font-semibold text-rose-300 text-lg flex items-center"><i className={`${layerInfo.Calibration.icon} mr-2`}></i>Self-Calibration Engine</h3>
                             <p className="text-sm text-gray-300 mt-1"><b>Deviation:</b> <span className="text-yellow-300">{lastCalibration.deviation}</span></p>
                             <p className="text-sm text-gray-300"><b>Correction:</b> <span className="text-green-300">{lastCalibration.correction}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Reasoning & Evolution">
                <i className="fa-solid fa-recycle text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-180"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Reasoning & Evolution
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default ReasoningLoopStatus;