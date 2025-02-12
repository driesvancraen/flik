import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const documentCreateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(["TEXT", "URL"]),
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
    const body = documentCreateSchema.parse(json);

    console.log("Creating document:", {
      name: body.name,
      type: body.type,
      contentLength: body.content.length,
    });

    // Verify agent ownership and get knowledge base
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

    const document = await db.document.create({
      data: {
        name: body.name,
        content: body.content,
        type: body.type,
        knowledgeBaseId: agent.knowledgeBase.id,
      },
    });

    console.log("Document created:", {
      id: document.id,
      name: document.name,
      type: document.type,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Document creation error:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 