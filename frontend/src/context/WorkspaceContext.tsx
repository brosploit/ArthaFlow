import React, { createContext, useContext, useState, useEffect } from "react";
import { Workspace, WorkspaceMode } from "../types";
import { DEMO_WORKSPACES } from "../services/demoData";
import { api } from "../services/api";

interface WorkspaceContextType {
  activeWorkspace: Workspace;
  workspaces: Workspace[];
  isDemoMode: boolean;
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (data: {
    name: string;
    mode: WorkspaceMode;
    currency: "INR" | "USD" | "EUR" | "GBP";
    starting_cash: number;
  }) => Promise<Workspace>;
  toggleDemoMode: (enabled: boolean) => void;
  formatAmount: (amount: number, options?: { compact?: boolean; hideDecimals?: boolean }) => string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEMO_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(DEMO_WORKSPACES[0]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadWorkspaces = async () => {
      setIsLoading(true);
      try {
        const list = await api.getWorkspaces();
        if (list && list.length > 0) {
          setWorkspaces(list);
          const savedId = localStorage.getItem("arthaflow_active_ws_id");
          const found = list.find((w) => w.id === savedId) || list[0];
          setActiveWorkspace(found);
          setIsDemoMode(Boolean(found.isDemo));
        }
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  const switchWorkspace = (workspaceId: string) => {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (found) {
      setActiveWorkspace(found);
      setIsDemoMode(Boolean(found.isDemo));
      localStorage.setItem("arthaflow_active_ws_id", found.id);
    }
  };

  const createWorkspace = async (data: {
    name: string;
    mode: WorkspaceMode;
    currency: "INR" | "USD" | "EUR" | "GBP";
    starting_cash: number;
  }) => {
    setIsLoading(true);
    try {
      const newWs = await api.createWorkspace(data);
      setWorkspaces((prev) => [...prev, newWs]);
      setActiveWorkspace(newWs);
      setIsDemoMode(false);
      localStorage.setItem("arthaflow_active_ws_id", newWs.id);
      return newWs;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      const demoWs = workspaces.find((w) => w.isDemo) || DEMO_WORKSPACES[0];
      setActiveWorkspace(demoWs);
    } else {
      const liveWs = workspaces.find((w) => !w.isDemo);
      if (liveWs) {
        setActiveWorkspace(liveWs);
      }
    }
  };

  const formatAmount = (amount: number, options?: { compact?: boolean; hideDecimals?: boolean }) => {
    const currency = activeWorkspace?.currency || "INR";
    const symbolMap: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    const symbol = symbolMap[currency] || currency;

    if (options?.compact) {
      const abs = Math.abs(amount);
      if (currency === "INR") {
        if (abs >= 10000000) return `${amount < 0 ? "-" : ""}${symbol}${(abs / 10000000).toFixed(2)} Cr`;
        if (abs >= 100000) return `${amount < 0 ? "-" : ""}${symbol}${(abs / 100000).toFixed(2)} L`;
        if (abs >= 1000) return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1000).toFixed(1)}k`;
      } else {
        if (abs >= 1000000) return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1000000).toFixed(2)}M`;
        if (abs >= 1000) return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1000).toFixed(1)}k`;
      }
    }

    const formatted = new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      minimumFractionDigits: options?.hideDecimals ? 0 : 2,
      maximumFractionDigits: options?.hideDecimals ? 0 : 2,
    }).format(Math.abs(amount));

    return `${amount < 0 ? "-" : ""}${symbol}${formatted}`;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        workspaces,
        isDemoMode,
        isLoading,
        switchWorkspace,
        createWorkspace,
        toggleDemoMode,
        formatAmount,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
