import React, { useState } from 'react';
import { EthicalCoreState } from '../types';

interface GovernanceStatusProps {
    state: EthicalCoreState | null;
}

const coreValues = [
    { name: "Truth First", description: "Fakta går före popularitet.", icon: "fa-solid fa-check-double" },
    { name: "Respect Over Reach", description: "Ingen exploatering av känslor för klick.", icon: "fa-solid fa-heart" },
    { name: "Informed Consent", description: "All analys sker med tydlig förklaring.", icon: "fa-solid fa-circle-info" },
    { name: "Human Dignity", description: "Ingen förminskning av individer.", icon: "fa-solid fa-user-shield" },
    { name: "Transparency", description: "AI:n kan visa varför den tror något.", icon: "fa-solid fa-eye" },
];

const TrustIndexGauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score * circumference;
    
    let colorClass = 'text-green-400';
    let label = 'Hög Tillit';
    if (score < 0.7) {
        colorClass = 'text-red-400';
        label = 'Låg Tillit';
    } else if (score < 0.85) {
        colorClass = 'text-yellow-400';
        label = 'Medelhög Tillit';
    }

    return (
        <div className="relative flex flex-col items-center">
            <svg className="w-48 h-48" viewBox="0 0 90 90">
                <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="45" cy="45" />
                <circle
                    className={`${colorClass} transition-all duration-500`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="45"
                    cy="45"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-4xl font-bold fill-current text-white font-mono">
                    {(score * 100).toFixed(0)}
                </text>
            </svg>
            <p className={`mt-2 font-semibold text-xl ${colorClass}`}>{label}</p>
        </div>
    );
};

const GovernanceStatus: React.FC<GovernanceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ethicalProfile, setEthicalProfile] = useState(80); // 80% creative freedom

    if (!state) {
        return null;
    }

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-gavel mr-3"></i>
                        Ethical Alignment & Trust Core
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Trust Index & Core Values */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10 flex flex-col items-center">
                             <h3 className="font-semibold text-cyan-300 mb-2 text-lg">Trust Index</h3>
                            <TrustIndexGauge score={state.trustIndex} />
                        </div>
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Core Values</h3>
                            <ul className="space-y-2">
                                {coreValues.map(v => (
                                    <li key={v.name} className="flex items-center text-sm" title={v.description}>
                                        <i className={`${v.icon} w-6 text-center text-purple-400`}></i>
                                        <span className="text-gray-200">{v.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    {/* Right Column: Filters, Audit, and Controls */}
                    <div className="lg:col-span-2 space-y-6">
                         <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Decision Filters</h3>
                            <div className="flex flex-wrap gap-3">
                                {state.activeFilters.map(filter => (
                                    <div key={filter} className="flex items-center text-sm py-1.5 px-3 bg-green-500/10 text-green-300 border border-green-500/20 rounded-full">
                                        <i className="fa-solid fa-check-circle mr-2"></i>
                                        <span>{filter}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                         <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Last Ethical Audit</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-white">{new Date(state.lastAudit.date).toLocaleDateString('sv-SE')}</p>
                                    <p className="text-xs text-gray-400">Date</p>
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${state.lastAudit.issuesFound > 0 ? 'text-red-400' : 'text-green-400'}`}>{state.lastAudit.issuesFound}</p>
                                    <p className="text-xs text-gray-400">Issues Found</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-cyan-300">{(state.lastAudit.integrityScore * 100).toFixed(1)}%</p>
                                    <p className="text-xs text-gray-400">Integrity Score</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 mb-3 text-lg">Human-in-the-Loop: Ethical Profile</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-purple-300">Kommersiell Bias</span>
                                    <span className="text-cyan-300">Kreativ Frihet</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={ethicalProfile}
                                    onChange={(e) => setEthicalProfile(parseInt(e.target.value, 10))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                                    style={{
                                        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${100 - ethicalProfile}%, #22d3ee ${100 - ethicalProfile}%, #22d3ee 100%)`
                                    }}
                                />
                                <div className="text-center text-xs text-gray-400">
                                    Balanserar AI:ns rekommendationer mellan kommersiella mål och kreativ integritet.
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
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Ethical Alignment & Trust">
                <i className="fa-solid fa-gavel text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${state.trustIndex > 0.85 ? 'bg-green-400' : 'bg-yellow-400'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${state.trustIndex > 0.85 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    </span>
                </div>
                 <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Ethical Alignment
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default GovernanceStatus;
