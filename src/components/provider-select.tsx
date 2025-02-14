"use client";

import * as React from "react";
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

export const PROVIDERS = {
  OPENAI: {
    name: "OpenAI",
    description: "Leading provider of large language models like GPT-4 and GPT-3.5",
  },
  ANTHROPIC: {
    name: "Anthropic",
    description: "Provider of Claude models, known for their safety and reliability",
  },
  GEMINI: {
    name: "Gemini",
    description: "Google's latest AI models with strong multimodal capabilities",
  },
  MISTRAL: {
    name: "Mistral",
    description: "High-performance models with excellent efficiency and reasoning",
  },
} as const;

export type Provider = keyof typeof PROVIDERS;

interface ProviderSelectProps {
  value?: Provider;
  onChange: (value: Provider) => void;
}

export function ProviderSelect({ value, onChange }: ProviderSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedProvider = value ? PROVIDERS[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedProvider ? selectedProvider.name : "Select provider..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search providers..." />
          <CommandEmpty>No provider found.</CommandEmpty>
          <CommandGroup>
            {Object.entries(PROVIDERS).map(([key, provider]) => (
              <CommandItem
                key={key}
                value={key}
                onSelect={() => {
                  onChange(key as Provider);
                  setOpen(false);
                }}
                className="flex flex-col items-start py-3"
              >
                <div className="flex w-full items-center">
                  <span className="font-medium">{provider.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === key ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {provider.description}
                </p>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 