import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "react-hot-toast";
import { DbEventsProvider } from "@providers/db-events-provider";
import { UserProvider } from "@providers/user-provider";
import { ThemeProvider } from "next-themes";

import "./globals.css";

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
        <DbEventsProvider>
          <UserProvider>
            <html lang="en" suppressHydrationWarning>
              <body className={inter.className}>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                >
                  {children}
                </ThemeProvider>
                <Toaster />
              </body>
            </html>
          </UserProvider>
        </DbEventsProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
