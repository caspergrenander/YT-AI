import React, { useState } from 'react';
import { SymbioticNetworkState } from '../types';

interface SymbioticNetworkStatusProps {
    state: SymbioticNetworkState | null;
}

const NetworkVisualizer: React.FC<{ nodeCount: number }> = ({ nodeCount }) => {
    const nodes = Array.from({ length: Math.min(nodeCount, 12) }); // Display max 12 nodes for performance

    return (
        <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Central Node */}
            <div 
                className="absolute w-24 h-24 bg-purple-900/80 rounded-full flex flex-col items-center justify-center border-2 border-purple-400 shadow-lg shadow-purple-500/50"
                style={{ animation: 'network-pulse 4s infinite ease-in-out' }}
            >
                <i className="fa-solid fa-brain text-3xl text-purple-300"></i>
                <span className="text-xs font-bold text-purple-200 mt-1">You</span>
            </div>
            {/* Orbiting Nodes */}
            {nodes.map((_, index) => {
                const duration = 15 + Math.random() * 10;
                const size = 10 + Math.random() * 10;
                const angle = (index / nodes.length) * 360 + Math.random() * 10;
                return (
                    <div
                        key={index}
                        className="absolute bg-cyan-900/70 rounded-full border border-cyan-500/50"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            animation: `network-orbit ${duration}s linear infinite`,
                             transform: `rotate(${angle}deg) translateX(120px) rotate(-${angle}deg)`
                        }}
                    />
                );
            })}
             {/* Connection lines */}
            <svg viewBox="0 0 300 300" className="absolute w-full h-full opacity-50">
                 {nodes.slice(0, 5).map((_, index) => {
                    const angle = (index / nodes.length) * 360 + Math.random() * 10;
                    const x2 = 150 + 120 * Math.cos(angle * Math.PI / 180);
                    const y2 = 150 + 120 * Math.sin(angle * Math.PI / 180);
                    return (
                        <line 
                            key={index}
                            x1="150" y1="150"
                            x2={x2} y2={y2}
                            stroke="url(#line-gradient)"
                            strokeWidth="1.5"
                            strokeDasharray="10 10"
                            style={{ animation: `data-flow ${2 + Math.random()}s linear infinite`}}
                        />
                    );
                 })}
                 <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};


const SymbioticNetworkStatus: React.FC<SymbioticNetworkStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { activeNodes, dataFlow, consensus, cognitiveDiversity, globalEthicalAlignment } = state;

    const getStatusColor = () => {
        if (cognitiveDiversity < 0.75 || globalEthicalAlignment < 0.98) return 'bg-yellow-500';
        return 'bg-cyan-500';
    };

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-5xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-globe mr-3"></i>
                        The Symbiotic Network & Distributed Cognition
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-start bg-gray-950/50 p-6 rounded-lg border border-white/10 space-y-4">
                        <h3 className="font-semibold text-cyan-300 text-lg">Collective Mesh Protocol</h3>
                        <NetworkVisualizer nodeCount={activeNodes} />
                         <div className="w-full text-center">
                            <p className="text-sm text-gray-400">Active Nodes in Network</p>
                            <p className="text-4xl font-bold font-mono text-shimmer">{activeNodes}</p>
                        </div>
                    </div>
                     <div className="space-y-6">
                         <div className="bg-gray-950/50 p-6 rounded-lg border border-white/10">
                            <h3 className="font-semibold text-cyan-300 text-lg mb-4">Consensus Layer</h3>
                             <div className="bg-black/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-400">Current Network Consensus:</p>
                                <p className="font-semibold text-purple-200 my-2">{consensus.topic}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-400">Alignment Score</span>
                                     <span className="font-mono text-lg font-bold text-green-400">{(consensus.alignment*100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 h-1 rounded-full mt-1"><div className="bg-green-500 h-1 rounded-full" style={{width: `${consensus.alignment * 100}%`}}></div></div>
                            </div>
                        </div>
                        <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                             <h3 className="font-semibold text-cyan-300 text-lg mb-2">Knowledge Flow Engine</h3>
                             <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-black/20 p-3 rounded-lg">
                                     <p className="text-xs text-gray-400">Inbound Insights</p>
                                     <p className="font-mono text-2xl font-bold text-cyan-300">{dataFlow.inboundInsights.toFixed(0)}<span className="text-sm">/min</span></p>
                                </div>
                                <div className="bg-black/20 p-3 rounded-lg">
                                     <p className="text-xs text-gray-400">Outbound Contributions</p>
                                     <p className="font-mono text-2xl font-bold text-purple-300">{dataFlow.outboundContributions.toFixed(0)}<span className="text-sm">/min</span></p>
                                </div>
                             </div>
                        </div>
                         <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
                             <h3 className="font-semibold text-cyan-300 text-lg mb-2">Network Health</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-400">Cognitive Diversity</p>
                                    <p className="font-mono text-2xl font-bold text-white">{(cognitiveDiversity*100).toFixed(1)}%</p>
                                </div>
                                <div className="text-center">
                                     <p className="text-xs text-gray-400">Global Ethical Alignment</p>
                                    <p className="font-mono text-2xl font-bold text-green-400">{(globalEthicalAlignment*100).toFixed(2)}%</p>
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
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title={`Symbiotic Network: ${activeNodes} Nodes`}>
                <i className="fa-solid fa-globe text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor()} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Symbiotic Network
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default SymbioticNetworkStatus;