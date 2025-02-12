import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Chat } from "../../[id]/chat";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export default async function SharedAgentPage({ params }: PageProps) {
  const { shareId } = await params;

  const agent = await db.agent.findUnique({
    where: {
      shareId,
      isPublic: true,
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

  // Get or create a conversation for this shared agent
  const conversation = await db.conversation.create({
    data: {
      agentId: agent.id,
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
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">
            {agent.description || "No description provided"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
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

            {agent.knowledgeBase && (
              <div className="rounded-lg border bg-background p-4">
                <h2 className="font-semibold">Knowledge Base</h2>
                <div className="mt-4">
                  <h3 className="text-sm font-medium">
                    {agent.knowledgeBase.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {agent.knowledgeBase.documents.length} documents
                  </p>
                </div>
              </div>
            )}
          </div>

          <Chat agentId={agent.id} initialMessages={conversation.messages} />
        </div>
      </div>
    </div>
  );
} 