import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { GameProvider, useGame } from "./contexts/GameContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import AuthPage from "./pages/AuthPage";
import Welcome from "./pages/Welcome";
import WorldMap from "./pages/WorldMap";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { DevPanel } from "./components/DevPanel";
import { SteamControls } from "./components/SteamControls";

// Code splitting for heavy screens & interactive simulators
const ChallengeList = lazy(() => import("./pages/ChallengeList"));
const GameArena = lazy(() => import("./pages/GameArena"));
const BossArena = lazy(() => import("./pages/BossArena"));
const Profile = lazy(() => import("./pages/Profile"));
const GitSimulator = lazy(() =>
  import("./components/GitSimulator").then((m) => ({ default: m.GitSimulator }))
);
const DockerSimulator = lazy(() =>
  import("./components/DockerSimulator").then((m) => ({ default: m.DockerSimulator }))
);
const NetworkSimulator = lazy(() =>
  import("./components/NetworkSimulator").then((m) => ({ default: m.NetworkSimulator }))
);
const CyberSecSimulator = lazy(() =>
  import("./components/CyberSecSimulator").then((m) => ({ default: m.CyberSecSimulator }))
);

type View =
  | { name: "welcome" }
  | { name: "map" }
  | { name: "list"; worldId: string }
  | { name: "arena"; challengeId: string; worldId: string }
  | { name: "boss"; worldId: string }
  | { name: "profile" }
  | { name: "git-simulator" }
  | { name: "docker-simulator" }
  | { name: "network-simulator" }
  | { name: "cybersec-simulator" };

function ViewFallback() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-3 text-slate-300">
      <Loader2 className="size-7 animate-spin text-sky-400" />
      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
        {t("loadingModule")}
      </span>
    </div>
  );
}

function AppContent() {
  const { state, hasHydrated } = useGame();
  const [view, setViewState] = useState<View>(() => {
    if (typeof window !== "undefined" && window.history.state?.pythonQuestView) {
      return window.history.state.pythonQuestView as View;
    }
    const saved = localStorage.getItem("python_quest_current_view");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { name: "welcome" };
      }
    }
    return { name: "welcome" };
  });

  const navigate = useCallback((nextView: View, replace = false) => {
    setViewState(nextView);
    if (typeof window !== "undefined") {
      if (replace) {
        window.history.replaceState({ pythonQuestView: nextView }, "");
      } else {
        window.history.pushState({ pythonQuestView: nextView }, "");
      }
    }
  }, []);

  // Ensure initial history state is populated and listen for browser Back/Forward buttons
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.history.state?.pythonQuestView) {
      window.history.replaceState({ pythonQuestView: view }, "");
    }
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.pythonQuestView) {
        setViewState(event.state.pythonQuestView as View);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist view changes
  useEffect(() => {
    localStorage.setItem("python_quest_current_view", JSON.stringify(view));
    window.scrollTo(0, 0);
  }, [view]);

  // Handle initial redirection se o usuario ja viu a introducao
  useEffect(() => {
    if (hasHydrated && state.hasSeenTutorial && view.name === "welcome") {
      navigate({ name: "map" }, true);
    }
  }, [hasHydrated, state.hasSeenTutorial, view.name, navigate]);

  const goWelcome = () => navigate({ name: "welcome" });
  const goMap = () => navigate({ name: "map" });
  const goProfile = () => navigate({ name: "profile" });
  const goList = (worldId: string) => navigate({ name: "list", worldId });
  const goArena = (challengeId: string, worldId: string) =>
    navigate({ name: "arena", challengeId, worldId });
  const goBoss = (worldId: string) => navigate({ name: "boss", worldId });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Suspense fallback={<ViewFallback />}>
        {view.name === "welcome" && <Welcome onStart={goMap} />}

        {view.name === "map" && (
          <WorldMap
            onSelectWorld={goList}
            onOpenProfile={goProfile}
            onOpenGitSimulator={() => navigate({ name: "git-simulator" })}
            onOpenDockerSimulator={() => navigate({ name: "docker-simulator" })}
            onOpenNetworkSimulator={() => navigate({ name: "network-simulator" })}
            onOpenCyberSecSimulator={() => navigate({ name: "cybersec-simulator" })}
          />
        )}

        {view.name === "git-simulator" && <GitSimulator onBack={goMap} />}

        {view.name === "docker-simulator" && <DockerSimulator onBack={goMap} />}

        {view.name === "network-simulator" && <NetworkSimulator onBack={goMap} />}
        {view.name === "cybersec-simulator" && <CyberSecSimulator onBack={goMap} />}

        {view.name === "list" && (
          <ChallengeList
            worldId={view.worldId}
            onSelectChallenge={(id) => goArena(id, view.worldId)}
            onSelectBoss={() => goBoss(view.worldId)}
            onBack={goMap}
            onBackToHome={goWelcome}
            onOpenProfile={goProfile}
          />
        )}

        {view.name === "boss" && (
          <BossArena
            worldId={view.worldId}
            onBack={() => goList(view.worldId)}
          />
        )}

        {view.name === "arena" && (
          <GameArena
            challengeId={view.challengeId}
            onBack={() => goList(view.worldId)}
            onBackToHome={goWelcome}
            onNext={(nextId) =>
              nextId ? goArena(nextId, view.worldId) : goList(view.worldId)
            }
          />
        )}

        {view.name === "profile" && <Profile onBack={goMap} />}
      </Suspense>

      {view.name !== "welcome" && <PomodoroTimer />}

      <Toaster position="top-center" expand={false} theme="dark" />
    </div>
  );
}

function AppContentWrapper() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-300">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <Toaster position="top-center" expand={false} theme="dark" />
      </>
    );
  }

  return (
    <GameProvider userId={user?.id}>
      <PomodoroProvider>
        <AppContent />
        <SteamControls />
        {import.meta.env.DEV && <DevPanel />}
      </PomodoroProvider>
    </GameProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <LanguageProvider>
        <AuthProvider>
          <AppContentWrapper />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
