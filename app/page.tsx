import ClientOnly from "@/components/client-only";
import Image from "next/image";
import Link from "next/link";
import { GoToChatButton } from "./page-client";

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
            <p className="max-w-2xl text-neutral-700 text-center">
              Ask questions and receive instant responses from your PDFs.
              It&apos;s an easy-to-use tool for quick information retrieval.
            </p>
          </div>
          <GoToChatButton />
          <div className="backdrop-blur-sm bg-white/50 p-3 rounded-md mt-5">
            <Image
              src="/demo.webp"
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
