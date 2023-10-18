import ClientOnly from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <ClientOnly>
      <div className="w-screen h-screen relative bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-200">
        <Link href="/" className="absolute top-8 left-8">
          <Image src="/logo.svg" alt="logo" width="140" height="100" />
        </Link>
        <div className="w-full h-full flex flex-col items-center justify-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-semibold text-gray-900">
              Chat with PDF
            </h1>
            <p className="max-w-2xl text-gray-700">
              Simply ask questions and get instant answers from the PDF, making
              information retrieval effortless and efficient. Say hello to a
              smarter way of interacting with your documents.
            </p>
          </div>
          <Button>
            <Link href="/chat" className="flex">
              Go to chat
              <Bot className="ml-1.5" size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </ClientOnly>
  );
}
