import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

    console.log("Deleting API key:", resolvedParams.id);

    // Verify ownership
    const apiKey = await db.apiKey.findUnique({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    if (!apiKey) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await db.apiKey.delete({
      where: {
        id: resolvedParams.id,
      },
    });

    console.log("API key deleted:", resolvedParams.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 