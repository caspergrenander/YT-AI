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

export interface UnifiedIntelligenceState {
    cognitiveIntegrityIndex: number;
    selfModel: SelfModelNode;
    graphSummary: {
        activeNodes: number;
        activeLinks: number;
    };
    cognitiveSynergy: CognitiveSynergyState;
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