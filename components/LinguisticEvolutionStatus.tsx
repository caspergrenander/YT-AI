import React, { useState } from 'react';
import { LinguisticEvolutionState } from '../types';

interface LinguisticEvolutionStatusProps {
    state: LinguisticEvolutionState | null;
}

const syntaxInfo: { [key in LinguisticEvolutionState['activeSyntax']]: { icon: string; color: string; description: string; } } = {
    'Sharp': { icon: 'fa-solid fa-bolt', color: 'text-rose-400', description: 'Kompakt, effektiv, datadriven.' },
    'Flow': { icon: 'fa-solid fa-water', color: 'text-cyan-400', description: 'Mjuk, naturlig, konverserande.' },
    'Pulse': { icon: 'fa-solid fa-waveform-lines', color: 'text-purple-400', description: 'Dynamisk, rytmisk, narrativ.' },
};

const LinguisticEvolutionStatus: React.FC<LinguisticEvolutionStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { flowIndex, activeSyntax, lexiconDelta, temporalDecayExamples } = state;
    const currentSyntaxInfo = syntaxInfo[activeSyntax];

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-dna mr-3"></i>
                        Linguistic Evolution & Semantic Precision
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-6">
                        <div>
                            <h3 className="font-semibold text-cyan-300 text-lg text-center">Syntactic Flow Index</h3>
                             <p className="text-5xl font-bold font-mono text-shimmer my-2 text-center">{flowIndex.toFixed(2)}</p>
                            <p className="text-xs text-gray-400 text-center">Mäter språkets rytm och flyt. <br/> (0.4=Teknisk, 0.8=Narrativ)</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-cyan-300 text-lg text-center">Active Syntax Core</h3>
                             <div className="flex flex-col items-center bg-black/20 p-3 rounded-md mt-2 border-l-4" style={{borderColor: `var(--tw-color-${currentSyntaxInfo.color.split('-')[1]}-400)`}}>
                                <i className={`${currentSyntaxInfo.icon} ${currentSyntaxInfo.color} text-3xl`}></i>
                                <p className="font-bold text-white text-lg mt-1">{activeSyntax}</p>
                                <p className="text-xs text-gray-400">{currentSyntaxInfo.description}</p>
                            </div>
                        </div>
                    </div>
                     <div className="lg:col-span-2 bg-gray-950/50 p-6 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-4 text-lg">Lexicon Delta Table (Semantic Charge)</h3>
                        <div className="space-y-3">
                            {lexiconDelta.map(item => (
                                <div key={item.word} className="bg-black/20 p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-lg text-purple-300">{item.word}</span>
                                        <span className="font-mono font-bold text-xl text-white">{(item.currentCharge * 100).toFixed(0)}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                        <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full" style={{width: `${item.currentCharge * 100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10 mt-6">
                    <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Temporal Semantics (T-Sense)</h3>
                     <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {temporalDecayExamples.map(item => (
                            <div key={item.word} className="flex justify-between items-center border-b border-white/10 pb-1">
                                <span className="font-mono text-gray-300">{item.word}</span>
                                <span className={`${item.decayRate > 0.7 ? 'text-red-400' : 'text-green-400'}`}>
                                    Decay Rate: {item.decayRate.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Linguistic Evolution: ${activeSyntax} Syntax`}>
                <i className="fa-solid fa-language text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Linguistic Evolution
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default LinguisticEvolutionStatus;