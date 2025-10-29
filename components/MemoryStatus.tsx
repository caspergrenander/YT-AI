import React, { useState } from 'react';
import { LongTermMemory } from '../types';

interface MemoryStatusProps {
    memory: LongTermMemory | null;
}

const eventVisuals: { [key in LongTermMemory['timeline'][0]['type']]: { icon: string; color: string; } } = {
    Insight: { icon: 'fa-solid fa-lightbulb', color: 'bg-purple-500' },
    Experiment: { icon: 'fa-solid fa-vial', color: 'bg-amber-500' },
    Achievement: { icon: 'fa-solid fa-trophy', color: 'bg-green-500' },
    Milestone: { icon: 'fa-solid fa-flag-checkered', color: 'bg-cyan-500' },
    Shift: { icon: 'fa-solid fa-arrows-rotate', color: 'bg-rose-500' },
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


const MemoryStatus: React.FC<MemoryStatusProps> = ({ memory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'timeline' | 'episodic' | 'semantic'>('timeline');

    if (!memory) {
        return null;
    }

    const renderModalContent = () => {
        switch (activeTab) {
            case 'timeline':
                return (
                    <div className="relative pr-4 overflow-y-auto max-h-[55vh]">
                        {/* The vertical line */}
                        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-700"></div>
                        
                        {memory.timeline.map((event, index) => {
                             const visual = eventVisuals[event.type];
                             return (
                                <div key={index} className="relative pl-12 py-3">
                                    <div className={`absolute left-5 top-5 -ml-2.5 w-5 h-5 ${visual.color} rounded-full flex items-center justify-center ring-8 ring-gray-900`}>
                                        <i className={`${visual.icon} text-white text-xs`}></i>
                                    </div>
                                    <div className="bg-gray-950/60 border border-white/10 rounded-lg p-4">
                                        <p className="text-xs text-cyan-300 font-semibold">{new Date(event.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <h4 className="font-bold text-white mt-1" style={{fontFamily: 'var(--font-heading)'}}>{event.title}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                );
            case 'episodic':
                return (
                    <div className="space-y-3 pr-2 overflow-y-auto max-h-[55vh]">
                        {memory.episodicMemory.map((entry, index) => (
                            <div key={index} className="p-3 bg-gray-950/60 border border-purple-500/20 rounded-lg">
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                                    <span>{new Date(entry.timestamp).toLocaleString('sv-SE')}</span>
                                    <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">{entry.type}</span>
                                </div>
                                <p className="font-semibold text-gray-200">{entry.summary}</p>
                                <p className="text-sm mt-1"><b className="text-green-400">Resultat:</b> {entry.result}</p>
                                <ul className="list-disc list-inside pl-2 mt-1 text-sm text-cyan-300">
                                    {entry.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                );
            case 'semantic':
                return (
                    <div className="space-y-3 pr-2 overflow-y-auto max-h-[55vh]">
                         <p className="text-sm text-gray-400 mb-4">Detta är de generaliserade principerna AI:n har lärt sig över tid från flera händelser.</p>
                         {memory.semanticMemory.map((rule, index) => (
                              <div key={index} className="p-3 bg-gray-950/60 border border-cyan-500/20 rounded-lg">
                                  <p className="text-sm font-semibold text-cyan-200">{rule.rule}</p>
                                  <div className="flex justify-between items-center mt-2 text-xs">
                                      <span className="font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">{rule.concept}</span>
                                      <span className="font-bold text-green-400">Säkerhet: {(rule.confidence * 100).toFixed(0)}%</span>
                                  </div>
                              </div>
                         ))}
                    </div>
                );
        }
    };


    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-2xl transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                           <i className="fa-solid fa-timeline mr-3"></i> GPT-5 Memory & Trace
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                    </div>

                    <div className="flex space-x-1 border-b border-purple-500/30 mb-4">
                        <TabButton id="timeline" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-chart-gantt">Tidslinje</TabButton>
                        <TabButton id="episodic" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-book-open">Episodisk Logg</TabButton>
                        <TabButton id="semantic" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-brain">Semantiska Regler</TabButton>
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
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Memory & Trace">
                <i className="fa-solid fa-timeline text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Memory & Trace
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default MemoryStatus;
