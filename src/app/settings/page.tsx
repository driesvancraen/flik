"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import type { ApiKey } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const [newKey, setNewKey] = useState({
    name: "",
    provider: "OPENAI" as const,
    key: "",
  });

  useEffect(() => {
    async function loadApiKeys() {
      try {
        const response = await fetch("/api/api-keys");
        if (!response.ok) throw new Error("Failed to load API keys");
        const data = await response.json();
        console.log("Loaded API keys:", data);
        setApiKeys(data);
      } catch (error) {
        console.error("Error loading API keys:", error);
        toast({
          title: "Error",
          description: "Failed to load API keys",
          variant: "destructive",
        });
      }
    }

    loadApiKeys();
  }, [toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting API key:", newKey);
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newKey),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("API key creation failed:", error);
        throw new Error("Failed to add API key");
      }

      const apiKey = await response.json();
      console.log("API key created:", apiKey);
      setApiKeys((prev) => [apiKey, ...prev]);
      setNewKey({
        name: "",
        provider: "OPENAI",
        key: "",
      });

      toast({
        title: "Success",
        description: "API key added successfully",
      });
    } catch (error) {
      console.error("Error adding API key:", error);
      toast({
        title: "Error",
        description: "Failed to add API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete API key");
      }

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
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your API keys and preferences
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">API Keys</h2>
            <p className="text-sm text-muted-foreground">
              Add your API keys for different LLM providers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                value={newKey.name}
                onChange={(e) => setNewKey((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="My OpenAI Key"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="provider" className="text-sm font-medium">
                Provider
              </label>
              <select
                id="provider"
                value={newKey.provider}
                onChange={(e) => setNewKey((prev) => ({ ...prev, provider: e.target.value as "OPENAI" | "ANTHROPIC" }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="OPENAI">OpenAI</option>
                <option value="ANTHROPIC">Anthropic</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="key" className="text-sm font-medium">
                API Key
              </label>
              <input
                id="key"
                type="password"
                value={newKey.key}
                onChange={(e) => setNewKey((prev) => ({ ...prev, key: e.target.value }))}
                placeholder="sk-..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add API Key"}
            </button>
          </form>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div>
                  <h3 className="font-medium">{apiKey.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {apiKey.provider} • Added {new Date(apiKey.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(apiKey.id)}
                  className="text-sm text-destructive hover:text-destructive/90"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 