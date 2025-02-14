import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MessageCircle, Settings, Share2 } from "lucide-react";
import Link from "next/link";
import { Chat } from "./chat";
import { Documents } from "./documents";
import { ShareButton } from "./share-button";
import type { Agent } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentPage({ params }: PageProps) {
  const [session, resolvedParams] = await Promise.all([
    auth(),
    params,
  ]);

  if (!session?.user) {
    return null;
  }

  const { id } = resolvedParams;

  const agent = await db.agent.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      knowledgeBase: {
        include: {
          documents: true,
        },
      },
    },
  });

  if (!agent) {
    notFound();
  }

  const apiKey = await db.apiKey.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      provider: agent.llmProvider,
    },
  });

  // Get the latest conversation or create a new one
  const conversation = await db.conversation.findFirst({
    where: {
      agentId: id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  }) || await db.conversation.create({
    data: {
      agentId: id,
      messages: {
        create: [
          {
            role: "SYSTEM",
            content: agent.systemPrompt,
          },
          {
            role: "ASSISTANT",
            content: agent.firstMessage,
          },
        ],
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return (
    <div className="container py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">
            {agent.description || "No description provided"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton
            agentId={agent.id}
            isPublic={agent.isPublic}
            shareId={agent.shareId}
          />
          <Link
            href={`/agents/${agent.id}/settings`}
            className="inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold">Model Settings</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="flex items-center gap-2">
                  {agent.llmProvider}
                  {apiKey ? (
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500" title="API key installed" />
                  ) : (
                    <span className="inline-flex h-2 w-2 rounded-full bg-destructive" title="No API key found" />
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Model</dt>
                <dd>{agent.llmModel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Temperature</dt>
                <dd>{agent.llmTemperature}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Max Tokens</dt>
                <dd>{agent.llmMaxTokens}</dd>
              </div>
              {!apiKey && (
                <div className="mt-2 text-xs text-destructive">
                  <Link href="/settings/api-keys" className="inline-flex items-center gap-1 hover:underline">
                    <Settings className="h-3 w-3" />
                    Add {agent.llmProvider} API key
                  </Link>
                </div>
              )}
            </dl>
          </div>

          <Documents agentId={agent.id} knowledgeBase={agent.knowledgeBase} />
        </div>

        <Chat 
          agentId={agent.id} 
          initialMessages={conversation.messages} 
          hasApiKey={!!apiKey}
          provider={agent.llmProvider}
        />
      </div>
    </div>
  );
} 