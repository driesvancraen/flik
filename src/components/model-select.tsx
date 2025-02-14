"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const PROVIDER_MODELS = {
  OPENAI: [
    { 
      id: "gpt-4-turbo-preview",
      name: "GPT-4 Turbo",
      description: "Most capable GPT-4 model, optimized for speed and cost",
      contextWindow: "128K tokens",
      pricing: "$0.01/1K input, $0.03/1K output"
    },
    { 
      id: "gpt-4",
      name: "GPT-4",
      description: "Most reliable GPT-4 model for complex tasks",
      contextWindow: "8K tokens",
      pricing: "$0.03/1K input, $0.06/1K output"
    },
    { 
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      description: "Fast and cost-effective for most use cases",
      contextWindow: "16K tokens",
      pricing: "$0.0005/1K input, $0.0015/1K output"
    },
  ],
  ANTHROPIC: [
    { 
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      description: "Most powerful model with exceptional understanding",
      contextWindow: "200K tokens",
      pricing: "$0.015/1K input, $0.075/1K output"
    },
    { 
      id: "claude-3-sonnet-20240229",
      name: "Claude 3 Sonnet",
      description: "Excellent balance of intelligence and speed",
      contextWindow: "200K tokens",
      pricing: "$0.003/1K input, $0.015/1K output"
    },
    { 
      id: "claude-3-haiku-20240307",
      name: "Claude 3 Haiku",
      description: "Fast and efficient for shorter tasks",
      contextWindow: "200K tokens",
      pricing: "$0.0025/1K input, $0.0125/1K output"
    },
    { 
      id: "claude-2.1",
      name: "Claude 2.1",
      description: "Previous generation model, still powerful",
      contextWindow: "100K tokens",
      pricing: "$0.008/1K input, $0.024/1K output"
    },
  ],
  GEMINI: [
    { 
      id: "gemini-1.0-pro",
      name: "Gemini 1.0 Pro",
      description: "Balanced performance for most tasks",
      contextWindow: "32K tokens",
      pricing: "$0.00025/1K input, $0.0005/1K output"
    },
    { 
      id: "gemini-1.0-pro-vision",
      name: "Gemini 1.0 Pro Vision",
      description: "Specialized for vision and multimodal tasks",
      contextWindow: "32K tokens",
      pricing: "$0.00025/1K input, $0.0005/1K output"
    },
  ],
  MISTRAL: [
    { 
      id: "mistral-large-latest",
      name: "Mistral Large",
      description: "Most capable model for complex reasoning",
      contextWindow: "32K tokens",
      pricing: "$0.008/1K input, $0.024/1K output"
    },
    { 
      id: "mistral-medium-latest",
      name: "Mistral Medium",
      description: "Great balance of performance and cost",
      contextWindow: "32K tokens",
      pricing: "$0.003/1K input, $0.009/1K output"
    },
    { 
      id: "mistral-small-latest",
      name: "Mistral Small",
      description: "Fast and cost-effective for simple tasks",
      contextWindow: "32K tokens",
      pricing: "$0.0006/1K input, $0.0018/1K output"
    },
  ],
} as const;

export type Provider = keyof typeof PROVIDER_MODELS;
export type Model = (typeof PROVIDER_MODELS)[Provider][number];

interface ModelSelectProps {
  provider: Provider;
  value?: string;
  onChange: (value: string) => void;
}

export function ModelSelect({ provider, value, onChange }: ModelSelectProps) {
  const [open, setOpen] = React.useState(false);

  const models = PROVIDER_MODELS[provider];
  const selectedModel = models.find((model) => model.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedModel ? selectedModel.name : "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup>
            {models.map((model) => (
              <CommandItem
                key={model.id}
                value={model.id}
                onSelect={() => {
                  onChange(model.id);
                  setOpen(false);
                }}
                className="flex flex-col items-start py-3"
              >
                <div className="flex w-full items-center">
                  <span className="font-medium">{model.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === model.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {model.description}
                </p>
                <div className="mt-1 flex w-full items-center gap-4 text-xs text-muted-foreground">
                  <span>{model.contextWindow}</span>
                  <span>{model.pricing}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 