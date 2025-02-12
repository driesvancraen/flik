"use client";

import { useState } from "react";
import { MessageCircle, RotateCcw } from "lucide-react";
import type { Message } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface ChatProps {
  agentId: string;
  initialMessages: Message[];
}

export function Chat({ agentId, initialMessages }: ChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const conversationId = messages[0]?.conversationId;

  async function handleReset() {
    try {
      // Create a new conversation with initial messages
      const response = await fetch(`/api/agents/${agentId}/chat/reset`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reset chat");
      }

      const data = await response.json();
      setMessages(data.messages);
      toast({
        title: "Success",
        description: "Chat has been reset",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset chat",
        variant: "destructive",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistically add user message
    const optimisticUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: "USER",
      conversationId: messages[0]?.conversationId || "",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: messages[0]?.conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      // Update messages with the actual response
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove optimistic message
        {
          ...optimisticUserMessage,
          id: data.userMessageId,
        },
        {
          id: data.assistantMessageId,
          content: data.message,
          role: "ASSISTANT",
          conversationId: data.conversationId,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h2 className="font-semibold">Chat</h2>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Chat
        </button>
      </div>
      <div className="flex h-[600px] flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages
              .filter(message => message.role !== "SYSTEM")
              .map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            {isLoading && (
              <div className="flex items-center justify-center">
                <div className="animate-pulse text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 