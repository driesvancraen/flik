export type DocumentType = "TEXT" | "URL";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  knowledgeBaseId: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  agentId: string;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  provider: "OPENAI" | "ANTHROPIC";
  key: string;
  createdAt: string;
  updatedAt: string;
} 