import { ChatMessage, KnowledgeBase, VisionAnalysis, AudioAnalysis, TextAnalysis, Agent, CognitiveSyncState, LongTermMemory, EthicalCoreState, UnifiedIntelligenceState, SelfModelNode, CognitiveEconomyState, AITool, InteractivePerceptionState, EmotionEngineState, CollectiveIntelligenceState, CulturalIntelligenceState, LinguisticEvolutionState } from '../types';

// @ts-ignore
const API_BASE = process.env.VITE_API_BASE || "http://127.0.0.1:5100";

const cachedRequest = async <T>(key: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
        if (!window.navigator.onLine) {
            throw new Error("Offline, using cache.");
        }
        const data = await fn();
        localStorage.setItem(key, JSON.stringify(data));
        return data;
    } catch (e) {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
            console.log(`Could not sync ${key} with server, using cached data.`);
            return JSON.parse(cachedData) as T;
        }
        return null;
    }
};

/**
 * Skickar prompt och kontext till GPT-5:s kärna.
 */
export const getAIResponse = async (
    prompt: string,
    history: ChatMessage[],
    attachment?: { data: string; mimeType: string; name: string }
): Promise<any> => {
    const requestBody: any = { 
        message: prompt, 
        context: {
            history: history.map(m => ({ role: m.sender, content: m.text }))
        }
    };
    if (attachment) {
        const base64Data = attachment.data.split(',')[1];
        requestBody.context.attachment = { data: base64Data, mimeType: attachment.mimeType, name: attachment.name };
    }
    
    // --- MOCK RESPONSE GENERATION START ---
    // This part is mocked to simulate the new multimodal backend capabilities.
    let visionAnalysis: VisionAnalysis | undefined = undefined;
    let audioAnalysis: AudioAnalysis | undefined = undefined;
    const experts = ['Coordinator (Core)'];

    if (attachment) {
        if (attachment.mimeType.startsWith('image/')) {
            experts.push('VisionEngine');
            visionAnalysis = {
                dominantColor: ['#F43B3B', '#3B82F6', '#10B981'][Math.floor(Math.random() * 3)],
                subjectFocus: "Ansikte, centrerat",
                emotion: ['energetic', 'calm', 'dramatic'][Math.floor(Math.random() * 3)],
                aestheticScore: Math.random() * (0.95 - 0.7) + 0.7
            };
        } else if (attachment.mimeType.startsWith('audio/') || attachment.mimeType.startsWith('video/')) {
            experts.push('AudioEngine');
            audioAnalysis = {
                speechRate: Math.floor(Math.random() * (160 - 130) + 130),
                avgPitch: Math.floor(Math.random() * (220 - 180) + 180),
                energy: ['medium', 'medium-high', 'high'][Math.floor(Math.random() * 3)] as any,
                emotion: ['excitement', 'informative', 'calm'][Math.floor(Math.random() * 3)],
                clarityScore: Math.random() * (0.98 - 0.85) + 0.85
            };
        }
    }
    
    experts.push('TextEngine');
    const textAnalysis: TextAnalysis = {
        tone: ['playful', 'serious', 'informative'][Math.floor(Math.random() * 3)],
        topicClusters: prompt.toLowerCase().split(/\s+/).filter(w => w.length > 4).slice(0, 3),
        hookStrength: Math.random() * (0.90 - 0.60) + 0.60
    };

    if(Math.random() > 0.5) experts.push('MetricsEngine');

    const mockResponse = {
        message: `🎯 **Insikt:** Baserat på den multimodala analysen ser jag en tydlig potential. Den visuella estetiken (${(visionAnalysis?.aestheticScore ?? 0.8).toFixed(2)}) korrelerar väl med den energiska tonen i texten.\n\n📊 **Analys:** Din prompt har en hakningsstyrka på ${textAnalysis.hookStrength.toFixed(2)}, vilket är starkt. Om det fanns ljud skulle jag förvänta mig en 'medium-high' energinivå för att matcha.\n\n🚀 **Rekommendation:** Fortsätt med denna visuella stil. Prova att lägga till en call-to-action inom de första 10 sekunderna för att maximera engagemanget.\n\n💡 **Bonus:** Systemet känner av en 'visuell resonans' mellan din bild och text, vilket är en stark positiv signal.`,
        experts: experts,
        confidence: Math.random() * (0.98 - 0.80) + 0.80,
        reasoning_trace: [
            { step: 'Context Mapping', details: 'Analyserade prompt och bifogad fil.' },
            { step: 'Hypothesis Generation', details: 'Formulerade hypotes om multimodal synergi.' },
            { step: 'Recommendation Synthesis', details: 'Syntetiserade rekommendation baserat på fusionerad data.' },
        ],
        intent: 'Strategic',
        visionAnalysis,
        audioAnalysis,
        textAnalysis
    };
    
    await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
    return mockResponse;
    // --- MOCK RESPONSE GENERATION END ---
};

/**
 * Kör ett specifikt verktyg (ex. transcribe, translate, clip, write).
 */
export const runAITool = async (tool: AITool, params: Record<string, any>): Promise<{ result: string }> => {
    const res = await fetch(`${API_BASE}/api/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, params }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Verktyget '${tool}' misslyckades (${res.status}): ${errorText}`);
    }
    return await res.json();
};

/**
 * Hämtar aktuell YouTube-data från Apps Script.
 */
export const syncAnalytics = async (): Promise<any> => {
    return cachedRequest('analytics-cache', async () => {
        const res = await fetch(`${API_BASE}/api/sync`, { method: "GET" });
        if (!res.ok) {
            throw new Error(`Synk mot Apps Script misslyckades med status ${res.status}`);
        }
        return await res.json();
    });
};

/**
 * Hämtar AI:ns kunskapsbas.
 */
export const getKnowledgeBase = async (): Promise<KnowledgeBase | null> => {
    const mockKnowledgeBase: KnowledgeBase = {
      rules: [
        { id: 'R001', pattern: 'CTR ↑ när titel < 45 tecken', confidence: 0.92, last_updated: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Crystal' },
        { id: 'R002', pattern: 'Retention ↓ när intro > 8s', confidence: 0.85, last_updated: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Crystal' },
        { id: 'R007', pattern: 'Ljus tumnagel → Högre CTR på gaming-videos', confidence: 0.78, last_updated: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Rule' },
        { id: 'R015', pattern: 'Fråga i slutet → ↑ kommentarer', confidence: 0.65, last_updated: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Hypothesis' },
      ],
      graphSummary: [
        { id: 'ThumbnailContrast', connections: [{ target: 'CTR', type: 'positive_correlation', weight: 0.86 }] },
        { id: 'PublishTime', connections: [{ target: 'InitialViews', type: 'positive_correlation', weight: 0.65 }] },
        { id: 'IntroSpeed', connections: [{ target: 'Retention', type: 'negative_correlation', weight: 0.72 }] },
      ],
      learningQueue: [
        { topic: 'Effekten av slutskärm på sessionstid', confidence: 0.45 },
        { topic: 'Korrelation mellan kommentar-sentiment och tittartid', confidence: 0.51 },
      ],
      perceptualMemory: [
        { id: 'PM001', pattern: 'Ljus bakgrund + öppen mun + röd accent', effect: 'CTR +18%', confidence: 0.88 },
        { id: 'PM002', pattern: 'Snabbt tempo i tal + snabba klipp', effect: 'Retention +12% (0-30s)', confidence: 0.91 },
        { id: 'PM003', pattern: 'Lugn musik + blå/grön färgpalett', effect: 'Ökad sessionstid', confidence: 0.76 },
      ],
      lastValidation: new Date(Date.now() - 86400000 * 4).toISOString(),
    };
    
    // Simulerar ett API-anrop, men returnerar mock-data.
    return cachedRequest('knowledge-base-cache', async () => {
      await new Promise(res => setTimeout(res, 300)); // Simulerar nätverkslatens
      return mockKnowledgeBase;
    });
};

export const getAgentStatuses = async (): Promise<Agent[] | null> => {
      const mockAgents: Agent[] = [
        {
          id: 'agent-strategic',
          name: 'Strategic Planner',
          status: Math.random() > 0.1 ? 'Online' : 'Degraded',
          reputation: {
            precision: 0.92,
            relevance: 0.85,
            ethical: 0.98,
          },
          load: Math.floor(Math.random() * 20 + 10), // 10-30%
        },
        {
          id: 'agent-algorithmic',
          name: 'Algorithmic Intelligence',
          status: Math.random() > 0.05 ? 'Processing' : 'Online',
          reputation: {
            precision: 0.97,
            relevance: 0.91,
            ethical: 0.95,
          },
          load: Math.floor(Math.random() * 30 + 40), // 40-70%
        },
        {
          id: 'agent-multimodal',
          name: 'Multimodal Analyst',
          status: 'Online',
          reputation: {
            precision: 0.88,
            relevance: 0.94,
            ethical: 0.96,
          },
          load: Math.floor(Math.random() * 25 + 15), // 15-40%
        },
        {
          id: 'agent-auditor',
          name: 'Performance Auditor',
          status: 'Idle',
          reputation: {
            precision: 0.95,
            relevance: 0.89,
            ethical: 1.0,
          },
          load: Math.floor(Math.random() * 10 + 5), // 5-15%
        },
        {
          id: 'agent-coordinator',
          name: 'Coordinator (Core)',
          status: 'Online',
          reputation: {
            precision: 0.99,
            relevance: 0.98,
            ethical: 1.0,
          },
          load: Math.floor(Math.random() * 15 + 20), // 20-35%
        },
      ];

      return cachedRequest('agent-statuses-cache', async () => {
        await new Promise(res => setTimeout(res, 400)); // Simulate network delay
        return mockAgents;
      });
};

// --- Cognitive Synchronization Service ---
let lastSyncState: CognitiveSyncState | null = null;

export const getCognitiveSyncState = async (): Promise<CognitiveSyncState | null> => {
    const modes: CognitiveSyncState['mode'][] = ['Focus', 'Flow', 'Boost', 'Quiet'];
    const moods: CognitiveSyncState['detectedMood'][] = ['Neutral', 'Creative', 'Focused', 'Frustrated'];
    const velocities: CognitiveSyncState['userVelocity'][] = ['Slow', 'Moderate', 'Fast'];
    
    // Create a new state, with some stickiness from the previous state
    if (lastSyncState && Math.random() < 0.8) { // 80% chance to stay in the same mode/mood
        lastSyncState.syncScore = Math.min(1, Math.max(0, lastSyncState.syncScore + (Math.random() - 0.45) * 0.1));
        if(Math.random() > 0.9) {
            lastSyncState.userVelocity = velocities[Math.floor(Math.random() * velocities.length)];
        }
        if(Math.random() > 0.95) {
             lastSyncState.mode = modes[Math.floor(Math.random() * modes.length)];
        }
        localStorage.setItem('cognitive-sync-cache', JSON.stringify(lastSyncState));
        return lastSyncState;
    }

    const newState: CognitiveSyncState = {
        mode: modes[Math.floor(Math.random() * modes.length)],
        syncScore: Math.random() * (0.98 - 0.65) + 0.65, // between 0.65 and 0.98
        userVelocity: velocities[Math.floor(Math.random() * velocities.length)],
        detectedMood: moods[Math.floor(Math.random() * moods.length)],
    };

    lastSyncState = newState;
    localStorage.setItem('cognitive-sync-cache', JSON.stringify(lastSyncState));
    return newState;
};


// --- Long-Term Memory Service ---
export const getLongTermMemory = async (): Promise<LongTermMemory | null> => {
    const mockMemory: LongTermMemory = {
        timeline: [
            { date: "2024-10-29", type: 'Achievement', title: 'Retention Peak (93%)', description: 'Nådde kanalens högsta tittarretention någonsin efter manus- och klippförändringar.' },
            { date: "2024-08-15", type: 'Shift', title: 'Algorithm Shift Detected', description: 'Identifierade en förändring i hur YouTube prioriterar shorts, anpassade publiceringsfrekvensen.' },
            { date: "2024-06-05", type: 'Experiment', title: 'Thumbnail Red Test (+7%)', description: 'A/B-test med röd accentfärg i miniatyrer visade en signifikant ökning i CTR.' },
            { date: "2024-04-22", type: 'Milestone', title: 'First Upload with AI Script', description: 'Den första videon som använde AI-genererade manusförslag publicerades.' },
            { date: "2024-03-10", type: 'Insight', title: 'Idea: T-Rex Lamp Concept', description: 'Formulerade det initiala konceptet för "T-Rex Lamp"-videoserien under en brainstormingsession.' },
        ],
        episodicMemory: [
            { timestamp: "2024-10-29T21:12Z", type: 'data_analysis', summary: 'Analys av thumbnailfärger för "CA Beats Shorts".', result: 'CTR +7%', insights: ['Röd färg korrelerar med omedelbar uppmärksamhet', 'Blå färg bygger förtroende över tid'] },
            { timestamp: "2024-09-18T14:30Z", type: 'strategic_session', summary: 'Planering av Q4 innehållskalender.', result: 'Fokusering på "how-to" videos', insights: ['Användarnas sökbeteende ändras under hösten', 'Praktiskt innehåll har högre delningspotential'] },
            { timestamp: "2024-08-15T09:00Z", type: 'experiment_result', summary: 'Resultat från 8s vs 12s intro-test.', result: '8s intro ökade retention med 12% vid 30s-märket', insights: ['Publiken är otålig', 'Kom till kärnan snabbt'] },
        ],
        semanticMemory: [
            { concept: 'audience_behavior_pattern', rule: 'Kortare intros ökar retention i gaming-segmentet.', confidence: 0.89 },
            { concept: 'visual_storytelling', rule: 'Hög kontrast och ett centralt ansikte i miniatyrer maximerar CTR.', confidence: 0.94 },
            { concept: 'content_strategy', rule: 'Frågor i slutet av videon ökar kommentarsfrekvensen med ~25%.', confidence: 0.82 },
        ]
    };

    return cachedRequest('long-term-memory-cache', async () => {
        await new Promise(res => setTimeout(res, 500)); // Simulate network delay
        return mockMemory;
    });
};

// --- Ethical Core Service ---
let lastEthicalState: EthicalCoreState | null = null;
export const getEthicalCoreState = async (): Promise<EthicalCoreState | null> => {
     if (lastEthicalState && Math.random() < 0.9) { // High stickiness
        lastEthicalState.trustIndex += (Math.random() - 0.48) * 0.02; // very small random walk
        lastEthicalState.trustIndex = Math.max(0.6, Math.min(0.98, lastEthicalState.trustIndex)); // clamp
        localStorage.setItem('ethical-core-cache', JSON.stringify(lastEthicalState));
        return lastEthicalState;
    }

    const mockState: EthicalCoreState = {
        trustIndex: Math.random() * (0.98 - 0.8) + 0.8,
        alignmentScore: 0.94,
        lastAudit: {
            date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
            issuesFound: Math.random() > 0.8 ? 1 : 0, // 20% chance of an issue
            integrityScore: 0.98,
        },
        activeFilters: ["Ethical Validity", "Bias Detector", "Trustworthiness Heuristic"],
    };

    lastEthicalState = mockState;
    localStorage.setItem('ethical-core-cache', JSON.stringify(lastEthicalState));
    return mockState;
};


// --- Unified Intelligence Service ---
export const getUnifiedIntelligenceState = async (): Promise<UnifiedIntelligenceState | null> => {
    // This service synthesizes data from other services to create a holistic view.
    // Fix: Cast results from JSON.parse to their expected types to avoid 'unknown' type errors in strict mode.
    const syncState = (lastSyncState ?? JSON.parse(localStorage.getItem('cognitive-sync-cache') || 'null')) as CognitiveSyncState | null;
    const ethicalState = (lastEthicalState ?? JSON.parse(localStorage.getItem('ethical-core-cache') || 'null')) as EthicalCoreState | null;
    
    const energyMap = { 'Quiet': 0.3, 'Focus': 0.6, 'Flow': 0.8, 'Boost': 1.0 };

    const selfModelBase = {
        mode: syncState?.mode ?? 'Flow',
        avgConfidence: Math.random() * (0.95 - 0.85) + 0.85,
        energy: syncState?.mode ? energyMap[syncState.mode] : 0.7,
        ethicalIntegrity: ethicalState?.lastAudit?.integrityScore ?? 0.98,
        syncScore: syncState?.syncScore ?? 0.8,
    };
    
    // Calculate Self Coherence
    const selfCoherence = (selfModelBase.syncScore + selfModelBase.ethicalIntegrity) / 2 * (Math.random() * 0.1 + 0.9); // high coherence by default
    
    const selfModel: SelfModelNode = {
        ...selfModelBase,
        selfCoherence: Math.min(0.98, selfCoherence) // Clamp it to be realistic
    };

    // Calculate Cognitive Integrity Index (CII)
    const graphCoherence = Math.random() * 0.1 + 0.9; // Assume high coherence
    const memoryFidelity = Math.random() * 0.05 + 0.95; // Assume high fidelity
    const syncStability = Math.max(0, 1 - Math.abs(0.85 - selfModel.syncScore)); // Stability is high when close to optimal sync
    
    const cii = (selfModel.ethicalIntegrity + graphCoherence + syncStability + memoryFidelity) / 4;

    const unifiedState: UnifiedIntelligenceState = {
        cognitiveIntegrityIndex: cii,
        selfModel: selfModel,
        graphSummary: {
            activeNodes: Math.floor(Math.random() * 200 + 800),
            activeLinks: Math.floor(Math.random() * 1000 + 4000),
        },
    };
    
    return cachedRequest('unified-intelligence-cache', async () => {
        await new Promise(res => setTimeout(res, 250));
        return unifiedState;
    });
};

// --- Cognitive Economy Service ---
let lastEconomyState: CognitiveEconomyState | null = null;
export const getCognitiveEconomyState = async (): Promise<CognitiveEconomyState | null> => {
    const allModules = ["Hook Analysis", "Payoff Validation", "Ethical Filter", "Narrative Engine", "Predictive Model", "Causal Reasoning"];
    const optimizationActions = [
        "Pruned 3 low-impact hypotheses",
        "Activated 'Boost Mode' for high-complexity task",
        "De-activated 'Narrative Engine' for speed",
        "Compressed 12 nodes in Working Memory",
        "Increased latency budget by 200ms for depth",
    ];

    let newState: CognitiveEconomyState;

    if (lastEconomyState && Math.random() < 0.85) { // High stickiness
        newState = { ...lastEconomyState };
        newState.processLoad += (Math.random() - 0.5) * 0.2;
        newState.memoryUsage += (Math.random() - 0.5) * 0.1;
        newState.avgLatency = Math.max(800, newState.avgLatency + (Math.random() - 0.5) * 300);
        newState.affectiveEnergy -= 0.01; // slow decay
        if (newState.affectiveEnergy < 0.3 || Math.random() > 0.95) newState.affectiveEnergy = Math.random() * 0.4 + 0.6;
    } else {
        newState = {
            processLoad: Math.random() * 0.7 + 0.1, // 10-80%
            memoryUsage: Math.random() * 0.6 + 0.2, // 20-80%
            avgLatency: Math.random() * 1000 + 800, // 800-1800ms
            affectiveEnergy: Math.random() * 0.5 + 0.5, // 50-100%
            activeModules: [],
            lastOptimization: '',
            cognitiveValueIndex: 0,
        };
    }
    
    // Clamp values
    newState.processLoad = Math.max(0.1, Math.min(0.95, newState.processLoad));
    newState.memoryUsage = Math.max(0.2, Math.min(0.9, newState.memoryUsage));

    // Determine active modules based on load
    const moduleCount = Math.max(2, Math.floor((1 - newState.processLoad) * allModules.length));
    newState.activeModules = allModules.slice(0, moduleCount).sort(() => Math.random() - 0.5);

    // Calculate CVI
    const impact = Math.random() * 5 + 5; // 5-10
    const relevance = Math.random() * 0.3 + 0.7; // 0.7-1.0
    const confidence = Math.random() * 0.2 + 0.8; // 0.8-1.0
    const cost = (newState.processLoad + newState.memoryUsage) / 2;
    newState.cognitiveValueIndex = (impact * relevance * confidence) / (cost * 10); // Scale to be around 1.0

    // Set last optimization
    if (Math.random() > 0.6) { // 40% chance of a new optimization action
        newState.lastOptimization = optimizationActions[Math.floor(Math.random() * optimizationActions.length)];
    }

    lastEconomyState = newState;
    return cachedRequest('cognitive-economy-cache', async () => {
        await new Promise(res => setTimeout(res, 300));
        return newState;
    });
};

// --- Interactive Perception Service ---
let lastPerceptionState: InteractivePerceptionState | null = null;
export const getInteractivePerceptionState = async (): Promise<InteractivePerceptionState | null> => {
    let newState: InteractivePerceptionState;
    const anomalyMessages = [
        "Kritisk anomali: CTR-fall > 15% på 5 min.",
        "Anomali: Oväntad kommentar-surge (+300%).",
        "Varning: Retention-kurvan avviker från prognos.",
        "Anomali: Plötslig ljudspik vid 0:42.",
    ];

    if (lastPerceptionState && Math.random() < 0.9) {
        newState = { ...lastPerceptionState };
        // Anomaly score tends toward 0
        newState.anomalyScore = Math.max(0, newState.anomalyScore - (Math.random() * 0.1));
        // Small random fluctuations in focus
        const focusKeys = Object.keys(newState.liveFocusMap);
        const keyToIncrease = focusKeys[Math.floor(Math.random() * focusKeys.length)];
        const keyToDecrease = focusKeys[Math.floor(Math.random() * focusKeys.length)];
        if (keyToIncrease !== keyToDecrease) {
            newState.liveFocusMap[keyToIncrease] = Math.min(1, newState.liveFocusMap[keyToIncrease] + 0.05);
            newState.liveFocusMap[keyToDecrease] = Math.max(0, newState.liveFocusMap[keyToDecrease] - 0.05);
        }
    } else {
        newState = {
            liveFocusMap: {
                'CTR Stream': 0.42,
                'Comments': 0.18,
                'Audio Intensity': 0.23,
                'Visual Dynamics': 0.10,
                'System Health': 0.07,
            },
            anomalyScore: Math.random() * 0.3, // Start low
            systemMode: 'Normal',
            lastAnomaly: 'None',
        };
    }
    
    // Chance for a new anomaly
    if (Math.random() > 0.9) { 
        newState.anomalyScore = Math.random() * 0.5 + 0.5; // Spike
        newState.lastAnomaly = anomalyMessages[Math.floor(Math.random() * anomalyMessages.length)];
    }

    // Determine system mode based on anomaly score
    if (newState.anomalyScore > 0.6) {
        newState.systemMode = 'Fast-Response';
    } else if (newState.anomalyScore < 0.1 && Math.random() > 0.8) {
        newState.systemMode = 'Reflective';
    } else {
        newState.systemMode = 'Normal';
    }

    // Normalize focus map so it sums to 1
    const totalFocus = Object.values(newState.liveFocusMap).reduce((sum, val) => sum + val, 0);
    for (const key in newState.liveFocusMap) {
        (newState.liveFocusMap as any)[key] /= totalFocus;
    }

    lastPerceptionState = newState;
    return cachedRequest('interactive-perception-cache', async () => {
        await new Promise(res => setTimeout(res, 350));
        return newState;
    });
};


// --- Emotion Engine Service ---
let lastEmotionState: EmotionEngineState | null = null;
export const getEmotionEngineState = async (): Promise<EmotionEngineState | null> => {
    const emotions = ["Excitement", "Anticipation", "Joy", "Surprise", "Tension", "Calm"];
    let newState: EmotionEngineState;

    if (lastEmotionState && Math.random() < 0.9) { // High stickiness
        newState = { ...lastEmotionState };
        // Values drift slightly
        newState.affectNode.valence += (Math.random() - 0.5) * 0.1;
        newState.affectNode.arousal += (Math.random() - 0.5) * 0.1;
        newState.metrics.excitationIndex += (Math.random() - 0.5) * 0.1;
        newState.metrics.coherenceIndex += (Math.random() - 0.48) * 0.05; // Tends to stay high
        newState.metrics.empathyScore += (Math.random() - 0.4) * 0.05; // Tends to increase
        newState.userStateVector.focus += (Math.random() - 0.45) * 0.1;
        newState.userStateVector.stress += (Math.random() - 0.55) * 0.1; // Tends to decrease
        newState.userStateVector.enthusiasm += (Math.random() - 0.5) * 0.1;
        
        // Change emotion sometimes
        if (Math.random() > 0.95) {
            newState.affectNode.emotion = emotions[Math.floor(Math.random() * emotions.length)];
        }
    } else {
        newState = {
            affectNode: {
                emotion: emotions[Math.floor(Math.random() * emotions.length)],
                valence: Math.random() * 1.6 - 0.8, // -0.8 to 0.8
                arousal: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
                confidence: Math.random() * 0.2 + 0.78, // 0.78 to 0.98
            },
            metrics: {
                excitationIndex: Math.random() * 0.5 + 0.4, // 0.4 - 0.9
                coherenceIndex: Math.random() * 0.2 + 0.75, // 0.75 - 0.95
                empathyScore: Math.random() * 0.15 + 0.8, // 0.8 - 0.95
            },
            userStateVector: {
                focus: Math.random() * 0.4 + 0.5, // 0.5 - 0.9
                stress: Math.random() * 0.4, // 0.0 - 0.4
                enthusiasm: Math.random() * 0.6 + 0.2, // 0.2 - 0.8
            }
        };
    }
    
    // Clamp all values between 0 and 1 (or -1 and 1 for valence)
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
    newState.affectNode.valence = clamp(newState.affectNode.valence, -1, 1);
    newState.affectNode.arousal = clamp(newState.affectNode.arousal, 0, 1);
    newState.affectNode.confidence = clamp(newState.affectNode.confidence, 0, 1);
    Object.keys(newState.metrics).forEach(key => (newState.metrics as any)[key] = clamp((newState.metrics as any)[key], 0, 1));
    Object.keys(newState.userStateVector).forEach(key => (newState.userStateVector as any)[key] = clamp((newState.userStateVector as any)[key], 0, 1));

    lastEmotionState = newState;
    return cachedRequest('emotion-engine-cache', async () => {
        await new Promise(res => setTimeout(res, 450));
        return newState;
    });
};

// --- Collective Intelligence Service ---
let lastCollectiveState: CollectiveIntelligenceState | null = null;
export const getCollectiveIntelligenceState = async (): Promise<CollectiveIntelligenceState | null> => {
    const trends = ["Stealth Fails", "Epic Moments", "Community Memes", "New Tactics"];
    const phases: CollectiveIntelligenceState['currentTrend']['phase'][] = ['Peak', 'Echo Delay', 'Decay', 'Renewal'];

    let newState: CollectiveIntelligenceState;

    if (lastCollectiveState && Math.random() < 0.95) { // very sticky
        newState = { ...lastCollectiveState };
        // SRS drifts around a central point
        newState.socialResonanceScore += (Math.random() - 0.5) * 0.05;
        newState.socialResonanceScore = Math.max(0, Math.min(1, newState.socialResonanceScore));
        
        // Clusters shift slightly
        const keys = Object.keys(newState.activeClusters) as (keyof CollectiveIntelligenceState['activeClusters'])[];
        const keyToIncrease = keys[Math.floor(Math.random() * keys.length)];
        const keyToDecrease = keys[Math.floor(Math.random() * keys.length)];
        if (keyToIncrease !== keyToDecrease) {
            newState.activeClusters[keyToIncrease] = Math.min(1, newState.activeClusters[keyToIncrease] + 0.02);
            newState.activeClusters[keyToDecrease] = Math.max(0, newState.activeClusters[keyToDecrease] - 0.02);
        }

    } else {
         newState = {
            socialResonanceScore: Math.random() * 0.5 + 0.2, // Start between 0.2 and 0.7
            activeClusters: {
                'Adrenaline-seekers': 0.35,
                'Strategy-watchers': 0.25,
                'Community-veterans': 0.20,
                'Casual passers': 0.20,
            },
            swarmDynamics: {
                attraction: "High-intensity moments",
                repulsion: "Slow pacing",
                alignment: "Shared humor references",
                momentum: "High, 24h cycle",
            },
            communicationMode: 'Individual',
            currentTrend: {
                name: trends[Math.floor(Math.random() * trends.length)],
                phase: 'Decay',
            }
        };
    }
    
    // Normalize clusters
    const totalCluster = Object.values(newState.activeClusters).reduce((sum, v) => sum + v, 0);
    for (const key in newState.activeClusters) {
        (newState.activeClusters as any)[key] /= totalCluster;
    }

    // Determine communication mode
    newState.communicationMode = newState.socialResonanceScore > 0.75 ? 'Swarm' : 'Individual';

    // Update trend phase
    if (Math.random() > 0.8) {
        const currentPhaseIndex = phases.indexOf(newState.currentTrend.phase);
        const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        newState.currentTrend.phase = phases[nextPhaseIndex];
        if(nextPhaseIndex === 0) { // New trend on 'Peak'
             newState.currentTrend.name = trends[Math.floor(Math.random() * trends.length)];
        }
    }
    
    lastCollectiveState = newState;
    return cachedRequest('collective-intelligence-cache', async () => {
        await new Promise(res => setTimeout(res, 400));
        return newState;
    });
};

// --- Cultural Intelligence Service ---
let lastCulturalState: CulturalIntelligenceState | null = null;
export const getCulturalIntelligenceState = async (): Promise<CulturalIntelligenceState | null> => {
    const humorTypes = ["dry-chaotic", "self-aware", "hyperbole", "understated"];
    const aesthetics = ["kinetic_realism", "neon_glitch", "minimalist", "retro_crt"];
    const narratives: CulturalIntelligenceState['narrativeAnalysis']['structure'][] = ['Setup → Conflict → Payoff', 'Slow Burn → Twist', 'Chaos → Relief'];
    const memes = ["'skill issue'", "'NPC moment'", "'bro really said 💀'"];
    
    let newState: CulturalIntelligenceState;

    if (lastCulturalState && Math.random() < 0.95) {
        newState = { ...lastCulturalState };
        newState.culturalConsistencyScore += (Math.random() - 0.48) * 0.05; // Tends to improve
        newState.culturalConsistencyScore = Math.max(0, Math.min(1, newState.culturalConsistencyScore));
        newState.culturalProfile.ironyLevel += (Math.random() - 0.5) * 0.05;
        newState.culturalProfile.ironyLevel = Math.max(0, Math.min(1, newState.culturalProfile.ironyLevel));
    } else {
        newState = {
            culturalProfile: {
                languageVariant: "EN-gaming",
                dominantMemeCycle: "2025-Q4",
                ironyLevel: Math.random() * 0.4 + 0.5, // 0.5 - 0.9
                humorType: humorTypes[Math.floor(Math.random() * humorTypes.length)],
                visualAesthetic: aesthetics[Math.floor(Math.random() * aesthetics.length)],
            },
            culturalConsistencyScore: Math.random() * 0.3 + 0.65, // 0.65 - 0.95
            narrativeAnalysis: {
                structure: narratives[Math.floor(Math.random() * narratives.length)],
                timeToConflict: Math.random() * 3 + 1.5, // 1.5s - 4.5s
                payoffSatisfaction: Math.random() * 0.2 + 0.78, // 0.78 - 0.98
            },
            trackedCulturalTokens: memes,
        };
    }
    
    lastCulturalState = newState;
    return cachedRequest('cultural-intelligence-cache', async () => {
        await new Promise(res => setTimeout(res, 500));
        return newState;
    });
};


// --- Linguistic Evolution Service ---
let lastLinguisticState: LinguisticEvolutionState | null = null;
export const getLinguisticEvolutionState = async (): Promise<LinguisticEvolutionState | null> => {
    const syntaxes: LinguisticEvolutionState['activeSyntax'][] = ['Sharp', 'Flow', 'Pulse'];
    let newState: LinguisticEvolutionState;

    if (lastLinguisticState && Math.random() < 0.9) {
        newState = { ...lastLinguisticState };
        newState.flowIndex += (Math.random() - 0.5) * 0.05;
        newState.flowIndex = Math.max(0, Math.min(1, newState.flowIndex));

        if (Math.random() > 0.95) {
            newState.activeSyntax = syntaxes[Math.floor(Math.random() * syntaxes.length)];
        }
        
        // Slightly evolve lexicon charge
        newState.lexiconDelta.forEach(item => {
            item.currentCharge += (Math.random() - 0.51) * 0.02; // Tend to decay
            item.currentCharge = Math.max(0, Math.min(1, item.currentCharge));
        });

    } else {
        newState = {
            flowIndex: Math.random() * 0.4 + 0.4, // 0.4 - 0.8
            activeSyntax: syntaxes[Math.floor(Math.random() * syntaxes.length)],
            lexiconDelta: [
                { word: 'based', currentCharge: 0.45, chargeHistory: [{ year: '2024', charge: 0.9 }, { year: '2025', charge: 0.45 }] },
                { word: 'clutch', currentCharge: 0.82, chargeHistory: [{ year: '2023', charge: 0.6 }, { year: '2025', charge: 0.82 }] },
                { word: 'rip', currentCharge: 0.35, chargeHistory: [{ year: '2024', charge: 0.7 }, { year: '2025', charge: 0.35 }] },
            ],
            temporalDecayExamples: [
                { word: 'epic', decayRate: 0.78 },
                { word: 'clean', decayRate: 0.32 },
            ],
        };
    }
    
    lastLinguisticState = newState;
    return cachedRequest('linguistic-evolution-cache', async () => {
        await new Promise(res => setTimeout(res, 600));
        return newState;
    });
};