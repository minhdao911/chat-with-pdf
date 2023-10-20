import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "./theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AskPDF",
  description: "Get insights from PDF documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <ThemeProvider>
          <html lang="en">
            <body className={inter.className}>{children}</body>
            <Toaster />
          </html>
        </ThemeProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
