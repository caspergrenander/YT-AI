import React, { useState } from 'react';
import { AdaptiveCreativityState } from '../types';

interface AdaptiveCreativityStatusProps {
    state: AdaptiveCreativityState | null;
}

const zoneInfo: { [key in AdaptiveCreativityState['activeCreativeZone']]: { icon: string; color: string; description: string; } } = {
    'Strategic': { icon: 'fa-solid fa-chess-queen', color: 'text-purple-400', description: 'Skapar format för att maximera kanalens tillväxt.' },
    'Aesthetic': { icon: 'fa-solid fa-palette', color: 'text-rose-400', description: 'Utvecklar ny visuell stil, rytm och känsla.' },
    'Narrative': { icon: 'fa-solid fa-book-open', color: 'text-amber-400', description: 'Bygger mikro-berättelser och emotionella bågar.' },
    'Systemic': { icon: 'fa-solid fa-cogs', color: 'text-cyan-400', description: 'Förbättrar processer och arbetsflöden.' },
};

const IntegrityCheckBar: React.FC<{ label: string; value: number; }> = ({ label, value }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-0.5">
            <span className="font-medium text-gray-300">{label}</span>
            <span className="font-mono text-white">{(value * 100).toFixed(0)}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full" style={{ width: `${value * 100}%` }}></div>
        </div>
    </div>
);

const AdaptiveCreativityStatus: React.FC<AdaptiveCreativityStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { activeCreativeZone, creativeIntegrityCheck, inspirationMatrix, controlledChaosLevel, latestConcept } = state;
    const currentZoneInfo = zoneInfo[activeCreativeZone];

    const riskColor = {
        low: 'text-green-400',
        medium: 'text-yellow-400',
        high: 'text-red-400',
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-wand-magic-sparkles mr-3"></i>
                        Adaptive Creativity & Generative Thinking
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Active Creative Zone</h3>
                        <i className={`${currentZoneInfo.icon} ${currentZoneInfo.color} text-6xl`}></i>
                        <p className="text-2xl font-bold text-white mt-3">{activeCreativeZone}</p>
                        <p className="text-sm text-gray-400 text-center mt-1">{currentZoneInfo.description}</p>
                    </div>
                     <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Creative Integrity Check</h3>
                        <div className="space-y-4">
                            <IntegrityCheckBar label="Novelty Score" value={creativeIntegrityCheck.noveltyScore} />
                            <IntegrityCheckBar label="Brand Alignment" value={creativeIntegrityCheck.brandAlignment} />
                            <IntegrityCheckBar label="Emotional Resonance" value={creativeIntegrityCheck.emotionalResonance} />
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-medium text-gray-300 text-xs">Calculated Risk Level</span>
                                <span className={`font-bold text-sm px-2 py-0.5 rounded-full capitalize ${riskColor[creativeIntegrityCheck.riskLevel].replace('text-', 'bg-').replace('-400', '-500/20')} ${riskColor[creativeIntegrityCheck.riskLevel]}`}>
                                    {creativeIntegrityCheck.riskLevel}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10 mt-6">
                    <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Generative Core</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded-md">
                            <p className="text-sm font-medium text-gray-300 mb-2">Inspiration Matrix:</p>
                            <div className="text-xs space-y-1">
                                <p><b className="text-purple-300 w-16 inline-block">Theme:</b> {inspirationMatrix.theme}</p>
                                <p><b className="text-purple-300 w-16 inline-block">Trend:</b> {inspirationMatrix.trend}</p>
                                <p><b className="text-purple-300 w-16 inline-block">Emotion:</b> {inspirationMatrix.emotion}</p>
                            </div>
                             <div className="text-xs mt-2 flex items-center">
                                <span className="font-medium text-gray-300 mr-2">Controlled Chaos:</span>
                                <div className="w-16 h-1.5 bg-gray-700 rounded-full"><div className="bg-rose-500 h-1.5 rounded-full" style={{width: `${controlledChaosLevel*1000}%`}}></div></div>
                            </div>
                        </div>
                        <div className="bg-black/20 p-3 rounded-md">
                             <p className="text-sm font-medium text-gray-300 mb-2">Latest Concept Synthesized:</p>
                             <p className="text-sm font-semibold text-cyan-200">{latestConcept}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Adaptive Creativity: ${activeCreativeZone} Zone`}>
                <i className="fa-solid fa-wand-magic-sparkles text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Adaptive Creativity
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default AdaptiveCreativityStatus;