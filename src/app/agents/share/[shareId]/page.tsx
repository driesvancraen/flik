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
    select: {
      id: true,
      name: true,
      description: true,
      firstMessage: true,
      llmProvider: true,
      llmModel: true,
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
              <h2 className="font-semibold">About this AI Assistant</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Provider</dt>
                  <dd>{agent.llmProvider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Model</dt>
                  <dd>{agent.llmModel}</dd>
                </div>
              </dl>
            </div>
          </div>

          <Chat agentId={agent.id} initialMessages={conversation.messages} />
        </div>
      </div>
    </div>
  );
} 