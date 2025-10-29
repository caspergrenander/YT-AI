export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ReasoningStep {
  step: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  isError?: boolean;
  attachment?: {
    data: string; // Base64 data URL
    mimeType: string;
    name: string;
  };
  feedback?: 'liked' | 'disliked' | null;
  metadata?: Record<string, any>;
  experts?: string[];
  confidence?: number;
  reasoningTrace?: ReasoningStep[];
  intent?: string;
  responseStyle?: string;
  safetyScore?: number;
  suggestedReplies?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface EvolutionLedger {
  version: string;
  level: string; // e.g., "L4 - Predictive Partner"
  last_calibration: string;
  recent_reinforcements: number;
  deprecated_rules: number;
  forecast_accuracy: number;
  progress_to_next_level?: number;
}

// Interfaces for Knowledge & Learning Architecture
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
        type: 'positive_correlation' | 'negative_correlation' | 'neutral' | 'causal_link';
        weight: number;
    }[];
}

export interface LearningQueueItem {
    topic: string;
    confidence: number;
}

export interface KnowledgeBase {
    rules: KnowledgeRule[];
    graphSummary: KnowledgeGraphNode[];
    learningQueue: LearningQueueItem[];
    lastValidation: string;
}
