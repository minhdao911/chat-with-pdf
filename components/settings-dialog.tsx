"use client";

import { useState, useEffect } from "react";
import { SettingsIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { TooltipIcon } from "./ui/tooltip";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import ContactButton from "./contact-button";
import { useAppStore, ApiKeys } from "@/store/app-store";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function SettingsDialog() {
  const { apiKeys, setApiKeys } = useAppStore();
  const { user } = useUser();
  const [formData, setFormData] = useState<ApiKeys>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load current API keys when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...apiKeys });
    }
  }, [isOpen, apiKeys]);

  const handleInputChange = (key: keyof ApiKeys, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSave = () => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      // Filter out empty strings and set only non-empty values
      const filteredApiKeys: ApiKeys = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.trim()) {
          filteredApiKeys[key as keyof ApiKeys] = value.trim();
        }
      });

      setApiKeys(filteredApiKeys, user.id);
      toast.success("API keys added successfully");
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API keys");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <TooltipIcon icon={SettingsIcon} tooltipText="Settings" />
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 mb-2">
            <p className="text-sm font-medium">API Keys</p>
            <p className="text-sm text-muted-foreground">
              You can input your API keys here to continue using the app without
              the free credits. The keys will be encrypted and stored in your
              browser&apos;s local storage,{" "}
              <b>we don&apos;t store them in our servers</b>.
            </p>
          </div>
          <APIKeyInput
            label="OpenAI API Key"
            id="openai-api-key"
            placeholder="Enter your OpenAI API Key"
            value={formData.openai || ""}
            onChange={(value) => handleInputChange("openai", value)}
          />
          <APIKeyInput
            label="Anthropic API Key"
            id="anthropic-api-key"
            placeholder="Enter your Anthropic API Key"
            value={formData.anthropic || ""}
            onChange={(value) => handleInputChange("anthropic", value)}
          />
          <APIKeyInput
            label="Google API Key"
            id="google-api-key"
            placeholder="Enter your Google API Key"
            value={formData.google || ""}
            onChange={(value) => handleInputChange("google", value)}
          />
          <APIKeyInput
            label="DeepSeek API Key"
            id="deepseek-api-key"
            placeholder="Enter your DeepSeek API Key"
            value={formData.deepseek || ""}
            onChange={(value) => handleInputChange("deepseek", value)}
          />
          <div className="flex flex-col justify-end gap-2 mt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              Save
            </Button>
            <div className="flex items-center justify-center">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Need help?
              </span>
              <ContactButton />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const APIKeyInput = ({
  label,
  id,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-neutral-700 dark:text-neutral-300">
        {label}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-500"
      />
    </div>
  );
};
