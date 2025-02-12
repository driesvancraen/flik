import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createChatChain } from "@/lib/langchain";
import * as z from "zod";
import { Document } from "@langchain/core/documents";
import type { Agent } from "@/types";

const chatRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

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

    const json = await req.json();
    const body = chatRequestSchema.parse(json);

    const { id } = resolvedParams;

    // Get the agent and verify ownership
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
      return new NextResponse("Not Found", { status: 404 });
    }

    // Get or create conversation
    let conversation = body.conversationId
      ? await db.conversation.findUnique({
          where: {
            id: body.conversationId,
            agentId: agent.id,
          },
          include: {
            messages: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        })
      : await db.conversation.create({
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
            messages: true,
          },
        });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    // Create documents from knowledge base
    const documents = agent.knowledgeBase?.documents.map(
      (doc) => new Document({ pageContent: doc.content })
    );

    // Add user message to conversation
    const userMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: body.message,
      },
    });

    // Create chat chain and generate response
    const chain = await createChatChain(agent as Agent, conversation.messages, documents);
    const response = await chain.invoke(body.message);

    // Add assistant message to conversation
    const assistantMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: response,
      },
    });

    return NextResponse.json({
      message: response,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    console.error("Chat error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 