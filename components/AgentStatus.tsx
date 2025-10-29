import React, { useState, useMemo } from 'react';
import { Agent } from '../types';

interface AgentStatusProps {
    agents: Agent[];
}

const agentVisuals: { [key in Agent['name']]: { icon: string; color: string; accent: string; } } = {
    'Strategic Planner': { icon: 'fa-solid fa-compass', color: 'text-purple-400', accent: 'border-purple-500/50' },
    'Algorithmic Intelligence': { icon: 'fa-solid fa-robot', color: 'text-rose-400', accent: 'border-rose-500/50' },
    'Multimodal Analyst': { icon: 'fa-solid fa-film', color: 'text-amber-400', accent: 'border-amber-500/50' },
    'Performance Auditor': { icon: 'fa-solid fa-crystal-ball', color: 'text-cyan-400', accent: 'border-cyan-500/50' },
    'Coordinator (Core)': { icon: 'fa-solid fa-atom', color: 'text-white', accent: 'border-white/50' },
};

const statusVisuals: { [key in Agent['status']]: { text: string; color: string; } } = {
    Online: { text: 'Online', color: 'bg-green-500' },
    Processing: { text: 'Processing', color: 'bg-blue-500' },
    Idle: { text: 'Idle', color: 'bg-gray-500' },
    Degraded: { text: 'Degraded', color: 'bg-yellow-500' },
    Disabled: { text: 'Disabled', color: 'bg-red-500' },
};

const ProgressBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-0.5">
            <span className="font-medium text-gray-300">{label}</span>
            <span className="font-mono text-gray-400">{(value * 100).toFixed(0)}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value * 100}%` }}></div>
        </div>
    </div>
);

const AgentCard: React.FC<{ agent: Agent, isEnabled: boolean, onToggle: () => void }> = ({ agent, isEnabled, onToggle }) => {
    const visuals = agentVisuals[agent.name];
    const status = isEnabled ? agent.status : 'Disabled';
    const statusInfo = statusVisuals[status];
    
    const totalReputation = useMemo(() => {
        const { precision, relevance, ethical } = agent.reputation;
        return (precision * 0.5 + relevance * 0.3 + ethical * 0.2) * 100;
    }, [agent.reputation]);

    return (
        <div className={`bg-gray-950/70 border ${visuals.accent} rounded-xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <i className={`${visuals.icon} ${visuals.color} text-xl mr-3`}></i>
                    <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{agent.name}</h3>
                </div>
                <div title={statusInfo.text} className="flex items-center space-x-2 text-xs font-semibold">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} animate-pulse`} style={{ animationDuration: status === 'Processing' ? '1s' : '2.5s' }}></div>
                    <span className="text-gray-300">{statusInfo.text}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center col-span-1">
                    <div className="text-3xl font-bold text-shimmer">{totalReputation.toFixed(1)}</div>
                    <div className="text-xs text-gray-400 uppercase">Reputation</div>
                </div>
                <div className="col-span-2 space-y-2">
                    <ProgressBar label="Precision" value={agent.reputation.precision} color="bg-cyan-400" />
                    <ProgressBar label="Relevance" value={agent.reputation.relevance} color="bg-purple-400" />
                    <ProgressBar label="Ethical" value={agent.reputation.ethical} color="bg-green-400" />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center text-xs mb-0.5">
                    <span className="font-medium text-gray-300">System Load</span>
                    <span className="font-mono text-gray-400">{agent.load}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full" style={{ width: `${agent.load}%` }}></div>
                </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <label htmlFor={`toggle-${agent.id}`} className="text-sm text-gray-300 font-medium">Human Control</label>
                <button
                    id={`toggle-${agent.id}`}
                    onClick={onToggle}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${isEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
    );
};

const AgentStatus: React.FC<AgentStatusProps> = ({ agents }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [enabledAgents, setEnabledAgents] = useState<Record<string, boolean>>(() => 
        agents.reduce((acc, agent) => ({ ...acc, [agent.id]: agent.status !== 'Disabled' }), {})
    );

    const handleToggle = (agentId: string) => {
        setEnabledAgents(prev => ({ ...prev, [agentId]: !prev[agentId] }));
    };

    if (!agents || agents.length === 0) {
        return null;
    }

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-4xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-network-wired mr-3"></i>
                        Multi-Agent Ecosystem Status
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map(agent => (
                        <AgentCard 
                            key={agent.id} 
                            agent={agent}
                            isEnabled={enabledAgents[agent.id] ?? true}
                            onToggle={() => handleToggle(agent.id)}
                        />
                    ))}
                </div>
                <p className="text-center mt-6 text-xs text-gray-500">
                    Agent reputation and status are updated in real-time based on performance and consensus.
                </p>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Multi-Agent Ecosystem Status">
                <i className="fa-solid fa-network-wired text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Agent Status
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default AgentStatus;
