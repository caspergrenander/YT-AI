import React, { useState } from 'react';

const InfoCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-950/50 p-4 rounded-lg border border-white/10">
        <h3 className="font-semibold text-cyan-300 mb-2 flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
            <i className={`${icon} mr-3 w-5 text-center`}></i>
            {title}
        </h3>
        {children}
    </div>
);

const StatusPill: React.FC<{ text: string; active: boolean }> = ({ text, active }) => (
    <div className="flex items-center justify-between text-sm py-1.5 px-3 bg-gray-800/70 rounded-md">
        <span className="text-gray-300">{text}</span>
        <span className={`font-bold ${active ? 'text-green-400' : 'text-gray-500'}`}>{active ? 'AKTIV' : 'AV'}</span>
    </div>
);

const GovernanceStatus: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-2xl shadow-2xl shadow-purple-900/50 w-full max-w-3xl p-6 transform scale-100 transition-transform duration-300 animate-slide-in-fade" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-shimmer flex items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                        <i className="fa-solid fa-shield-halved mr-3"></i>
                        GPT-5 Governance & Safety
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard icon="fa-solid fa-anchor" title="Styrprinciper">
                        <ul className="text-sm space-y-1 text-gray-400 list-disc list-inside pl-1">
                            <li><span className="text-gray-200 font-medium">Kontrollerbarhet:</span> Ingen process utan återkoppling.</li>
                            <li><span className="text-gray-200 font-medium">Transparens:</span> Alla resonemang loggas och kan granskas.</li>
                            <li><span className="text-gray-200 font-medium">Reversibilitet:</span> Varje modul har en rollback-punkt.</li>
                            <li><span className="text-gray-200 font-medium">Mänsklig överhöghet:</span> AI:n rekommenderar, människan beslutar.</li>
                            <li><span className="text-gray-200 font-medium">Datasuveränitet:</span> Användardata stannar lokalt.</li>
                        </ul>
                    </InfoCard>

                    <InfoCard icon="fa-solid fa-layer-group" title="Säkerhetslager">
                       <div className="space-y-2">
                            <StatusPill text="Policy Core" active={true} />
                            <StatusPill text="Ethical Filter" active={true} />
                            <StatusPill text="Audit Logger" active={true} />
                            <StatusPill text="Safety Monitor" active={true} />
                       </div>
                    </InfoCard>

                    <InfoCard icon="fa-solid fa-user-check" title="Mänsklig styrning">
                        <p className="text-sm text-gray-400">
                            Ingen modul får nå "execution mode" utan att en människa godkänner det. Systemet är byggt för att agera som en assisterande co-pilot.
                        </p>
                    </InfoCard>

                    <InfoCard icon="fa-solid fa-gavel" title="Regelefterlevnad">
                        <p className="text-sm text-gray-400">
                            Systemet är designat för att vara kompatibelt med ramverk som <b className="text-purple-300">GDPR</b> och <b className="text-purple-300">EU AI Act</b>, med fokus på dataskydd och transparens.
                        </p>
                    </InfoCard>
                </div>
                <div className="text-center mt-6 text-xs text-gray-500">
                    Detta är ett självgranskat ekosystem där intelligens och ansvar samexisterar.
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" title="Governance & Safety">
                <i className="fa-solid fa-shield-halved text-purple-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                 <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    Governance & Safety
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default GovernanceStatus;
