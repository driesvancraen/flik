import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { LucideBot, Plus } from "lucide-react";
import type { Agent } from "@/types";

export default async function AgentsPage() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  const agents = await db.agent.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as Agent[];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Agents</h1>
          <p className="text-muted-foreground">
            Manage and interact with your AI agents
          </p>
        </div>
        <Link
          href="/agents/create"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <LucideBot className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">No agents found</h2>
            <p className="text-sm text-muted-foreground">
              Create your first AI agent to get started
            </p>
          </div>
          <Link
            href="/agents/create"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group relative overflow-hidden rounded-lg border bg-background p-6 transition-colors hover:bg-accent"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{agent.name}</h3>
                  {agent.isPublic && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {agent.description || "No description provided"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>{agent.llmProvider}</span>
                    <span>•</span>
                    <span>{agent.llmModel}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 