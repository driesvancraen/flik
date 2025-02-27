import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";
import { hashApiKey } from "@/lib/utils";

const apiKeyCreateSchema = z.object({
  name: z.string().min(1),
  provider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI", "MISTRAL"]),
  key: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching API keys for user:", session.user.id);
    const apiKeys = await db.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("Found API keys:", apiKeys.length);

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    console.log("Creating API key:", { ...json, key: "[REDACTED]" });
    const body = apiKeyCreateSchema.parse(json);

    // Deactivate existing keys for this provider
    await db.apiKey.updateMany({
      where: {
        userId: session.user.id,
        provider: body.provider,
      },
      data: {
        isActive: false,
      },
    });

    // Hash the API key before storing it
    const hashedKey = hashApiKey(body.key);

    const apiKey = await db.apiKey.create({
      data: {
        name: body.name,
        provider: body.provider,
        key: hashedKey, // Store the hashed key
        userId: session.user.id,
        isActive: true,
      },
    });

    console.log("API key created:", { id: apiKey.id, provider: apiKey.provider });
    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("Error creating API key:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 