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
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-5">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-semibold text-neutral-900">
              Chat with PDF
            </h1>
            <p className="max-w-2xl text-neutral-700">
              Simply ask questions and get instant answers from the PDF, making
              information retrieval effortless and efficient. Say hello to a
              smarter way of interacting with your documents.
            </p>
          </div>
          <Button className="bg-black/90 text-neutral-100 hover:bg-black/80">
            <Link href="/chat" className="flex">
              Go to chat
              <Bot className="ml-1.5" size={18} />
            </Link>
          </Button>
          <div className="backdrop-blur-sm bg-white/50 p-3 rounded-md mt-5">
            <Image
              src="/demo.png"
              alt="demo image of the app"
              width="1200"
              height="700"
              className="rounded-md"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
