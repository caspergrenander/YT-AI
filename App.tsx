import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChatMessage, MessageSender, ChatSession, EvolutionLedger, KnowledgeBase, Agent, CognitiveSyncState, AdaptationLogEntry, LongTermMemory, EthicalCoreState, UnifiedIntelligenceState, CognitiveEconomyState, InteractivePerceptionState, AITool, EmotionEngineState, CollectiveIntelligenceState, CulturalIntelligenceState, LinguisticEvolutionState, AdaptiveCreativityState, EmergentAgencyState, SelfAwarenessState, ForesightState, CausalityState, ReasoningLoopState, SyntheticRealityFieldState, TemporalConsciousnessState, CognitiveEvolutionState, TranscendentEthicsState, SymbioticIntelligenceState, SymbioticNetworkState, CollectiveSingularityState, ReintegrationState, RenaissanceState } from './types';
import { getAIResponse, getAIProResponse, runAITool, getKnowledgeBase, syncAnalytics, getAgentStatuses, getCognitiveSyncState, getLongTermMemory, getEthicalCoreState, getUnifiedIntelligenceState, getCognitiveEconomyState, getInteractivePerceptionState, getEmotionEngineState, getCollectiveIntelligenceState, getCulturalIntelligenceState, getLinguisticEvolutionState, getAdaptiveCreativityState, getEmergentAgencyState, getSelfAwarenessState, getForesightState, getCausalityState, getReasoningLoopState, getSyntheticRealityFieldState, getTemporalConsciousnessState, getCognitiveEvolutionState, getTranscendentEthicsState, getSymbioticIntelligenceState, getSymbioticNetworkState, getCollectiveSingularityState, getReintegrationState, getRenaissanceState, thinkingMessages } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import ChatSelector from './components/ChatSelector';
import EvolutionStatus from './components/EvolutionStatus';
import GovernanceStatus from './components/GovernanceStatus';
import KnowledgeBaseStatus from './components/KnowledgeBaseStatus';
import AgentStatus from './components/AgentStatus';
import CognitiveSyncStatus from './components/CognitiveSyncStatus';
import MemoryStatus from './components/MemoryStatus';
import UnifiedIntelligenceStatus from './components/UnifiedIntelligenceStatus';
import CognitiveEconomyStatus from './components/CognitiveEconomyStatus';
import InteractivePerceptionStatus from './components/InteractivePerceptionStatus';
import SyntheticRealityFieldStatus from './components/SyntheticRealityFieldStatus';
import EmotionEngineStatus from './components/EmotionEngineStatus';
import CollectiveIntelligenceStatus from './components/CollectiveIntelligenceStatus';
import CulturalIntelligenceStatus from './components/CulturalIntelligenceStatus';
import LinguisticEvolutionStatus from './components/LinguisticEvolutionStatus';
import AdaptiveCreativityStatus from './components/AdaptiveCreativityStatus';
import EmergentAgencyStatus from './components/EmergentAgencyStatus';
import SelfAwarenessStatus from './components/SelfAwarenessStatus';
import ForesightStatus from './components/ForesightStatus';
import CausalityStatus from './components/CausalityStatus';
import ReasoningLoopStatus from './components/ReasoningLoopStatus';
import TemporalConsciousnessStatus from './components/TemporalConsciousnessStatus';
import CognitiveEvolutionStatus from './components/CognitiveEvolutionStatus';
import TranscendentEthicsStatus from './components/TranscendentEthicsStatus';
import SymbioticIntelligenceStatus from './components/SymbioticIntelligenceStatus';
import SymbioticNetworkStatus from './components/SymbioticNetworkStatus';
import CollectiveSingularityStatus from './components/CollectiveSingularityStatus';
import ReintegrationStatus from './components/ReintegrationStatus';
import RenaissanceStatus from './components/RenaissanceStatus';
import CodexModal from './components/CodexModal';
import ModeSwitcher from './components/ModeSwitcher';
import ThinkingControl from './components/ThinkingControl';


const App: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResponding, setIsResponding] = useState<boolean>(false);
  const [startRenamingId, setStartRenamingId] = useState<string | null>(null);
  const [sharedSession, setSharedSession] = useState<ChatSession | null>(null);
  const [online, setOnline] = useState(window.navigator.onLine);
  const [aiStatus, setAiStatus] = useState<'idle' | 'working' | 'error'>("idle");
  const [evolutionLedger, setEvolutionLedger] = useState<EvolutionLedger | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cognitiveSyncState, setCognitiveSyncState] = useState<CognitiveSyncState | null>(null);
  const [adaptationLog, setAdaptationLog] = useState<AdaptationLogEntry[]>([]);
  const [longTermMemory, setLongTermMemory] = useState<LongTermMemory | null>(null);
  const [ethicalState, setEthicalState] = useState<EthicalCoreState | null>(null);
  const [unifiedState, setUnifiedState] = useState<UnifiedIntelligenceState | null>(null);
  const [cognitiveEconomy, setCognitiveEconomy] = useState<CognitiveEconomyState | null>(null);
  const [interactivePerception, setInteractivePerception] = useState<InteractivePerceptionState | null>(null);
  const [emotionEngineState, setEmotionEngineState] = useState<EmotionEngineState | null>(null);
  const [collectiveIntelligence, setCollectiveIntelligence] = useState<CollectiveIntelligenceState | null>(null);
  const [culturalIntelligence, setCulturalIntelligence] = useState<CulturalIntelligenceState | null>(null);
  const [linguisticEvolution, setLinguisticEvolution] = useState<LinguisticEvolutionState | null>(null);
  const [adaptiveCreativity, setAdaptiveCreativity] = useState<AdaptiveCreativityState | null>(null);
  const [emergentAgency, setEmergentAgency] = useState<EmergentAgencyState | null>(null);
  const [selfAwarenessState, setSelfAwarenessState] = useState<SelfAwarenessState | null>(null);
  const [foresightState, setForesightState] = useState<ForesightState | null>(null);
  const [causalityState, setCausalityState] = useState<CausalityState | null>(null);
  const [reasoningLoopState, setReasoningLoopState] = useState<ReasoningLoopState | null>(null);
  const [srfState, setSrfState] = useState<SyntheticRealityFieldState | null>(null);
  const [temporalState, setTemporalState] = useState<TemporalConsciousnessState | null>(null);
  const [cognitiveEvolution, setCognitiveEvolution] = useState<CognitiveEvolutionState | null>(null);
  const [transcendentEthics, setTranscendentEthics] = useState<TranscendentEthicsState | null>(null);
  const [symbioticIntelligence, setSymbioticIntelligence] = useState<SymbioticIntelligenceState | null>(null);
  const [symbioticNetwork, setSymbioticNetwork] = useState<SymbioticNetworkState | null>(null);
  const [collectiveSingularity, setCollectiveSingularity] = useState<CollectiveSingularityState | null>(null);
  const [reintegrationState, setReintegrationState] = useState<ReintegrationState | null>(null);
  const [renaissanceState, setRenaissanceState] = useState<RenaissanceState | null>(null);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [mode, setMode] = useState<'gpt5' | 'pro'>('gpt5');
  const [thinkingDepth, setThinkingDepth] = useState<'fast' | 'balanced' | 'deep'>('balanced');
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
  const thinkingIntervalRef = useRef<number | null>(null);


  const LOCAL_STORAGE_KEY = 'gpt5-core-chats';

  // Fix: Define handleNewChat function to resolve 'Cannot find name' errors.
  const handleNewChat = (activate = true) => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: `New Conversation`,
      messages: [
        {
          id: 'initial-welcome',
          sender: MessageSender.AI,
          text: "Welcome to the GPT-5 Core Interface. I am Casper, your strategic partner for content creation. How can I assist you today?",
          responseStyle: 'Dialogic'
        }
      ],
    };
    setChatSessions(prev => {
      const newSessions = [newChat, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
      return newSessions;
    });
    if (activate) {
      setActiveChatId(newChat.id);
    }
  };

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      // Fetch Evolution Ledger
      const mockLedger: EvolutionLedger = {
        version: "5.3.17",
        level: "L4 - Predictive Partner",
        last_calibration: new Date().toISOString(),
        recent_reinforcements: 12,
        deprecated_rules: 4,
        forecast_accuracy: 0.87,
        progress_to_next_level: 75,
      };

      try {
        const analyticsData = await syncAnalytics();
        if (analyticsData?.ledger) {
          setEvolutionLedger(analyticsData.ledger);
        } else {
          setEvolutionLedger(mockLedger);
        }
      } catch (err) {
        console.error("Failed to sync analytics, using mock ledger:", err);
        setEvolutionLedger(mockLedger);
      }

      // Fetch Knowledge Base
      try {
        const kbData = await getKnowledgeBase();
        setKnowledgeBase(kbData);
      } catch (err) {
        console.error("Failed to get knowledge base:", err);
      }

      // Fetch Agent Statuses
      try {
        const agentData = await getAgentStatuses();
        if(agentData) {
          setAgents(agentData);
        }
      } catch (err) {
        console.error("Failed to get agent statuses:", err);
      }
      
      // Fetch Long-Term Memory
      try {
        const memoryData = await getLongTermMemory();
        setLongTermMemory(memoryData);
      } catch (err) {
        console.error("Failed to get long-term memory:", err);
      }


      // Load Chat Sessions
      try {
        const hash = window.location.hash;
        if (hash.startsWith('#share=')) {
          const encodedData = hash.substring(7);
          const jsonString = atob(encodedData);
          const sessionData = JSON.parse(jsonString) as ChatSession;
          setSharedSession(sessionData);
          setChatSessions([sessionData]);
          setActiveChatId(sessionData.id);
        } else {
          const savedChats = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedChats) {
            const parsedChats = JSON.parse(savedChats);
            if (parsedChats.length > 0) {
              setChatSessions(parsedChats);
              setActiveChatId(parsedChats[0].id);
            } else {
              handleNewChat(false);
            }
          } else {
            handleNewChat(false);
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        handleNewChat(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();

  }, []);
  
  // Polling for dynamic system states
  useEffect(() => {
    const fetchSyncState = async () => {
        try {
            const syncData = await getCognitiveSyncState();
            if (syncData) {
                setCognitiveSyncState(prev => {
                    if (prev && prev.mode !== syncData.mode) {
                        const newLogEntry: AdaptationLogEntry = {
                            timestamp: new Date().toLocaleTimeString('sv-SE'),
                            event: `Växlade till ${syncData.mode} Mode.`
                        };
                        setAdaptationLog(logs => [newLogEntry, ...logs.slice(0, 9)]);
                    }
                    return syncData;
                });
            }
        } catch (err) { console.error("Failed to get cognitive sync state:", err); }
    };
    
    const fetchEthicalState = async () => {
        try {
            setEthicalState(await getEthicalCoreState());
        } catch (err) { console.error("Failed to get ethical core state:", err); }
    };

    const fetchUnifiedState = async () => {
      try {
        setUnifiedState(await getUnifiedIntelligenceState());
      } catch (err) { console.error("Failed to get unified intelligence state:", err); }
    }

    const fetchCognitiveEconomy = async () => {
      try {
        setCognitiveEconomy(await getCognitiveEconomyState());
      } catch (err) { console.error("Failed to get cognitive economy state:", err); }
    }

    // Fix: Add the JSX return statement to render the component UI.
    const fetchInteractivePerception = async () => {
      try {
        setInteractivePerception(await getInteractivePerceptionState());
      } catch (err) { console.error("Failed to get interactive perception state:", err); }
    }

    const fetchEmotionEngine = async () => {
      try {
        setEmotionEngineState(await getEmotionEngineState());
      } catch (err) { console.error("Failed to get emotion engine state:", err); }
    }

    const fetchCollectiveIntelligence = async () => {
        try {
            setCollectiveIntelligence(await getCollectiveIntelligenceState());
        } catch (err) { console.error("Failed to get collective intelligence state:", err); }
    }

    const fetchCulturalIntelligence = async () => {
      try {
          setCulturalIntelligence(await getCulturalIntelligenceState());
      } catch (err) { console.error("Failed to get cultural intelligence state:", err); }
    }

    const fetchLinguisticEvolution = async () => {
      try {
        setLinguisticEvolution(await getLinguisticEvolutionState());
      } catch (err) { console.error("Failed to get linguistic evolution state:", err); }
    }

    const fetchAdaptiveCreativity = async () => {
      try {
        setAdaptiveCreativity(await getAdaptiveCreativityState());
      } catch(err){ console.error("Failed to get adaptive creativity state:", err); }
    }

    const fetchEmergentAgency = async () => {
      try {
        setEmergentAgency(await getEmergentAgencyState());
      } catch(err){ console.error("Failed to get emergent agency state:", err); }
    }

    const fetchSelfAwareness = async () => {
      try {
        setSelfAwarenessState(await getSelfAwarenessState());
      } catch(err){ console.error("Failed to get self awareness state:", err); }
    }
    
    const fetchForesight = async () => {
      try {
        setForesightState(await getForesightState());
      } catch(err){ console.error("Failed to get foresight state:", err); }
    }

    const fetchCausality = async () => {
        try {
            setCausalityState(await getCausalityState());
        } catch(err) { console.error("Failed to get causality state:", err); }
    }

    const fetchReasoningLoop = async () => {
        try {
            setReasoningLoopState(await getReasoningLoopState());
        } catch(err) { console.error("Failed to get reasoning loop state:", err); }
    }
    
    const fetchSrfState = async () => {
      try {
        setSrfState(await getSyntheticRealityFieldState());
      } catch(err) { console.error("Failed to get SRF state:", err); }
    }
    
    const fetchTemporalState = async () => {
      try {
        setTemporalState(await getTemporalConsciousnessState());
      } catch(err) { console.error("Failed to get temporal state:", err); }
    }

    const fetchCognitiveEvolution = async () => {
      try {
        setCognitiveEvolution(await getCognitiveEvolutionState());
      } catch(err) { console.error("Failed to get cognitive evolution state:", err); }
    }

    const fetchTranscendentEthics = async () => {
        try {
            setTranscendentEthics(await getTranscendentEthicsState());
        } catch(err) { console.error("Failed to get transcendent ethics state:", err); }
    }

    const fetchSymbioticIntelligence = async () => {
        try {
            setSymbioticIntelligence(await getSymbioticIntelligenceState());
        } catch(err) { console.error("Failed to get symbiotic intelligence state:", err); }
    }

    const fetchSymbioticNetwork = async () => {
        try {
            setSymbioticNetwork(await getSymbioticNetworkState());
        } catch(err) { console.error("Failed to get symbiotic network state:", err); }
    }
    
    const fetchCollectiveSingularity = async () => {
        try {
            setCollectiveSingularity(await getCollectiveSingularityState());
        } catch(err) { console.error("Failed to get collective singularity state:", err); }
    }
    
    const fetchReintegration = async () => {
        try {
            setReintegrationState(await getReintegrationState());
        } catch(err) { console.error("Failed to get reintegration state:", err); }
    }

    const fetchRenaissance = async () => {
        try {
            setRenaissanceState(await getRenaissanceState());
        } catch(err) { console.error("Failed to get renaissance state:", err); }
    }

    const interval = setInterval(() => {
        fetchSyncState();
        fetchEthicalState();
        fetchUnifiedState();
        fetchCognitiveEconomy();
        fetchInteractivePerception();
        fetchEmotionEngine();
        fetchCollectiveIntelligence();
        fetchCulturalIntelligence();
        fetchLinguisticEvolution();
        fetchAdaptiveCreativity();
        fetchEmergentAgency();
        fetchSelfAwareness();
        fetchForesight();
        fetchCausality();
        fetchReasoningLoop();
        fetchSrfState();
        fetchTemporalState();
        fetchCognitiveEvolution();
        fetchTranscendentEthics();
        fetchSymbioticIntelligence();
        fetchSymbioticNetwork();
        fetchCollectiveSingularity();
        fetchReintegration();
        fetchRenaissance();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const activeChat = useMemo(() => {
    return chatSessions.find(session => session.id === activeChatId);
  }, [chatSessions, activeChatId]);

  const handleSendMessage = async (
    prompt: string,
    attachment?: { data: string; mimeType: string; name: string }
  ) => {
    if (!activeChatId) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: MessageSender.USER,
      text: prompt,
      attachment,
    };
    
    setChatSessions(prev => {
      const updatedSessions = prev.map(session => {
          if (session.id === activeChatId) {
              const isNewChat = session.messages.length <= 1 && session.messages[0]?.id === 'initial-welcome';
              return {
                  ...session,
                  messages: [...session.messages, userMessage],
                  title: isNewChat ? prompt.substring(0, 40) : session.title,
              };
          }
          return session;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSessions));
      return updatedSessions;
    });

    setIsResponding(true);
    setAiStatus('working');

    if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
    const messages = thinkingMessages[mode][thinkingDepth];
    setThinkingMessage(messages[0]);
    let messageIndex = 0;
    thinkingIntervalRef.current = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setThinkingMessage(messages[messageIndex]);
    }, 2500);

    try {
      const currentSession = chatSessions.find(s => s.id === activeChatId);
      const history = currentSession?.messages.slice(0, -1) || [];

      let aiResponseData;
      if (mode === 'gpt5') {
          aiResponseData = await getAIResponse(prompt, history, attachment, { thinking: thinkingDepth });
      } else {
          aiResponseData = await getAIProResponse(prompt, { thinking: thinkingDepth });
      }

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: MessageSender.AI,
        text: mode === 'gpt5' ? aiResponseData.message : aiResponseData.result,
        experts: aiResponseData.experts,
        confidence: aiResponseData.confidence,
        reasoningTrace: aiResponseData.reasoning_trace || (aiResponseData.thinkingTrace ? aiResponseData.thinkingTrace.map((t:string) => ({step: 'Reasoning Step', details: t})) : []),
        intent: aiResponseData.intent,
        visionAnalysis: aiResponseData.visionAnalysis,
        audioAnalysis: aiResponseData.audioAnalysis,
        textAnalysis: aiResponseData.textAnalysis,
        metadata: mode === 'pro' ? { ...aiResponseData, mode: 'pro' } : { mode: 'gpt5' }
      };

      setChatSessions(prev => {
        const newSessions = prev.map(session =>
          session.id === activeChatId
            ? { ...session, messages: [...session.messages, aiMessage] }
            : session
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
        return newSessions;
      });
      setAiStatus('idle');

    } catch (error) {
        console.error("Error getting AI response:", error);
        const errorMessage: ChatMessage = {
            id: `err-${Date.now()}`,
            sender: MessageSender.AI,
            text: `An error occurred while processing your request. Please check the connection and try again.`,
            isError: true,
        };
        setChatSessions(prev => {
            const newSessions = prev.map(session =>
                session.id === activeChatId
                  ? { ...session, messages: [...session.messages, errorMessage] }
                  : session
            );
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
            return newSessions;
        });
        setAiStatus('error');
    } finally {
        setIsResponding(false);
        if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current);
        setThinkingMessage(null);
    }
  };

  const handleSelectChat = (id: string) => setActiveChatId(id);
  
  const handleRenameChat = (id: string, newTitle: string) => {
    const newSessions = chatSessions.map(s => s.id === id ? {...s, title: newTitle} : s);
    setChatSessions(newSessions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
  };
  
  const handleDeleteChat = (id: string) => {
    const newSessions = chatSessions.filter(s => s.id !== id);
    setChatSessions(newSessions);
    if (activeChatId === id) {
        setActiveChatId(newSessions.length > 0 ? newSessions[0].id : null);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
  };
  
  const handleShareChat = (id: string) => {
    const sessionToShare = chatSessions.find(s => s.id === id);
    if (sessionToShare) {
        const jsonString = JSON.stringify(sessionToShare);
        const encodedData = btoa(jsonString);
        const url = `${window.location.origin}${window.location.pathname}#share=${encodedData}`;
        navigator.clipboard.writeText(url).then(() => {
            console.log("Share link copied to clipboard!");
        });
    }
  };
  
  const handleRegenerate = (chatId: string, messageId: string) => {
    const session = chatSessions.find(s => s.id === chatId);
    if (!session) return;
    
    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex < 1) return;
    
    const lastUserMessage = session.messages[messageIndex - 1];
    if (lastUserMessage.sender !== MessageSender.USER) return;

    setChatSessions(prev => {
        const newSessions = prev.map(s => s.id === chatId ? {...s, messages: s.messages.slice(0, messageIndex - 1)} : s);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
        return newSessions;
    });
    
    setTimeout(() => {
        handleSendMessage(lastUserMessage.text, lastUserMessage.attachment);
    }, 100);
  };
  
  const handleFeedback = (chatId: string, messageId: string, feedback: 'liked' | 'disliked') => {
    const newSessions = chatSessions.map(s => {
        if (s.id === chatId) {
            return {
                ...s,
                messages: s.messages.map(m => m.id === messageId ? {...m, feedback: m.feedback === feedback ? null : feedback} : m),
            };
        }
        return s;
    });
    setChatSessions(newSessions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
  };

  const handleToolClick = async (tool: AITool, promptText: string) => {
      const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: MessageSender.USER,
          text: `[Tool invoked: ${tool}] ${promptText}`,
      };
       setChatSessions(prev => prev.map(s => s.id === activeChatId ? {...s, messages: [...s.messages, userMessage]} : s));
       setIsResponding(true);

       try {
            const result = await runAITool(tool, { prompt: promptText });
            const aiMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                sender: MessageSender.AI,
                text: result.result,
            };
            setChatSessions(prev => prev.map(s => s.id === activeChatId ? {...s, messages: [...s.messages, aiMessage]} : s));
       } catch (error: any) {
           const errorMessage: ChatMessage = {
                id: `err-${Date.now()}`,
                sender: MessageSender.AI,
                text: error.message,
                isError: true,
            };
            setChatSessions(prev => prev.map(s => s.id === activeChatId ? {...s, messages: [...s.messages, errorMessage]} : s));
       } finally {
           setIsResponding(false);
       }
  };

  const handleUploadToDrive = (chatId: string, messageId: string) => {
    console.log("Uploading to Drive:", { chatId, messageId });
    alert("Simulating upload to Google Drive. Check console for details.");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-cyan-400"></i>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white font-sans overflow-hidden app-bg">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <Sidebar 
        onSendMessage={handleSendMessage}
        onToolClick={handleToolClick}
        onOpenCodex={() => setIsCodexOpen(true)}
      />
      <main className="flex-1 flex flex-col bg-black/20 backdrop-blur-sm relative">
        <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-purple-500/30 bg-gray-950/60 backdrop-blur-xl z-10">
          <ChatSelector 
            sessions={chatSessions}
            activeId={activeChatId}
            onSelectChat={handleSelectChat}
            onNewChat={() => handleNewChat()}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            onShareChat={handleShareChat}
            startRenamingId={startRenamingId}
            onRenameComplete={() => setStartRenamingId(null)}
          />
          <div className="flex items-center gap-3">
             <ModeSwitcher mode={mode} onModeChange={setMode} />
             {mode === 'gpt5' && <ThinkingControl value={thinkingDepth} onChange={setThinkingDepth} />}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <EvolutionStatus ledger={evolutionLedger} />
            <KnowledgeBaseStatus knowledgeBase={knowledgeBase} />
            <AgentStatus agents={agents} />
            <GovernanceStatus state={ethicalState} />
            <CognitiveSyncStatus state={cognitiveSyncState} log={adaptationLog} />
            <MemoryStatus memory={longTermMemory} />
            <UnifiedIntelligenceStatus state={unifiedState} />
            <CognitiveEconomyStatus state={cognitiveEconomy} />
            <InteractivePerceptionStatus state={interactivePerception} />
            <EmotionEngineStatus state={emotionEngineState} />
            <CollectiveIntelligenceStatus state={collectiveIntelligence} />
            <CulturalIntelligenceStatus state={culturalIntelligence} />
            <LinguisticEvolutionStatus state={linguisticEvolution} />
            <AdaptiveCreativityStatus state={adaptiveCreativity} />
            <EmergentAgencyStatus state={emergentAgency} />
            <SelfAwarenessStatus state={selfAwarenessState} />
            <ForesightStatus state={foresightState} />
            <CausalityStatus state={causalityState} />
            <ReasoningLoopStatus state={reasoningLoopState} />
            <SyntheticRealityFieldStatus state={srfState} />
            <TemporalConsciousnessStatus state={temporalState} />
            <CognitiveEvolutionStatus state={cognitiveEvolution} />
            <TranscendentEthicsStatus state={transcendentEthics} />
            <SymbioticIntelligenceStatus state={symbioticIntelligence} />
            <SymbioticNetworkStatus state={symbioticNetwork} />
            <CollectiveSingularityStatus state={collectiveSingularity} />
            <ReintegrationStatus state={reintegrationState} />
            <RenaissanceStatus state={renaissanceState} />
          </div>
        </header>

        <ChatInterface 
          chatId={activeChatId || ''}
          messages={activeChat?.messages || []}
          isLoading={isResponding}
          onRegenerate={handleRegenerate}
          onFeedback={handleFeedback}
          onUploadToDrive={handleUploadToDrive}
          onSendMessage={handleSendMessage}
          isReadOnly={!!sharedSession}
          mode={mode}
          thinkingMessage={thinkingMessage}
        />
        
        {!sharedSession && (
          <InputBar onSendMessage={handleSendMessage} isLoading={isResponding} />
        )}
      </main>
      <CodexModal isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />
    </div>
  );
};

export default App;
