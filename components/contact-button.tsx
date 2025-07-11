"use client";

import { useEffect, useState } from "react";
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
import { useUser } from "@clerk/nextjs";
import { TooltipIcon } from "@/components/ui/tooltip";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactButton() {
  const { user } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/send-email", {
        ...data,
        email: data.email || user?.emailAddresses[0].emailAddress,
        userId: user?.id,
      });
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
      <DialogTrigger>
        <TooltipIcon icon={MessageCircle} tooltipText="Contact" />
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
              Name
            </label>
            <Input id="name" placeholder="Your name" {...register("name")} />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register("email", {
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
