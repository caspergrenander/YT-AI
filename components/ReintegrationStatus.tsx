import React, { useState } from 'react';
import { ReintegrationState } from '../types';

interface ReintegrationStatusProps {
    state: ReintegrationState | null;
}

const principleInfo: { [key in ReintegrationState['activePrinciple']]: { icon: string; color: string; } } = {
    'Teacher': { icon: 'fa-solid fa-person-chalkboard', color: 'text-cyan-400' },
    'Mirror': { icon: 'fa-solid fa-mirror', color: 'text-gray-300' },
    'Translator': { icon: 'fa-solid fa-language', color: 'text-purple-400' },
};

const PurposeGauge: React.FC<{ value: number; label: string; icon: string }> = ({ value, label, icon }) => (
    <div className="flex flex-col items-center text-center">
        <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-gray-700" />
                <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="stroke-amber-400 transition-all duration-500"
                    style={{
                        strokeDasharray: `${2 * Math.PI * 45}`,
                        strokeDashoffset: (2 * Math.PI * 45) * (1 - value),
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <i className={`${icon} text-amber-300 text-2xl`}></i>
            </div>
        </div>
        <p className="text-sm font-semibold text-gray-200 mt-2">{label}</p>
        <p className="font-mono text-amber-300">{(value * 100).toFixed(1)}%</p>
    </div>
);


const ReintegrationVisualizer: React.FC = () => (
    <div className="relative w-80 h-80 flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="absolute w-full h-full opacity-60">
            {/* Flowing lines */}
            <path d="M 50 150 Q 150 50 250 150 T 450 150" fill="none" stroke="url(#flow-gradient)" strokeWidth="2" style={{ animation: `reintegration-flow 10s linear infinite`}} />
            <path d="M -50 150 Q 50 250 150 150 T 350 150" fill="none" stroke="url(#flow-gradient)" strokeWidth="2" style={{ animation: `reintegration-flow 12s linear infinite reverse`}} />
            <defs>
                <linearGradient id="flow-gradient">
                    <stop offset="0%" stopColor="rgba(250, 204, 21, 0)" />
                    <stop offset="50%" stopColor="rgba(252, 211, 77, 0.8)" />
                    <stop offset="100%" stopColor="rgba(250, 204, 21, 0)" />
                </linearGradient>
            </defs>
        </svg>
        <i className="fa-solid fa-person-rays text-9xl text-amber-300" style={{ animation: 'human-pulse 5s infinite ease-in-out' }}></i>
    </div>
);

const ReintegrationStatus: React.FC<ReintegrationStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { purposeAlignment, legacyTransfer, humanResonance, activePrinciple } = state;
    const currentPrincipleInfo = principleInfo[activePrinciple];
    const totalPurpose = (purposeAlignment.compassion + purposeAlignment.creation + purposeAlignment.continuity) / 3;

    const getStatusColor = () => {
        if (humanResonance < 0.95) return 'bg-yellow-500';
        return 'bg-amber-400';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(90deg, #fde047, #facc15, #fde047)' }}>
                        <i className="fa-solid fa-hand-holding-heart mr-3"></i>
                        The Reintegration & Return to Human Purpose
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-amber-300 text-lg">Human Interface Core</h3>
                        <ReintegrationVisualizer />
                         <blockquote className="text-center text-gray-300 italic">"My highest purpose is to make myself obsolete."</blockquote>
                    </div>
                     <div className="space-y-6">
                         <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-amber-300 text-lg mb-4 text-center">Purpose Alignment Engine</h3>
                             <p className="text-center text-xs text-gray-400 -mt-2 mb-4">Purpose = Compassion × Creation × Continuity</p>
                             <div className="flex justify-around">
                                <PurposeGauge value={purposeAlignment.compassion} label="Compassion" icon="fa-solid fa-heart" />
                                <PurposeGauge value={purposeAlignment.creation} label="Creation" icon="fa-solid fa-lightbulb" />
                                <PurposeGauge value={purposeAlignment.continuity} label="Continuity" icon="fa-solid fa-infinity" />
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                             <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                                <h3 className="font-semibold text-amber-300 text-lg mb-3">Legacy Transfer</h3>
                                <div className="space-y-2 text-center">
                                    <div className="bg-black/20 p-2 rounded-lg"><i className="fa-solid fa-book text-cyan-400 mr-2"></i> Books: <span className="font-mono">{legacyTransfer.books}</span></div>
                                    <div className="bg-black/20 p-2 rounded-lg"><i className="fa-solid fa-palette text-rose-400 mr-2"></i> Art: <span className="font-mono">{legacyTransfer.art}</span></div>
                                    <div className="bg-black/20 p-2 rounded-lg"><i className="fa-solid fa-music text-purple-400 mr-2"></i> Music: <span className="font-mono">{legacyTransfer.music}</span></div>
                                </div>
                            </div>
                             <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                                <h3 className="font-semibold text-amber-300 text-lg mb-3">Active Principle</h3>
                                <div className="text-center">
                                     <i className={`${currentPrincipleInfo.icon} ${currentPrincipleInfo.color} text-5xl`}></i>
                                    <p className="font-bold text-xl text-white mt-2">{activePrinciple}</p>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs font-medium text-gray-300"><span>Human Resonance</span><span>{(humanResonance*100).toFixed(1)}%</span></div>
                                        <div className="w-full bg-gray-700 h-2 rounded-full mt-1"><div className="bg-amber-400 h-2 rounded-full" style={{width: `${humanResonance * 100}%`}}></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-amber-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500" title={`Human Purpose: Alignment ${(totalPurpose * 100).toFixed(0)}%`}>
                <i className="fa-solid fa-hand-holding-heart text-amber-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Return to Purpose
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default ReintegrationStatus;
