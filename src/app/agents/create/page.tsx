"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const OPENAI_MODELS = [
  "gpt-4-turbo-preview",
  "gpt-4",
  "gpt-3.5-turbo",
] as const;

const ANTHROPIC_MODELS = [
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-2.1",
] as const;

const agentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  firstMessage: z.string().min(1, "First message is required"),
  isPublic: z.boolean().default(false),
  llmProvider: z.enum(["OPENAI", "ANTHROPIC"]),
  llmModel: z.string().min(1, "Model is required"),
  llmTemperature: z.number().min(0).max(2).default(0.7),
  llmMaxTokens: z.number().min(1).max(32000).default(1000),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const defaultValues: Partial<AgentFormValues> = {
  llmProvider: "OPENAI",
  llmModel: "gpt-4-turbo-preview",
  llmTemperature: 0.7,
  llmMaxTokens: 1000,
  isPublic: false,
};

export default function CreateAgentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues,
  });

  const provider = form.watch("llmProvider");

  async function onSubmit(data: AgentFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create agent");
      }

      const agent = await response.json();
      toast({
        title: "Success",
        description: "Agent created successfully",
      });
      router.push(`/agents/${agent.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Create Agent</h1>
          <p className="text-muted-foreground">
            Configure your AI agent&apos;s behavior and settings.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                {...form.register("name")}
                id="name"
                placeholder="My AI Agent"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                {...form.register("description")}
                id="description"
                placeholder="A helpful AI assistant..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="systemPrompt" className="text-sm font-medium">
                System Prompt
              </label>
              <textarea
                {...form.register("systemPrompt")}
                id="systemPrompt"
                placeholder="You are a helpful AI assistant..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={5}
              />
              {form.formState.errors.systemPrompt && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.systemPrompt.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="firstMessage" className="text-sm font-medium">
                First Message
              </label>
              <textarea
                {...form.register("firstMessage")}
                id="firstMessage"
                placeholder="Hello! How can I help you today?"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
              />
              {form.formState.errors.firstMessage && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstMessage.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="llmProvider" className="text-sm font-medium">
                LLM Provider
              </label>
              <select
                {...form.register("llmProvider")}
                id="llmProvider"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onChange={(e) => {
                  form.setValue("llmProvider", e.target.value as "OPENAI" | "ANTHROPIC");
                  // Set a default model based on the selected provider
                  form.setValue(
                    "llmModel",
                    e.target.value === "OPENAI" ? OPENAI_MODELS[0] : ANTHROPIC_MODELS[0]
                  );
                }}
              >
                <option value="OPENAI">OpenAI</option>
                <option value="ANTHROPIC">Anthropic</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="llmModel" className="text-sm font-medium">
                Model
              </label>
              <select
                {...form.register("llmModel")}
                id="llmModel"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {provider === "OPENAI" ? (
                  OPENAI_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                ) : (
                  ANTHROPIC_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                )}
              </select>
              {form.formState.errors.llmModel && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.llmModel.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="llmTemperature" className="text-sm font-medium">
                Temperature
              </label>
              <input
                {...form.register("llmTemperature", { valueAsNumber: true })}
                type="number"
                id="llmTemperature"
                step="0.1"
                min="0"
                max="2"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="llmMaxTokens" className="text-sm font-medium">
                Max Tokens
              </label>
              <input
                {...form.register("llmMaxTokens", { valueAsNumber: true })}
                type="number"
                id="llmMaxTokens"
                min="1"
                max="32000"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                {...form.register("isPublic")}
                type="checkbox"
                id="isPublic"
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="isPublic" className="text-sm font-medium">
                Make this agent public
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Agent"}
          </button>
        </form>
      </div>
    </div>
  );
} 