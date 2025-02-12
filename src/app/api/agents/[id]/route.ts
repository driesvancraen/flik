import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const agentUpdateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  systemPrompt: z.string().min(1),
  firstMessage: z.string().min(1),
  isPublic: z.boolean().default(false),
  llmProvider: z.enum(["OPENAI", "ANTHROPIC"]),
  llmModel: z.string().min(1),
  llmTemperature: z.number().min(0).max(2),
  llmMaxTokens: z.number().min(1).max(32000),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agent = await db.agent.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!agent) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = agentUpdateSchema.parse(json);

    const agent = await db.agent.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!agent) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updatedAgent = await db.agent.update({
      where: {
        id: params.id,
      },
      data: body,
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
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

    const { id } = resolvedParams;

    // Get the agent and verify ownership
    const agent = await db.agent.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!agent) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Delete the agent and all related data (conversations, messages, knowledge base, documents)
    await db.agent.delete({
      where: {
        id: agent.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete agent error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 