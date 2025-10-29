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
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}