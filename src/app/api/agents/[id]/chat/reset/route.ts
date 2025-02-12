import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, resolvedParams] = await Promise.all([
      auth(),
      params,
    ]);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the agent and verify ownership
    const agent = await db.agent.findUnique({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    if (!agent) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Create a new conversation with initial messages
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

    return NextResponse.json({
      conversationId: conversation.id,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Reset chat error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 