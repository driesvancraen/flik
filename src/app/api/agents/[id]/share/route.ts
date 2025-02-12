import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

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

    // Generate a new share ID if one doesn't exist
    const shareId = agent.shareId || nanoid(10);

    // Update the agent with the share ID and make it public
    const updatedAgent = await db.agent.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        shareId,
        isPublic: true,
      },
    });

    return NextResponse.json({
      shareId: updatedAgent.shareId,
      shareUrl: `${process.env.NEXTAUTH_URL}/agents/share/${updatedAgent.shareId}`,
    });
  } catch (error) {
    console.error("Share agent error:", error);
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

    // Remove share ID and make private
    await db.agent.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        shareId: null,
        isPublic: false,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Unshare agent error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 