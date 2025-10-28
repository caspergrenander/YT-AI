export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

// Fix: Define and export the ChatMessage interface, which was missing.
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
}

// Fix: Define and export the ChatSession interface, which was missing.
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}
