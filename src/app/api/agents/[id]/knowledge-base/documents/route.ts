import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const documentCreateSchema = z.object({
  content: z.string().min(1),
  type: z.enum(["TEXT", "URL"]),
});

function generateDocumentName(content: string, type: "TEXT" | "URL"): string {
  if (type === "URL") {
    try {
      const url = new URL(content);
      return url.hostname + url.pathname;
    } catch {
      return content.slice(0, 50);
    }
  }
  
  // For text documents, take the first line or first 50 characters
  const firstLine = content.split('\n')[0];
  return firstLine.slice(0, 50);
}

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
        name: generateDocumentName(body.content, body.type),
        content: body.content,
        type: body.type,
        knowledgeBaseId: agent.knowledgeBase.id,
      },
    });

    console.log("Document created:", {
      id: document.id,
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