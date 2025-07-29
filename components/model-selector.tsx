"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppStore } from "@store/app-store";

const MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

interface ModelSelectorProps {
  className?: string;
}

const ModelSelector = ({ className }: ModelSelectorProps) => {
  const { selectedModel, setSelectedModel } = useAppStore();

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  return (
    <div className={className}>
      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="w-full text-xs">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {MODEL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
