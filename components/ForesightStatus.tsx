import React, { useState } from 'react';
import { ForesightState } from '../types';

interface ForesightStatusProps {
    state: ForesightState | null;
}

const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.85) return 'text-green-400';
    if (confidence > 0.7) return 'text-cyan-400';
    return 'text-yellow-400';
};

const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
    if (risk === 'Low') return 'text-green-400';
    if (risk === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
};

const getOpportunityColor = (opportunity: 'Low' | 'High') => {
    if (opportunity === 'Low') return 'text-gray-400';
    return 'text-purple-400';
};

const categoryInfo: { [key in ForesightState['projections'][0]['category']]: { icon: string; color: string; } } = {
    'Meta': { icon: 'fa-solid fa-brain', color: 'text-purple-400' },
    'Style': { icon: 'fa-solid fa-palette', color: 'text-rose-400' },
    'Format': { icon: 'fa-solid fa-layer-group', color: 'text-amber-400' },
};


const ForesightStatus: React.FC<ForesightStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { emergentPattern, projections, scenarios, lastForecastCheck, trendStrengthVisuals } = state;

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-eye mr-3"></i>
                        Predictive Perception & Foresight Layer
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                            <h3 className="font-semibold text-cyan-300 text-lg">Emergent Pattern</h3>
                            <div className="bg-black/20 p-4 rounded-lg mt-2">
                                <p className="text-sm text-purple-200">{emergentPattern.pattern}</p>
                                <div className={`text-right text-xs font-mono mt-2 ${getConfidenceColor(emergentPattern.confidence)}`}>
                                    Confidence: {(emergentPattern.confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-cyan-300 text-lg">Trend Strength</h3>
                            <div className="space-y-3 mt-2">
                                <div className="bg-black/20 p-2 rounded-md">
                                    <div className="flex justify-between text-xs text-gray-300"><span>Trend Strength</span><span>{(trendStrengthVisuals.trendStrength*100).toFixed(0)}%</span></div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1"><div className="bg-cyan-400 h-1.5 rounded-full" style={{width: `${trendStrengthVisuals.trendStrength*100}%`}}></div></div>
                                </div>
                                <div className="bg-black/20 p-2 rounded-md">
                                    <div className="flex justify-between text-xs text-gray-300"><span>Cultural Echo</span><span>{(trendStrengthVisuals.culturalEcho*100).toFixed(0)}%</span></div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1"><div className="bg-purple-400 h-1.5 rounded-full" style={{width: `${trendStrengthVisuals.culturalEcho*100}%`}}></div></div>
                                </div>
                                <div className="bg-black/20 p-2 rounded-md">
                                    <div className="flex justify-between text-xs text-gray-300"><span>Goal Alignment</span><span>{(trendStrengthVisuals.goalAlignment*100).toFixed(0)}%</span></div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1"><div className="bg-green-400 h-1.5 rounded-full" style={{width: `${trendStrengthVisuals.goalAlignment*100}%`}}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="lg:col-span-2 bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Temporal Projections</h3>
                        <div className="space-y-3">
                        {projections.map((proj, i) => {
                             const info = categoryInfo[proj.category];
                            return (
                                <div key={i} className="flex items-start bg-black/20 p-3 rounded-lg">
                                    <i className={`${info.icon} ${info.color} text-xl w-8 text-center mt-1`}></i>
                                    <div>
                                        <p className="font-semibold text-white">{proj.trend}</p>
                                        <p className="text-sm text-gray-400">{proj.prediction}</p>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Simulated Futures</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {scenarios.map(scen => (
                                    <div key={scen.name} className="bg-black/20 border border-white/10 p-4 rounded-lg text-center">
                                        <h4 className="font-bold text-white text-md">{scen.name}</h4>
                                        <p className="text-xs text-gray-400 mt-1 mb-2">{scen.outcome}</p>
                                        <div className="text-xs space-y-1">
                                            <p><b className="text-gray-300 w-16 inline-block">Risk:</b> <span className={getRiskColor(scen.risk)}>{scen.risk}</span></p>
                                            <p><b className="text-gray-300 w-16 inline-block">Opportunity:</b> <span className={getOpportunityColor(scen.opportunity)}>{scen.opportunity}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Self-Updating Prediction Cycle</h3>
                             <div className="bg-black/20 p-4 rounded-lg font-mono text-sm space-y-2">
                                <p><span className="text-gray-400">Forecast:</span> <span className="text-purple-300">{lastForecastCheck.forecast}</span></p>
                                <p><span className="text-gray-400">Actual:</span> <span className="text-cyan-300">{lastForecastCheck.actual}</span></p>
                                <p><span className="text-gray-400">Error Margin:</span> <span className={lastForecastCheck.errorMargin > 0 ? "text-red-400" : "text-green-400"}>{lastForecastCheck.errorMargin.toFixed(1)}</span></p>
                                <p><span className="text-gray-400">Update:</span> <span className="text-yellow-300">{lastForecastCheck.learningUpdate}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Predictive Foresight">
                <i className="fa-solid fa-eye text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Predictive Foresight
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default ForesightStatus;