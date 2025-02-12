import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const [session, resolvedParams] = await Promise.all([
      auth(),
      params,
    ]);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    // Verify document belongs to this knowledge base
    const document = await db.document.findUnique({
      where: {
        id: resolvedParams.documentId,
        knowledgeBaseId: agent.knowledgeBase.id,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    await db.document.delete({
      where: {
        id: resolvedParams.documentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 