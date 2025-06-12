export interface IChatMessage {
    role: 'user' | 'assistant';
    content: string;
    loading?: boolean;
    revealProgress?: string;
}
  
export interface IChatAssistantResponse {
    message: string;
    error?: string;
}
