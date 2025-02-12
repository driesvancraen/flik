import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MessageCircle, Share2, Settings } from "lucide-react";
import Link from "next/link";
import { Chat } from "./chat";

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
      knowledgeBase: true,
    },
  });

  if (!agent) {
    notFound();
  }

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
          <Link
            href={`/agents/${agent.id}/settings`}
            className="inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          {agent.isPublic && (
            <button className="inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold">Model Settings</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Provider</dt>
                <dd>{agent.llmProvider}</dd>
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
            </dl>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold">Knowledge Base</h2>
            {agent.knowledgeBase ? (
              <div className="mt-4">
                <h3 className="text-sm font-medium">
                  {agent.knowledgeBase.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {/* Add document count here */}
                  0 documents
                </p>
                <Link
                  href={`/agents/${agent.id}/knowledge-base`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Manage Documents
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  No knowledge base attached
                </p>
                <Link
                  href={`/agents/${agent.id}/knowledge-base/create`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Create Knowledge Base
                </Link>
              </div>
            )}
          </div>
        </div>

        <Chat agentId={agent.id} initialMessages={conversation.messages} />
      </div>
    </div>
  );
} 