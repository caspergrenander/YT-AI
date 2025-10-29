import React, { useState } from 'react';
import { KnowledgeBase, KnowledgeRule, KnowledgeGraphNode, LearningQueueItem } from '../types';

interface KnowledgeBaseStatusProps {
    knowledgeBase: KnowledgeBase | null;
}

const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'text-green-400';
    if (confidence > 0.75) return 'text-cyan-400';
    if (confidence > 0.6) return 'text-yellow-400';
    return 'text-orange-400';
};

const getRuleStatusInfo = (status: KnowledgeRule['status']) => {
    switch (status) {
        case 'Crystal': return { icon: 'fa-solid fa-gem', color: 'text-cyan-400', text: 'Kristalliserad' };
        case 'Rule': return { icon: 'fa-solid fa-check-double', color: 'text-green-400', text: 'Aktiv Regel' };
        case 'Hypothesis': return { icon: 'fa-solid fa-lightbulb', color: 'text-yellow-400', text: 'Hypotes' };
        default: return { icon: 'fa-solid fa-question-circle', color: 'text-gray-400', text: 'Okänd' };
    }
}

const KnowledgeBaseStatus: React.FC<KnowledgeBaseStatusProps> = ({ knowledgeBase }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'rules' | 'graph' | 'learning'>('rules');

    if (!knowledgeBase) {
        return <div className="w-10"></div>;
    }

    const renderModalContent = () => {
        switch (activeTab) {
            case 'rules':
                return (
                    <div className="space-y-3 pr-2 overflow-y-auto max-h-[50vh]">
                        {knowledgeBase.rules.sort((a,b) => b.confidence - a.confidence).map(rule => {
                            const statusInfo = getRuleStatusInfo(rule.status);
                            return (
                                <div key={rule.id} className="p-3 bg-gray-950/60 border border-white/10 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <p className="font-mono text-sm text-gray-200 flex-1 pr-4">{rule.pattern}</p>
                                        <div className="text-right flex-shrink-0">
                                            <div className={`font-bold text-lg ${getConfidenceColor(rule.confidence)}`}>
                                                {(rule.confidence * 100).toFixed(0)}%
                                            </div>
                                            <div className={`text-xs font-semibold ${statusInfo.color} flex items-center justify-end`}>
                                                <i className={`${statusInfo.icon} mr-1.5`}></i> {statusInfo.text}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            case 'graph':
                 return (
                    <div className="space-y-3 pr-2 overflow-y-auto max-h-[50vh]">
                        {knowledgeBase.graphSummary.map(node => (
                             <div key={node.id} className="p-3 bg-gray-950/60 border border-white/10 rounded-lg">
                                 <h4 className="text-md font-bold text-purple-300" style={{fontFamily: 'var(--font-heading)'}}>{node.id}</h4>
                                 {node.connections.map(conn => {
                                     const isPositive = conn.type.includes('positive');
                                     const color = isPositive ? 'text-green-400' : 'text-red-400';
                                     const icon = isPositive ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down';
                                     return (
                                        <div key={conn.target} className="flex items-center justify-between text-sm mt-1 pl-4">
                                            <span className="text-gray-300">→ påverkar <span className="font-semibold text-white">{conn.target}</span></span>
                                            <span className={`${color} font-semibold flex items-center`}>
                                                <i className={`${icon} mr-2`}></i>
                                                Styrka: {(conn.weight * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                     )
                                 })}
                             </div>
                        ))}
                     </div>
                 );
            case 'learning':
                 return (
                     <div className="space-y-3 pr-2 overflow-y-auto max-h-[50vh]">
                         <p className="text-sm text-gray-400 mb-4">Detta är de områden där AI:n har låg säkerhet och aktivt söker mer data för att förfina sin förståelse.</p>
                         {knowledgeBase.learningQueue.map(item => (
                              <div key={item.topic} className="p-3 bg-gray-950/60 border border-yellow-500/30 rounded-lg flex justify-between items-center">
                                  <p className="text-sm text-yellow-200">{item.topic}</p>
                                  <div className="text-right">
                                      <div className={`font-bold text-lg ${getConfidenceColor(item.confidence)}`}>
                                          {(item.confidence * 100).toFixed(0)}%
                                      </div>
                                      <div className="text-xs text-yellow-400">Säkerhet</div>
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
                           <i className="fa-solid fa-brain mr-3"></i> GPT-5 Knowledge Base
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                    </div>

                    <div className="flex space-x-1 border-b border-purple-500/30 mb-4">
                        <TabButton id="rules" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-check-double">Aktiva Regler</TabButton>
                        <TabButton id="graph" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-share-nodes">Kunskapsgraf</TabButton>
                        <TabButton id="learning" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-solid fa-magnifying-glass-chart">Inlärningskö</TabButton>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    {renderModalContent()}
                </div>
            </div>
        </div>
    );
    
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

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Knowledge Base">
                <i className="fa-solid fa-brain text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Knowledge Base
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default KnowledgeBaseStatus;
