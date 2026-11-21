import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DigitalTwinPage } from "./pages/DigitalTwinPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { ForecastingPage } from "./pages/ForecastingPage";
import { ScenarioLabPage } from "./pages/ScenarioLabPage";
import { RiskIntelligencePage } from "./pages/RiskIntelligencePage";
import { AIAgentPage } from "./pages/AIAgentPage";
import { DecisionMemoryPage } from "./pages/DecisionMemoryPage";
import { SettingsPage } from "./pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

type AppRoute =
  | "landing"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "digital-twin"
  | "transactions"
  | "forecasting"
  | "scenario-lab"
  | "risk-intelligence"
  | "ai-agent"
  | "decision-memory"
  | "settings";

const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>("dashboard");
  const { toggleDemoMode } = useWorkspace();

  const handleNavigate = (path: string) => {
    setCurrentRoute(path as AppRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExploreDemo = () => {
    toggleDemoMode(true);
    setCurrentRoute("dashboard");
  };

  // Standalone full-screen pages
  if (currentRoute === "landing") {
    return (
      <LandingPage
        onEnterApp={() => setCurrentRoute("dashboard")}
        onExploreDemo={handleExploreDemo}
      />
    );
  }

  if (currentRoute === "auth") {
    return (
      <AuthPage
        onSuccess={() => setCurrentRoute("dashboard")}
        onExploreDemo={handleExploreDemo}
      />
    );
  }

  if (currentRoute === "onboarding") {
    return <OnboardingPage onComplete={() => setCurrentRoute("dashboard")} />;
  }

  // Dashboard & workspace pages wrapped in AppLayout
  return (
    <AppLayout currentPath={currentRoute} onNavigate={handleNavigate}>
      {currentRoute === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
      {currentRoute === "digital-twin" && <DigitalTwinPage onNavigate={handleNavigate} />}
      {currentRoute === "transactions" && <TransactionsPage onNavigate={handleNavigate} />}
      {currentRoute === "forecasting" && <ForecastingPage onNavigate={handleNavigate} />}
      {currentRoute === "scenario-lab" && <ScenarioLabPage onNavigate={handleNavigate} />}
      {currentRoute === "risk-intelligence" && (
        <RiskIntelligencePage onNavigate={handleNavigate} />
      )}
      {currentRoute === "ai-agent" && <AIAgentPage onNavigate={handleNavigate} />}
      {currentRoute === "decision-memory" && <DecisionMemoryPage onNavigate={handleNavigate} />}
      {currentRoute === "settings" && <SettingsPage />}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </QueryClientProvider>
  );
};

export default App;
