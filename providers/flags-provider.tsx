"use client";

import { FeatureFlags } from "@constants";
import { getFeatureFlags } from "@lib/account";
import React, { createContext, useContext, useEffect, useState } from "react";

export type FlagsProviderProps = {
  flags: Record<FeatureFlags, boolean> | null;
  setFlags: React.Dispatch<React.SetStateAction<any>>;
};

const initialValues: FlagsProviderProps = {
  flags: null,
  setFlags: () => undefined,
};

const FlagsContext = createContext<FlagsProviderProps>(initialValues);
const { Provider } = FlagsContext;

export const FlagsProvider = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [flags, setFlags] = useState(initialValues.flags);

  useEffect(() => {
    (async () => {
      const flags = await getFeatureFlags();
      setFlags(flags);
    })();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/db-events");

    eventSource.onmessage = (event) => {
      if (event.data !== "heartbeat") {
        const data = JSON.parse(event.data);
        setFlags((prev) =>
          prev === null
            ? {
                [data.flag]: data.enabled,
              }
            : ({
                ...prev,
                [data.flag]: data.enabled,
              } as any)
        );
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return <Provider value={{ flags, setFlags }}>{children}</Provider>;
};

export const useFlags = () => {
  const flags = useContext(FlagsContext);
  return { ...flags };
};
