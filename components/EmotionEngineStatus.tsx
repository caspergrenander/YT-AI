import React, { useState } from 'react';
import { EmotionEngineState } from '../types';

interface EmotionEngineStatusProps {
    state: EmotionEngineState | null;
}

const AffectDisplay: React.FC<{ node: EmotionEngineState['affectNode'] }> = ({ node }) => {
    const valenceColor = node.valence > 0 ? 'bg-green-500' : 'bg-red-500';
    const arousalColor = node.arousal > 0.7 ? 'bg-yellow-500' : 'bg-blue-500';

    return (
        <div className="flex flex-col items-center text-center">
            <div className="relative w-40 h-40">
                <div className="absolute inset-0 border-4 border-purple-500/50 rounded-full animate-pulse" style={{ animationDuration: `${3 - node.arousal * 1.5}s` }}></div>
                <div className="absolute inset-2 border-2 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-shimmer" style={{ fontFamily: 'var(--font-heading)' }}>{node.emotion}</p>
                    <p className="text-xs text-gray-400">Affect Node</p>
                    <p className="text-xs font-mono text-cyan-300 mt-1">Conf: {(node.confidence * 100).toFixed(0)}%</p>
                </div>
            </div>
             <div className="flex space-x-4 mt-4 text-xs">
                <div>
                    <span className="font-semibold text-gray-300">Valence</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full mt-1">
                        <div className={`${valenceColor} h-2 rounded-full`} style={{ width: `${(Math.abs(node.valence)) * 100}%`, marginLeft: node.valence > 0 ? '50%' : 'auto', marginRight: node.valence < 0 ? '50%' : 'auto' }}></div>
                    </div>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Arousal</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full mt-1">
                        <div className={arousalColor} style={{ width: `${node.arousal * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const MetricBar: React.FC<{ label: string; value: number; icon: string; color: string; }> = ({ label, value, icon, color }) => (
    <div>
        <div className="flex items-center text-sm font-semibold text-gray-200">
            <i className={`${icon} ${color} w-5 text-center`}></i>
            <span className="ml-2">{label}</span>
        </div>
        <div className="flex items-center mt-1">
            <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                <div className={`bg-${color.split('-')[1]}-500 h-2 rounded-full`} style={{ width: `${value * 100}%` }}></div>
            </div>
            <span className="text-xs font-mono text-white">{(value * 100).toFixed(0)}</span>
        </div>
    </div>
);


const EmotionEngineStatus: React.FC<EmotionEngineStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { affectNode, metrics, userStateVector } = state;

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-3xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-heart-pulse mr-3"></i>
                        Emotion Engine v5
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Detected Audience Emotion</h3>
                        <AffectDisplay node={affectNode} />
                    </div>
                    <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                           <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Audience Emotional Metrics</h3>
                           <div className="space-y-4">
                                <MetricBar label="Excitation Index" value={metrics.excitationIndex} icon="fa-solid fa-fire" color="text-red-400" />
                                <MetricBar label="Coherence Index" value={metrics.coherenceIndex} icon="fa-solid fa-users" color="text-blue-400" />
                                <MetricBar label="Empathy Score" value={metrics.empathyScore} icon="fa-solid fa-handshake-angle" color="text-green-400" />
                           </div>
                        </div>
                         <div>
                           <h3 className="font-semibold text-cyan-300 mb-3 text-lg">User State Vector (You)</h3>
                            <div className="space-y-4">
                                <MetricBar label="Focus" value={userStateVector.focus} icon="fa-solid fa-crosshairs" color="text-cyan-400" />
                                <MetricBar label="Stress" value={userStateVector.stress} icon="fa-solid fa-brain-circuit" color="text-yellow-400" />
                                <MetricBar label="Enthusiasm" value={userStateVector.enthusiasm} icon="fa-solid fa-star" color="text-purple-400" />
                           </div>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 text-center text-xs text-gray-400 bg-gray-950/50 p-3 rounded-lg border border-white/10 flex items-center justify-center">
                    <i className="fa-solid fa-shield-halved mr-2 text-green-400"></i>
                    Ethical Emotion Filter is active. Emotional data is used for understanding, not manipulation.
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Emotion Engine: Detecting ${affectNode.emotion}`}>
                <i className="fa-solid fa-heart-pulse text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Emotion Engine
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default EmotionEngineStatus;