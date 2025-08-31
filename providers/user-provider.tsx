"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@store/app-store";

async function initializeUser() {
  const response = await fetch("/api/user/initialize", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to initialize user");
  }
  return response.json();
}

interface UserContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserInitialization = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserInitialization must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { initialize } = useAppStore();
  const hasInitialized = useRef(false);

  // Only initialize when user is loaded and authenticated
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-initialization", user?.id],
    queryFn: initializeUser,
    enabled: isLoaded && !!user?.id,
    staleTime: Infinity, // Cache for the entire session
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useEffect(() => {
    if (data && !hasInitialized.current) {
      hasInitialized.current = true;
      initialize(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const contextValue: UserContextType = {
    isInitialized: !!data,
    isInitializing: isLoading,
    error: error as Error | null,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
