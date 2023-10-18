"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FunctionComponent } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

const QueryProvider: FunctionComponent<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
