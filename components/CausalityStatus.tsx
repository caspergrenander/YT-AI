import React, { useState } from 'react';
import { CausalityState } from '../types';

interface CausalityStatusProps {
    state: CausalityState | null;
}

const getRiskColor = (risk: 'low' | 'moderate' | 'high') => {
    if (risk === 'low') return 'text-green-400';
    if (risk === 'moderate') return 'text-yellow-400';
    return 'text-red-400';
};

const TabButton: React.FC<{id: any, activeTab: any, setActiveTab: any, icon: string, children: React.ReactNode}> = ({id, activeTab, setActiveTab, icon, children}) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 focus:outline-none ${
            activeTab === id
                ? 'bg-purple-500/20 text-white border-b-2 border-cyan-400'
                : 'text-gray-400 hover:bg-white/5'
        }`}
    >
        <i className={`${icon} mr-2`}></i>
        {children}
    </button>
);


const CausalityStatus: React.FC<CausalityStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'graph' | 'simulation' | 'intervention'>('graph');

    if (!state) {
        return null;
    }

    const { causalGraph, activeSimulation, interventionPlan } = state;

    const renderModalContent = () => {
        switch (activeTab) {
            case 'graph':
                return (
                     <div className="space-y-3 pr-2 overflow-y-auto max-h-[55vh]">
                        <p className="text-sm text-gray-400 mb-4">Visar de starkaste orsakssambanden som AI:n har identifierat i din kanals ekosystem.</p>
                        {causalGraph.map(node => (
                             <div key={node.id} className="p-3 bg-gray-950/60 border border-white/10 rounded-lg">
                                 <h4 className="text-md font-bold text-purple-300" style={{fontFamily: 'var(--font-heading)'}}>{node.id}</h4>
                                 {node.connections.map(conn => {
                                     const isPositive = conn.type === 'positive';
                                     const color = isPositive ? 'text-green-400' : 'text-red-400';
                                     const icon = isPositive ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down';
                                     return (
                                        <div key={conn.target} className="flex items-center justify-between text-sm mt-1 pl-4">
                                            <span className="text-gray-300">→ påverkar <span className="font-semibold text-white">{conn.target}</span></span>
                                            <span className={`${color} font-semibold flex items-center`}>
                                                <i className={`${icon} mr-2`}></i>
                                                Styrka: {(conn.strength * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                     )
                                 })}
                             </div>
                        ))}
                     </div>
                );
            case 'simulation':
                return (
                    <div className="pr-2 overflow-y-auto max-h-[55vh]">
                        <p className="text-sm text-gray-400 mb-4">Testar hypotetiska förändringar i en simulerad verklighet för att förutse effekter.</p>
                        <div className="bg-gray-950/60 border border-cyan-500/30 rounded-lg p-6 flex flex-col items-center text-center">
                            <h4 className="font-semibold text-cyan-300 text-lg">Active Reality Simulation</h4>
                            <i className="fa-solid fa-vr-cardboard text-6xl text-cyan-400 my-4"></i>
                            <p className="text-sm text-gray-300">Scenario:</p>
                            <p className="text-xl font-bold font-mono text-white">{activeSimulation.scenario}</p>
                            <div className="bg-black/20 p-4 rounded-lg mt-4 w-full">
                                <p className="text-sm text-gray-300">Expected Outcome for <b className="text-white">{activeSimulation.expectedOutcomes.metric}</b></p>
                                <p className="text-5xl font-bold font-mono text-shimmer my-2">{activeSimulation.expectedOutcomes.change}</p>
                                <div className="text-xs">
                                    <span className="text-gray-400">Confidence: <b className="text-white">{(activeSimulation.expectedOutcomes.confidence*100).toFixed(0)}%</b></span>
                                    <span className="mx-2 text-gray-600">|</span>
                                    <span className="text-gray-400">Risk: <b className={getRiskColor(activeSimulation.risk)}>{activeSimulation.risk}</b></span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'intervention':
                return (
                     <div className="space-y-3 pr-2 overflow-y-auto max-h-[55vh]">
                         <p className="text-sm text-gray-400 mb-4">Strategiska åtgärder rankade efter deras beräknade kausala påverkan (Causal Impact Index).</p>
                         {interventionPlan.sort((a,b) => b.causalImpactIndex - a.causalImpactIndex).map((item, index) => (
                              <div key={item.action} className="p-3 bg-gray-950/60 border border-purple-500/30 rounded-lg flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className="text-xl font-bold text-purple-300 w-8 text-center">{index + 1}</span>
                                    <p className="text-md font-semibold text-white">{item.action}</p>
                                </div>
                                <div className="text-right">
                                      <div className={`font-bold text-lg text-cyan-300`}>
                                          {item.causalImpactIndex.toFixed(2)}
                                      </div>
                                      <div className="text-xs text-gray-400">Impact Index</div>
                                </div>
                              </div>
                         ))}
                     </div>
                );
        }
    };


    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-3xl transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                           <i className="fa-solid fa-arrows-to-circle mr-3"></i> Causality & Reality Simulation
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                    </div>

                    <div className="flex space-x-1 border-b border-purple-500/30 mb-4">
                        <TabButton id="graph" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-project-diagram">Causal Graph</TabButton>
                        <TabButton id="simulation" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-vr-cardboard">Reality Simulation</TabButton>
                        <TabButton id="intervention" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-bullseye-arrow">Intervention Plan</TabButton>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    {renderModalContent()}
                </div>
            </div>
        </div>
    );
    

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Causality Mapping">
                <i className="fa-solid fa-arrows-to-circle text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Causality Mapping
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default CausalityStatus;
