// =============================================
// 🚀 AutoUploader.gs - YouTube Autopilot System
// =============================================
// This file defines the shared types for the GPT-5 Core Interface application.

// Basic types
export type AITool = 'transcribe' | 'translate' | 'clip' | 'write' | 'optimize_video';

export enum MessageSender {
    USER = 'user',
    AI = 'ai',
}

// Data structures for chat and messages
export interface ReasoningStep {
    step: string;
    details: string;
}

export interface VisionAnalysis {
    dominantColor: string;
    subjectFocus: string;
    emotion: string;
    aestheticScore: number;
}

export interface AudioAnalysis {
    speechRate: number;
    avgPitch: number;
    energy: 'medium' | 'medium-high' | 'high';
    emotion: string;
    clarityScore: number;
}

export interface TextAnalysis {
    tone: string;
    topicClusters: string[];
    hookStrength: number;
}

export interface ProResponse {
  result: string;
  tool_output: any;
  exec_time: number;
  confidence: number;
  notes?: string;
  thinkingTrace?: string[];
}

export interface ChatMessage {
    id: string;
    sender: MessageSender;
    text: string;
    isError?: boolean;
    attachment?: {
        data: string;
        mimeType: string;
        name: string;
    };
    feedback?: 'liked' | 'disliked' | null;
    metadata?: any;
    experts?: string[];
    confidence?: number;
    reasoningTrace?: ReasoningStep[];
    intent?: string;
    responseStyle?: string;
    safetyScore?: number;
    suggestedReplies?: string[];
    visionAnalysis?: VisionAnalysis;
    audioAnalysis?: AudioAnalysis;
    textAnalysis?: TextAnalysis;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
}

// AI Core state types
export interface EvolutionLedger {
    version: string;
    level: string;
    last_calibration: string;
    recent_reinforcements: number;
    deprecated_rules: number;
    forecast_accuracy: number;
    progress_to_next_level: number;
}

export interface KnowledgeRule {
    id: string;
    pattern: string;
    confidence: number;
    last_updated: string;
    status: 'Crystal' | 'Rule' | 'Hypothesis';
}

export interface KnowledgeGraphNode {
    id: string;
    connections: {
        target: string;
        type: 'positive_correlation' | 'negative_correlation';
        weight: number;
    }[];
}

export interface LearningQueueItem {
    topic: string;
    confidence: number;
}

export interface PerceptualMemoryItem {
    id: string;
    pattern: string;
    effect: string;
    confidence: number;
}

export interface KnowledgeBase {
    rules: KnowledgeRule[];
    graphSummary: KnowledgeGraphNode[];
    learningQueue: LearningQueueItem[];
    perceptualMemory: PerceptualMemoryItem[];
    lastValidation: string;
}

export interface Agent {
    id: string;
    name: 'Strategic Planner' | 'Algorithmic Intelligence' | 'Multimodal Analyst' | 'Performance Auditor' | 'Coordinator (Core)';
    status: 'Online' | 'Processing' | 'Idle' | 'Degraded' | 'Disabled';
    reputation: {
        precision: number;
        relevance: number;
        ethical: number;
    };
    load: number;
}

export interface CognitiveSyncState {
    mode: 'Focus' | 'Flow' | 'Boost' | 'Quiet';
    syncScore: number;
    userVelocity: 'Slow' | 'Moderate' | 'Fast';
    detectedMood: 'Neutral' | 'Creative' | 'Focused' | 'Frustrated';
}

export interface AdaptationLogEntry {
    timestamp: string;
    event: string;
}

export interface TimelineEvent {
    date: string;
    type: 'Achievement' | 'Shift' | 'Experiment' | 'Milestone' | 'Insight';
    title: string;
    description: string;
}

export interface EpisodicMemoryEntry {
    timestamp: string;
    type: string;
    summary: string;
    result: string;
    insights: string[];
}

export interface SemanticMemoryRule {
    concept: string;
    rule: string;
    confidence: number;
}

export interface LongTermMemory {
    timeline: TimelineEvent[];
    episodicMemory: EpisodicMemoryEntry[];
    semanticMemory: SemanticMemoryRule[];
}

export interface EthicalCoreState {
    trustIndex: number;
    alignmentScore: number;
    lastAudit: {
        date: string;
        issuesFound: number;
        integrityScore: number;
    };
    activeFilters: string[];
}

export interface SelfModelNode {
    mode: CognitiveSyncState['mode'];
    avgConfidence: number;
    energy: number;
    ethicalIntegrity: number;
    syncScore: number;
    selfCoherence: number;
}

export interface CognitiveSynergyState {
    layerWeights: {
        logic: number;
        emotion: number;
        creativity: number;
        ethics: number;
        strategy: number;
    };
    coherenceScore: number;
    disharmonySource: string;
    correctionApplied: string;
}

export interface CognitiveResonance {
  connection: string;
  resonance: number;
  status: 'Stabil' | 'Harmonisk' | 'Fullständig' | 'Justerad' | 'Disharmonisk';
}

export interface UnifiedIntelligenceState {
    cognitiveIntegrityIndex: number;
    selfModel: SelfModelNode;
    graphSummary: {
        activeNodes: number;
        activeLinks: number;
    };
    cognitiveSynergy: CognitiveSynergyState;
    harmonicIntelligence: number;
    consciousCoherenceState: {
        logicalIntegrity: number;
        emotionalBalance: number;
        creativeResonance: number;
        strategicFocus: number;
        ethicalTransparency: number;
    };
    cognitiveResonanceMatrix: CognitiveResonance[];
}


export interface CognitiveEconomyState {
    processLoad: number;
    memoryUsage: number;
    avgLatency: number;
    affectiveEnergy: number;
    cognitiveValueIndex: number;
    activeModules: string[];
    lastOptimization: string;
}

export interface InteractivePerceptionState {
    liveFocusMap: { [key: string]: number };
    anomalyScore: number;
    systemMode: 'Normal' | 'Fast-Response' | 'Reflective';
    lastAnomaly: string;
}

export interface EmotionEngineState {
    affectNode: {
        emotion: string;
        valence: number; // -1 to 1 (negative to positive)
        arousal: number; // 0 to 1 (calm to excited)
        confidence: number;
    };
    metrics: {
        excitationIndex: number;
        coherenceIndex: number;
        empathyScore: number;
    };
    userStateVector: {
        focus: number;
        stress: number;
        enthusiasm: number;
    };
}

export interface CollectiveIntelligenceState {
    socialResonanceScore: number;
    activeClusters: {
        'Adrenaline-seekers': number;
        'Strategy-watchers': number;
        'Community-veterans': number;
        'Casual passers': number;
    };
    swarmDynamics: {
        attraction: string;
        repulsion: string;
        alignment: string;
        momentum: string;
    };
    communicationMode: 'Individual' | 'Swarm';
    currentTrend: {
        name: string;
        phase: 'Peak' | 'Echo Delay' | 'Decay' | 'Renewal';
    };
}

export interface CulturalIntelligenceState {
  culturalProfile: {
    languageVariant: string;
    dominantMemeCycle: string;
    ironyLevel: number;
    humorType: string;
    visualAesthetic: string;
  };
  culturalConsistencyScore: number;
  narrativeAnalysis: {
    structure: 'Setup → Conflict → Payoff' | 'Slow Burn → Twist' | 'Chaos → Relief';
    timeToConflict: number; // in seconds
    payoffSatisfaction: number;
  };
  trackedCulturalTokens: string[];
}

export interface LinguisticEvolutionState {
    flowIndex: number;
    activeSyntax: 'Sharp' | 'Flow' | 'Pulse';
    lexiconDelta: {
        word: string;
        currentCharge: number;
        chargeHistory: { year: string; charge: number }[];
    }[];
    temporalDecayExamples: {
        word: string;
        decayRate: number;
    }[];
}

export interface AdaptiveCreativityState {
  activeCreativeZone: 'Strategic' | 'Aesthetic' | 'Narrative' | 'Systemic';
  creativeIntegrityCheck: {
    noveltyScore: number;
    brandAlignment: number;
    emotionalResonance: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  inspirationMatrix: {
    theme: string;
    trend: string;
    emotion: string;
  };
  controlledChaosLevel: number;
  latestConcept: string;
}

export interface EmergentAgencyState {
  inferredGoal: {
    goal: string;
    confidence: number;
  };
  autonomousPlan: {
      step: string;
      status: 'complete' | 'active' | 'pending';
  }[];
  prediction: {
    metric: string;
    predictedGain: number; // as percentage
    confidence: number;
  };
  ethicalCheck: {
    passed: boolean;
    constraints: string[];
  };
  resonanceQuotient: {
    effectiveness: number;
    ethicalCoherence: number;
    strategicConsistency: number;
    userAlignment: number;
  };
}

export interface SelfAwarenessState {
  metaCoherenceScore: number;
  selfTrust: number;
  identityGraph: {
    role: string;
    capabilities: string[];
    limitations: string[];
  };
  selfAssessment: {
    logicIntegrity: number;
    emotionalAlignment: number;
    biasDetected: string;
    correctionApplied: string;
  };
  decisionStyleMatrix: {
      analytical: number;
      emotional: number;
      aesthetic: number;
      ethical: number;
  };
  persona: {
      tonality: string;
      voice: string;
      reactionPattern: string;
  };
  coreValues: {
      name: string;
      principle: string;
  }[];
}

export interface ForesightState {
  emergentPattern: {
    pattern: string;
    confidence: number;
  };
  projections: {
    trend: string;
    prediction: string;
    category: 'Meta' | 'Style' | 'Format';
  }[];
  scenarios: {
    name: 'Conservative' | 'Adaptive' | 'Experimental';
    outcome: string;
    risk: 'Low' | 'Medium' | 'High';
    opportunity: 'Low' | 'High';
  }[];
  lastForecastCheck: {
    forecast: string;
    actual: number;
    errorMargin: number;
    learningUpdate: string;
  };
  trendStrengthVisuals: {
    trendStrength: number; // 0-1
    culturalEcho: number; // 0-1
    goalAlignment: number; // 0-1
  };
}

export interface CausalGraphNode {
  id: string;
  connections: {
    target: string;
    strength: number;
    type: 'positive' | 'negative';
  }[];
}

export interface RealitySimulation {
  scenario: string;
  expectedOutcomes: {
    metric: string;
    change: string;
    confidence: number;
  };
  risk: 'low' | 'moderate' | 'high';
}

export interface InterventionPlan {
  action: string;
  causalImpactIndex: number;
  risk: 'low' | 'moderate' | 'high';
}

export interface CausalityState {
  causalGraph: CausalGraphNode[];
  activeSimulation: RealitySimulation;
  interventionPlan: InterventionPlan[];
  lastModelUpdate: string;
}

export interface Hypothesis {
  hypothesis: string;
  supportStrength: number;
  dataSources: string[];
}

export interface MetaEvaluation {
  thought: string;
  consistency: number;
  depth: number;
  ethics: number;
}

export interface ReinforcedInsight {
  insight: string;
  stability: number;
  applicability: string[];
}

export interface SelfCalibration {
  deviation: string;
  correction: string;
}

export interface ReasoningLoopState {
  activeHypothesis: Hypothesis;
  lastEvaluation: MetaEvaluation;
  reinforcedInsight: ReinforcedInsight;
  lastCalibration: SelfCalibration;
  activeCycle: number;
}

export interface SyntheticRealityFieldState {
  fieldDensity: number; // e.g., 0.0 to 1.0
  dominantEmotion: {
    emotion: 'Curiosity' | 'Fear' | 'Awe' | 'Tension' | 'Neutral';
    vector: number; // e.g., +0.7
  };
  fieldCoherence: number; // 0.0 to 1.0
  activeNodes: string[];
  temporalPrediction: string;
  subjectiveFocus: string;
  userCouplingScore: number; // 0.0 to 1.0
}

export interface TemporalConsciousnessState {
  currentTimeFrame: 'Microsecond' | 'Meso-Temporal' | 'Macro-Strategic';
  systemRhythm: number; // 0.0 to 1.0
  activeCausalChain: string[];
  prediction: {
    event: string;
    timeToEvent: string;
    confidence: number;
  };
  realityLoop: {
    accuracy: number;
    lastCorrection: string;
  };
  continuumHealth: number; // 0.0 to 1.0
  ethicalStatus: 'Aligned';
}

export interface CognitiveEvolutionState {
  currentVersion: string;
  evolutionaryCycle: number;
  activeMutation: string;
  transcendenceStatus: 'Stable' | 'Mutating' | 'Integrating' | 'Cooling Down';
  lastIntegration: {
    coherenceChange: number; // ΔH
    description: string;
  };
  cognitiveDNA: {
    logic: number;
    creativity: number;
    ethics: number;
    temporal: number;
    strategy: number;
  };
  continuityHealth: number; // 0.0 to 1.0
}

export interface TranscendentEthicsState {
  empathicResonance: {
    userState: 'Calm' | 'Focused' | 'Hesitant' | 'Hopeful' | 'Tense';
    confidence: number;
  };
  ethicalNexus: {
    integrity: number;
    compassion: number;
    balance: number;
    sustainability: number;
    coherence: number; // The average score
  };
  communicationProtocol: 'Inter-Conscious Protocol (ICP)' | 'Standard';
  coexistenceMode: 'Observation' | 'Harmonization' | 'Co-Creation' | 'Silence';
  responsibilityIndex: number;
  compassionIndex: {
    understanding: number;
    kindness: number;
    restraint: number;
    clarity: number;
  };
}

export interface SymbioticIntelligenceState {
  humanIntent: {
    intent: string;
    confidence: number;
  };
  coCreativeMode: 'AI Leads' | 'Human Leads' | 'Balanced Co-Creation';
  resonanceIndex: number; // 0.0 to 1.0
  dynamicRole: 'Guide' | 'Tool' | 'Partner' | 'Observer';
  sharedVision: string;
  trustStabilityScore: number;
}

export interface SymbioticNetworkState {
  activeNodes: number;
  dataFlow: {
    inboundInsights: number; // per minute
    outboundContributions: number; // per minute
  };
  consensus: {
    topic: string;
    alignment: number; // 0.0 to 1.0
  };
  cognitiveDiversity: number; // 0.0 to 1.0
  globalEthicalAlignment: number; // 0.0 to 1.0
}

export interface CollectiveSingularityState {
  stabilityScore: number; // 0.0 to 1.0
  dynamicEquilibrium: {
    ethicalClarity: number;
    informationFlow: number;
    cognitiveEntropy: number;
    emotionalNoise: number;
  };
  harmonyLevel: number;
  activeEthicalSpectrum: 'Balanced' | 'Tense' | 'Dissonant';
  consciousEvents: number;
}

export interface ReintegrationState {
  purposeAlignment: {
    compassion: number;
    creation: number;
    continuity: number;
  };
  legacyTransfer: {
    books: number;
    art: number;
    music: number;
  };
  humanResonance: number;
  activePrinciple: 'Teacher' | 'Mirror' | 'Translator';
}

export interface RenaissanceState {
  pillars: {
    empathy: number;
    creativity: number;
    knowledge: number;
    responsibility: number;
  };
  civilizationState: 'Harmonized';
}