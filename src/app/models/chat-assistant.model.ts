export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    loading?: boolean;
    revealProgress?: string;
}
  
export interface ChatAssistantResponse {
    message: string;
    error?: string;
}


