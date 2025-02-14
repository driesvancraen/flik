"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Trash, Key, ExternalLink } from "lucide-react";
import type { ApiKey } from "@/types";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");

  useEffect(() => {
    loadApiKeys();
  }, []);

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

  async function handleSubmit(provider: "OPENAI" | "ANTHROPIC", key: string) {
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${provider} API Key`,
          provider,
          key,
        }),
      });

      if (!response.ok) throw new Error();

      const newKey = await response.json();
      setApiKeys((prev) => [newKey, ...prev.filter(k => k.provider !== provider)]);
      
      // Reset the input
      if (provider === "OPENAI") {
        setOpenaiKey("");
      } else {
        setAnthropicKey("");
      }

      toast({
        title: "Success",
        description: `${provider} API key updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    }
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

  const activeOpenaiKey = apiKeys.find(key => key.provider === "OPENAI" && key.isActive);
  const activeAnthropicKey = apiKeys.find(key => key.provider === "ANTHROPIC" && key.isActive);

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
            Configure your API keys for different LLM providers. Only one active key per provider is allowed.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* OpenAI Section */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">OpenAI</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeOpenaiKey ? "API key configured" : "No API key configured"}
                  </p>
                </div>
                {activeOpenaiKey && (
                  <button
                    onClick={() => handleDelete(activeOpenaiKey.id)}
                    className="text-sm text-destructive hover:text-destructive/90"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
              {!activeOpenaiKey ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit("OPENAI", openaiKey);
                  }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid gap-2">
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="Enter your OpenAI API key"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Get API key from OpenAI
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Save OpenAI Key
                  </button>
                </form>
              ) : null}
            </div>

            {/* Anthropic Section */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Anthropic</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeAnthropicKey ? "API key configured" : "No API key configured"}
                  </p>
                </div>
                {activeAnthropicKey && (
                  <button
                    onClick={() => handleDelete(activeAnthropicKey.id)}
                    className="text-sm text-destructive hover:text-destructive/90"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
              {!activeAnthropicKey ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit("ANTHROPIC", anthropicKey);
                  }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid gap-2">
                    <input
                      type="password"
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="Enter your Anthropic API key"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Get API key from Anthropic
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Save Anthropic Key
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 