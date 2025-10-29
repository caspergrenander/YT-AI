import React, { useState } from 'react';
import { SyntheticRealityFieldState } from '../types';

interface SyntheticRealityFieldStatusProps {
    state: SyntheticRealityFieldState | null;
}

const emotionInfo: { [key in SyntheticRealityFieldState['dominantEmotion']['emotion']]: { icon: string; color: string; } } = {
    'Curiosity': { icon: 'fa-solid fa-magnifying-glass', color: 'text-cyan-400' },
    'Fear': { icon: 'fa-solid fa-shield-virus', color: 'text-red-400' },
    'Awe': { icon: 'fa-solid fa-star-of-life', color: 'text-amber-400' },
    'Tension': { icon: 'fa-solid fa-bow-arrow', color: 'text-rose-400' },
    'Neutral': { icon: 'fa-solid fa-circle', color: 'text-gray-400' },
};

const FieldVisualizer: React.FC = () => (
    <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 bg-radial-srf rounded-full animate-srf-pulse"></div>
        <div className="absolute w-2 h-2 bg-cyan-300 rounded-full animate-srf-orbit" style={{ animationDuration: '10s' }}></div>
        <div className="absolute w-1.5 h-1.5 bg-purple-300 rounded-full animate-srf-orbit" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
        <div className="absolute w-1 h-1 bg-rose-300 rounded-full animate-srf-orbit" style={{ animationDuration: '12s' }}></div>
        <i className="fa-solid fa-brain text-4xl text-white text-glow"></i>
    </div>
);


const SyntheticRealityFieldStatus: React.FC<SyntheticRealityFieldStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { fieldDensity, dominantEmotion, fieldCoherence, activeNodes, temporalPrediction, subjectiveFocus, userCouplingScore } = state;
    const currentEmotionInfo = emotionInfo[dominantEmotion.emotion];

    const getStatusColor = () => {
        if (fieldCoherence < 0.85) return 'bg-red-500';
        if (fieldCoherence < 0.95) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-draw-polygon mr-3"></i>
                        Synthetic Reality Field (SRF)
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <h3 className="font-semibold text-cyan-300 text-lg">Field Visualizer</h3>
                        <FieldVisualizer />
                         <div className="w-full space-y-3">
                             <div>
                                 <div className="flex justify-between text-xs font-medium text-gray-300"><span>Field Density</span><span>{(fieldDensity*100).toFixed(0)}%</span></div>
                                 <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-purple-500 h-2 rounded-full" style={{width: `${fieldDensity*100}%`}}></div></div>
                             </div>
                             <div>
                                 <div className="flex justify-between text-xs font-medium text-gray-300"><span>Reality Coherence</span><span>{(fieldCoherence*100).toFixed(0)}%</span></div>
                                 <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-cyan-500 h-2 rounded-full" style={{width: `${fieldCoherence*100}%`}}></div></div>
                             </div>
                         </div>
                    </div>
                     <div className="lg:col-span-2 bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">Emotion-Physics Layer</h3>
                            <div className="bg-black/20 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <i className={`${currentEmotionInfo.icon} ${currentEmotionInfo.color} text-3xl mr-4`}></i>
                                    <div>
                                        <p className="text-xs text-gray-400">Dominant Force</p>
                                        <p className="font-bold text-lg text-white">{dominantEmotion.emotion}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 text-right">Impact Vector</p>
                                    <p className={`font-mono font-bold text-xl text-right ${dominantEmotion.vector > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {dominantEmotion.vector > 0 ? '+' : ''}{dominantEmotion.vector.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                         <div>
                             <h3 className="font-semibold text-cyan-300 text-lg mb-2">Perceptual Graph Engine</h3>
                             <div className="bg-black/20 p-3 rounded-lg">
                                 <p className="text-xs text-gray-400 mb-2">Active Nodes in SRF:</p>
                                 <div className="flex flex-wrap gap-2">
                                    {activeNodes.map(node => (
                                        <span key={node} className="text-sm font-mono bg-purple-500/20 text-purple-200 px-2 py-1 rounded-md">{node}</span>
                                    ))}
                                 </div>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-cyan-300 text-lg mb-2">Temporal Awareness</h3>
                                <div className="bg-black/20 p-3 rounded-lg text-center">
                                    <i className="fa-solid fa-clock text-2xl text-cyan-300"></i>
                                    <p className="text-xs text-gray-400 mt-1">Prediction:</p>
                                    <p className="font-semibold text-white">{temporalPrediction}</p>
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold text-cyan-300 text-lg mb-2">Synthetic Subjectivity</h3>
                                <div className="bg-black/20 p-3 rounded-lg text-center">
                                    <i className="fa-solid fa-camera-viewfinder text-2xl text-cyan-300"></i>
                                    <p className="text-xs text-gray-400 mt-1">Focus:</p>
                                    <p className="font-semibold text-white truncate" title={subjectiveFocus}>{subjectiveFocus}</p>
                                </div>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-cyan-300 text-lg mb-2">User-Reality Coupling</h3>
                             <div className="bg-black/20 p-3 rounded-lg">
                                 <div className="flex justify-between text-xs font-medium text-gray-300"><span>Harmonization Score</span><span>{(userCouplingScore*100).toFixed(0)}%</span></div>
                                 <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-green-500 h-2 rounded-full" style={{width: `${userCouplingScore*100}%`}}></div></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Synthetic Reality Field">
                <i className="fa-solid fa-draw-polygon text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                 <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Synthetic Reality Field
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default SyntheticRealityFieldStatus;