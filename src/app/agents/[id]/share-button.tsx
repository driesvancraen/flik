"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ShareButtonProps {
  agentId: string;
  isPublic: boolean;
  shareId: string | null;
}

export function ShareButton({ agentId, isPublic, shareId }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleShare() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/share`, {
        method: "POST",
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      await navigator.clipboard.writeText(data.shareUrl);

      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnshare() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/share`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: "Agent is now private",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make agent private",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={isPublic ? handleUnshare : handleShare}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
    >
      <Share2 className="h-4 w-4" />
      {isPublic ? "Disable Sharing" : "Share"}
    </button>
  );
} 