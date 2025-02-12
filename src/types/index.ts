export type Agent = {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  firstMessage: string;
  isPublic: boolean;
  shareId: string | null;
  llmProvider: "OPENAI" | "ANTHROPIC";
  llmModel: string;
  llmTemperature: number;
  llmMaxTokens: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  knowledgeBase?: KnowledgeBase;
};

export type Message = {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  conversationId: string;
  createdAt: Date;
};

export type Conversation = {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

export type ChatRequest = {
  message: string;
  conversationId?: string;
};

export type ChatResponse = {
  message: string;
  conversationId: string;
};

export type ApiKey = {
  id: string;
  name: string;
  provider: "OPENAI" | "ANTHROPIC";
  key: string;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type KnowledgeBase = {
  id: string;
  name: string;
  agentId: string;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
};

export type Document = {
  id: string;
  name: string;
  type: "TEXT" | "URL";
  content: string;
  knowledgeBaseId: string;
  createdAt: Date;
  updatedAt: Date;
}; 