import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { createClient } from "@supabase/supabase-js";

import type { Agent, Message } from "@/types";

export async function createChatModel(agent: Agent) {
  // Get the API key from the agent's configuration
  const apiKey = await getApiKeyForAgent(agent);
  if (!apiKey) {
    throw new Error(`No API key found for ${agent.llmProvider}`);
  }

  const modelConfig = {
    temperature: agent.llmTemperature,
    maxTokens: agent.llmMaxTokens,
  };

  if (agent.llmProvider === "OPENAI") {
    return new ChatOpenAI({
      modelName: agent.llmModel,
      openAIApiKey: apiKey,
      ...modelConfig,
    });
  } else {
    return new ChatAnthropic({
      modelName: agent.llmModel,
      anthropicApiKey: apiKey,
      ...modelConfig,
    });
  }
}

export async function createVectorStore(documents: Document[], agent: Agent) {
  // We still need OpenAI for creating embeddings, but we'll store them in Supabase
  const openAIKey = await getOpenAIKey(agent.userId);
  if (!openAIKey) {
    throw new Error("OpenAI API key is required for embeddings. Please add an OpenAI API key in settings.");
  }

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: openAIKey,
  });

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }

  const client = createClient(supabaseUrl, supabaseServiceKey);

  // Create vector store
  return await SupabaseVectorStore.fromDocuments(
    documents,
    embeddings,
    {
      client,
      tableName: "documents", // Make sure this table exists with pgvector extension
      queryName: "match_documents",
    }
  );
}

export async function createChatChain(agent: Agent, messages: Message[], knowledgeBase?: Document[]) {
  const model = await createChatModel(agent);
  
  // Filter out system messages from chat history
  const chatHistory = messages
    .filter(msg => msg.role !== "SYSTEM")
    .map((msg) => {
      switch (msg.role) {
        case "USER":
          return new HumanMessage(msg.content);
        case "ASSISTANT":
          return new AIMessage(msg.content);
        default:
          throw new Error(`Unknown message role: ${msg.role}`);
      }
    });

  if (knowledgeBase && knowledgeBase.length > 0) {
    const vectorStore = await createVectorStore(knowledgeBase, agent);
    
    return RunnableSequence.from([
      async (input: string) => {
        const results = await vectorStore.similaritySearch(input, 3);
        const context = results.map((doc) => doc.pageContent).join("\n\n");
        return [
          new SystemMessage(`${agent.systemPrompt}\n\nRelevant context:\n${context}`),
          ...chatHistory,
          new HumanMessage(input),
        ];
      },
      model,
      new StringOutputParser(),
    ]);
  }

  return RunnableSequence.from([
    async (input: string) => [
      new SystemMessage(agent.systemPrompt),
      ...chatHistory,
      new HumanMessage(input),
    ],
    model,
    new StringOutputParser(),
  ]);
}

async function getApiKeyForAgent(agent: Agent) {
  const { db } = await import("@/lib/db");
  const apiKey = await db.apiKey.findFirst({
    where: {
      userId: agent.userId,
      provider: agent.llmProvider,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return apiKey?.key;
}

async function getOpenAIKey(userId: string) {
  const { db } = await import("@/lib/db");
  const apiKey = await db.apiKey.findFirst({
    where: {
      userId: userId,
      provider: "OPENAI",
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return apiKey?.key;
} 