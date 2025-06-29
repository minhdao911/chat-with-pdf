"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import axios from "axios";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/send-email", data);
      if (response.status === 200) {
        reset();
        setIsOpen(false);
        setHasAttemptedSubmit(false);

        toast.success(
          "Thank you for contacting me! I'll get back to you soon."
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidSubmit = () => {
    setHasAttemptedSubmit(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-auto w-auto p-2 rounded-full hover:bg-purple-custom-300/50 dark:hover:bg-neutral-800 transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-neutral-600 dark:text-neutral-400 transition-colors" />
          <span className="sr-only">Contact</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact</DialogTitle>
          <DialogDescription>
            Send your feedback, questions, suggestions, anything. I&apos;d love
            to hear from you!
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name*
            </label>
            <Input
              id="name"
              placeholder="Your name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className={
                hasAttemptedSubmit && errors.name ? "border-red-500" : ""
              }
            />
            {hasAttemptedSubmit && errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email*
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={
                hasAttemptedSubmit && errors.email ? "border-red-500" : ""
              }
            />
            {hasAttemptedSubmit && errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message*
            </label>
            <Textarea
              id="message"
              placeholder="Whatever on your mind..."
              rows={4}
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 10,
                  message: "Message must be at least 10 characters",
                },
              })}
              className={
                hasAttemptedSubmit && errors.message ? "border-red-500" : ""
              }
            />
            {hasAttemptedSubmit && errors.message && (
              <p className="text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
