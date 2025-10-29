import React, { useState } from 'react';
import { EvolutionLedger } from '../types';

interface EvolutionStatusProps {
    ledger: EvolutionLedger | null;
}

const levelData = [
    { id: "L1", name: "Reactive Analyzer", description: "Reagerar på frågor, gör korrekta analyser.", icon: "fa-solid fa-bolt" },
    { id: "L2", name: "Contextual Thinker", description: "Känner igen mönster i tidigare analyser.", icon: "fa-solid fa-sitemap" },
    { id: "L3", name: "Reflective Strategist", description: "Justerar sina modeller dynamiskt.", icon: "fa-solid fa-lightbulb" },
    { id: "L4", name: "Predictive Partner", description: "Förutser användarens behov, planerar nästa steg.", icon: "fa-solid fa-crystal-ball" },
    { id: "L5", name: "Autonomous Architect", description: "Bygger egna regler för strategiutveckling.", icon: "fa-solid fa-microchip" },
];

const EvolutionStatus: React.FC<EvolutionStatusProps> = ({ ledger }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!ledger) {
        return <div className="w-48"></div>;
    }

    const currentLevelMatch = ledger.level.match(/L(\d)/);
    const currentLevelNumber = currentLevelMatch ? parseInt(currentLevelMatch[1], 10) : 1;
    const progress = Number(ledger.progress_to_next_level ?? 0);
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-2xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-shimmer" style={{fontFamily: 'var(--font-heading)'}}>GPT-5 Evolution Status</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-cyan-300 mb-3">Mognadsnivåer</h3>
                    <div className="flex justify-between items-end space-x-2">
                        {levelData.map((level, index) => {
                            const levelNumber = index + 1;
                            const isAchieved = levelNumber < currentLevelNumber;
                            const isCurrent = levelNumber === currentLevelNumber;

                            return (
                                <div key={level.id} className="text-center flex-1">
                                    <div className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isCurrent ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : ''}
                                        ${isAchieved ? 'border-purple-500 bg-purple-500/20' : 'border-gray-700 bg-gray-800'}`}>
                                        <i className={`${level.icon} text-2xl ${isCurrent ? 'text-cyan-300' : isAchieved ? 'text-purple-400' : 'text-gray-500'}`}></i>
                                        {isAchieved && <i className="fa-solid fa-check absolute -top-1 -right-1 text-green-400 bg-gray-900 rounded-full"></i>}
                                    </div>
                                    <p className={`mt-2 font-semibold text-sm ${isCurrent ? 'text-cyan-300' : isAchieved ? 'text-purple-400' : 'text-gray-500'}`}>{level.id}</p>
                                    <p className="text-xs text-gray-400">{level.name}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-2">Nuvarande Status ({ledger.level})</h3>
                        <p className="text-sm text-gray-400 mb-3">{levelData[currentLevelNumber-1].description}</p>
                        {currentLevelNumber < 5 &&
                            <>
                                <h4 className="text-xs font-bold text-gray-300 uppercase">Framsteg till L{currentLevelNumber + 1}</h4>
                                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                                    <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                </div>
                                <p className="text-right text-xs text-cyan-300 mt-1">{progress}%</p>
                            </>
                        }
                    </div>
                    <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-cyan-300 mb-2">Evolution Ledger</h3>
                        <ul className="text-sm space-y-1 text-gray-300">
                            <li><span className="font-medium text-gray-400 w-40 inline-block">Version:</span> {ledger.version}</li>
                            <li><span className="font-medium text-gray-400 w-40 inline-block">Senaste kalibrering:</span> {new Date(ledger.last_calibration).toLocaleString()}</li>
                            <li><span className="font-medium text-gray-400 w-40 inline-block">Prognos-träffsäkerhet:</span> {(ledger.forecast_accuracy * 100).toFixed(1)}%</li>
                            <li><span className="font-medium text-gray-400 w-40 inline-block">Förstärkta regler:</span> {ledger.recent_reinforcements}</li>
                            <li><span className="font-medium text-gray-400 w-40 inline-block">Utfasade regler:</span> {ledger.deprecated_rules}</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );

    return (
        <div className="w-48 flex justify-end">
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <div className="relative w-10 h-10">
                    <svg className="w-full h-full" viewBox="0 0 50 50">
                        <circle className="text-gray-700" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx="25" cy="25" />
                        <circle
                            className="text-cyan-400"
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="25"
                            cy="25"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-300 font-bold text-sm">
                        L{currentLevelNumber}
                    </div>
                </div>
                <div className="text-left">
                    <p className="font-semibold text-sm text-white">Evolution Status</p>
                    <p className="text-xs text-gray-400">{ledger.level.split(' - ')[1]}</p>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Klicka för detaljer
                </div>
            </button>
            {isModalOpen && renderModal()}
        </div>
    );
};

export default EvolutionStatus;