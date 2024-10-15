import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/theme-provider";
import { FlagsProvider } from "@providers/flags-provider";

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
        <html lang="en" suppressHydrationWarning>
          <body className={inter.className}>
            <ThemeProvider>
              <FlagsProvider>{children}</FlagsProvider>
            </ThemeProvider>
          </body>
          <Toaster />
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}
