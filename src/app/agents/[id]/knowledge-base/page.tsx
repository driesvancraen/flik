"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "@/components/ui/use-toast";
import { FileText, Upload, Trash } from "lucide-react";
import type { KnowledgeBase, Document } from "@/types";

export default function KnowledgeBasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [uploadType, setUploadType] = useState<"TEXT" | "URL">("TEXT");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    async function loadKnowledgeBase() {
      try {
        const response = await fetch(`/api/agents/${resolvedParams.id}/knowledge-base`);
        if (response.status === 404) {
          router.push(`/agents/${resolvedParams.id}/knowledge-base/create`);
          return;
        }
        if (!response.ok) throw new Error("Failed to load knowledge base");
        const data = await response.json();
        setKnowledgeBase(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load knowledge base",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadKnowledgeBase();
  }, [resolvedParams.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/agents/${resolvedParams.id}/knowledge-base/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          content,
          type: uploadType,
        }),
      });

      if (!response.ok) throw new Error("Failed to add document");

      const document = await response.json();
      setKnowledgeBase((prev) => prev ? {
        ...prev,
        documents: [...prev.documents, document],
      } : null);

      setContent("");
      setName("");

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

  async function handleDelete(documentId: string) {
    try {
      const response = await fetch(
        `/api/agents/${resolvedParams.id}/knowledge-base/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete document");

      setKnowledgeBase((prev) => prev ? {
        ...prev,
        documents: prev.documents.filter((doc) => doc.id !== documentId),
      } : null);

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!knowledgeBase) return null;

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">{knowledgeBase.name}</h1>
          <p className="text-muted-foreground">
            Manage your knowledge base documents
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Add Document</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Document name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="TEXT"
                      checked={uploadType === "TEXT"}
                      onChange={(e) => setUploadType(e.target.value as "TEXT")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Text</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="URL"
                      checked={uploadType === "URL"}
                      onChange={(e) => setUploadType(e.target.value as "URL")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">URL</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  {uploadType === "TEXT" ? "Content" : "URL"}
                </label>
                {uploadType === "TEXT" ? (
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your text content..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={5}
                    required
                  />
                ) : (
                  <input
                    id="content"
                    type="url"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                Add Document
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Documents</h2>
            <div className="mt-4 space-y-4">
              {knowledgeBase.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No documents added yet
                </p>
              ) : (
                knowledgeBase.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-primary/10 p-2">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium">{document.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {document.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="text-sm text-destructive hover:text-destructive/90"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 