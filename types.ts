export interface KnowledgeDocument {
    id: string;
    name: string;
    type: 'pdf' | 'docx' | 'txt';
    size: number;
    uploadDate: number;
    content: string;
}

export interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
    isError?: boolean;
}

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
}

export interface AppState {
    documents: KnowledgeDocument[];
    isProcessing: boolean;
}