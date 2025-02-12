"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Trash } from "lucide-react";
import type { ApiKey } from "@/types";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [provider, setProvider] = useState<"OPENAI" | "ANTHROPIC">("OPENAI");
  const [apiKey, setApiKey] = useState("");
  const [name, setName] = useState("");

  async function loadApiKeys() {
    try {
      const response = await fetch("/api/api-keys");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          provider,
          key: apiKey,
        }),
      });

      if (!response.ok) throw new Error();

      const newKey = await response.json();
      setApiKeys((prev) => [newKey, ...prev]);
      setName("");
      setApiKey("");

      toast({
        title: "Success",
        description: "API key added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add API key",
        variant: "destructive",
      });
    }
  }

  async function handleProviderChange(provider: "OPENAI" | "ANTHROPIC") {
    setProvider(provider);
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      setApiKeys((prev) => prev.filter((key) => key.id !== id));

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your API keys and preferences
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">API Keys</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your API keys to use different LLM providers
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My OpenAI Key"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Provider</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="provider"
                    value="OPENAI"
                    checked={provider === "OPENAI"}
                    onChange={(e) => handleProviderChange("OPENAI")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">OpenAI</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="provider"
                    value="ANTHROPIC"
                    checked={provider === "ANTHROPIC"}
                    onChange={(e) => handleProviderChange("ANTHROPIC")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Anthropic</span>
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider} API key`}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add API Key
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div>
                  <h3 className="font-medium">{key.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {key.provider} • Added {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(key.id)}
                  className="text-sm text-destructive hover:text-destructive/90"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 