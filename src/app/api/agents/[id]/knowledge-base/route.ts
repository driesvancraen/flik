import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const knowledgeBaseCreateSchema = z.object({
  name: z.string().min(1),
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
    const body = knowledgeBaseCreateSchema.parse(json);

    // Verify agent ownership
    const agent = await db.agent.findUnique({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
      include: {
        knowledgeBase: true,
      },
    });

    if (!agent) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (agent.knowledgeBase) {
      return new NextResponse(
        "Agent already has a knowledge base",
        { status: 400 }
      );
    }

    const knowledgeBase = await db.knowledgeBase.create({
      data: {
        name: body.name,
        agentId: resolvedParams.id,
      },
    });

    return NextResponse.json(knowledgeBase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
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

    // First verify agent ownership
    const agent = await db.agent.findUnique({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    if (!agent) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const knowledgeBase = await db.knowledgeBase.findUnique({
      where: {
        agentId: resolvedParams.id,
      },
      include: {
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!knowledgeBase) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(knowledgeBase);
  } catch (error) {
    console.error("Knowledge base GET error:", error);
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

    // Verify agent ownership
    const agent = await db.agent.findUnique({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
      include: {
        knowledgeBase: true,
      },
    });

    if (!agent) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!agent.knowledgeBase) {
      return new NextResponse("Knowledge base not found", { status: 404 });
    }

    // Delete the knowledge base (this will cascade delete all documents)
    await db.knowledgeBase.delete({
      where: {
        id: agent.knowledgeBase.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Knowledge base DELETE error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 