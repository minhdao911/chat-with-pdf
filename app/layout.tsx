import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/theme-provider";
import { DbEventsProvider } from "@providers/db-events-provider";

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
          <ThemeProvider>
            <DbEventsProvider>
              <body className={inter.className}>{children}</body>
            </DbEventsProvider>
          </ThemeProvider>
          <Toaster position="bottom-center" />
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}
