"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  agentId: string;
  isPublic: boolean;
  shareId: string | null;
}

export function ShareButton({ agentId, isPublic, shareId }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const shareUrl = shareId 
    ? `${window.location.origin}/agents/share/${shareId}`
    : null;

  async function handleShare() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/share`, {
        method: isPublic ? "DELETE" : "POST",
      });

      if (!response.ok) throw new Error();

      if (!isPublic) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.shareUrl);
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard. Anyone with this link can chat with your AI assistant.",
        });
      } else {
        toast({
          title: "Sharing Disabled",
          description: "Your AI assistant is now private.",
        });
      }

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: isPublic
          ? "Failed to make AI assistant private"
          : "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  }

  if (!isPublic) {
    return (
      <Button
        onClick={handleShare}
        disabled={isLoading}
        variant="outline"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Sharing Enabled
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share Link</h4>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can chat with your AI assistant
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <code className="flex-1 rounded bg-muted px-2 py-1 text-sm">
              {shareUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleShare}
            disabled={isLoading}
          >
            Disable Sharing
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 