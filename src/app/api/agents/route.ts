import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const agentCreateSchema = z.object({
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

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = agentCreateSchema.parse(json);

    const agent = await db.agent.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 