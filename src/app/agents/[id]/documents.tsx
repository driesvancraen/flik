"use client";

import { Upload, FileText, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import type { Document, KnowledgeBase } from "@/types";

interface DocumentsProps {
  agentId: string;
  knowledgeBase: KnowledgeBase | null;
}

export function Documents({ agentId, knowledgeBase }: DocumentsProps) {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch(`/api/agents/${agentId}/knowledge-base/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.get("type"),
          content: formData.get("content"),
        }),
      });

      if (!response.ok) throw new Error();

      form.reset();
      router.refresh();
      toast({
        title: "Success",
        description: "Document added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="rounded-lg border bg-background p-4">
      <h2 className="font-semibold">Knowledge Base</h2>
      <div className="mt-4">
        <h3 className="text-sm font-medium">
          {knowledgeBase?.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {knowledgeBase?.documents?.length || 0} documents
        </p>
        <div className="mt-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="TEXT"
                    defaultChecked
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Text</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="URL"
                    className="h-4 w-4"
                  />
                  <span className="text-sm">URL</span>
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                placeholder="Enter text or URL..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload className="h-4 w-4" />
              Add Document
            </button>
          </form>

          {knowledgeBase?.documents && knowledgeBase.documents.length > 0 ? (
            <div className="space-y-2">
              {knowledgeBase.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {doc.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/agents/${agentId}/knowledge-base/documents/${doc.id}`,
                          { method: "DELETE" }
                        );
                        if (!response.ok) throw new Error();
                        router.refresh();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to delete document",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="text-sm text-destructive hover:text-destructive/90"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 