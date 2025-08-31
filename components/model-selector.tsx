"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppStore } from "@store/app-store";
import { MODEL_OPTIONS } from "@/constants/models";

interface ModelSelectorProps {
  className?: string;
}

const ModelSelector = ({ className }: ModelSelectorProps) => {
  const { selectedModel, setSelectedModel } = useAppStore();

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  // Get the label for the selected model
  const selectedModelLabel = MODEL_OPTIONS.find(
    (option) => option.value === selectedModel
  )?.label;

  return (
    <div className={className}>
      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="w-full text-xs gap-2">
          <SelectValue placeholder="Select model">
            {selectedModelLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MODEL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                    {option.provider}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
