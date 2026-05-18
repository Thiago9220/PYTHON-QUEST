import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { GameProvider, useGame } from "./contexts/GameContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthPage from "./pages/AuthPage";
import Welcome from "./pages/Welcome";
import WorldMap from "./pages/WorldMap";
import ChallengeList from "./pages/ChallengeList";
import GameArena from "./pages/GameArena";
import BossArena from "./pages/BossArena";
import Profile from "./pages/Profile";
import { GitSimulator } from "./components/GitSimulator";
import { DockerSimulator } from "./components/DockerSimulator";
import { NetworkSimulator } from "./components/NetworkSimulator";
import { CyberSecSimulator } from "./components/CyberSecSimulator";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { DevPanel } from "./components/DevPanel";

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

function AppContent() {
  const { state, hasHydrated } = useGame();
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem("python_quest_current_view");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { name: "welcome" };
      }
    }
    return { name: "welcome" };
  });

  // Persist view changes
  useEffect(() => {
    localStorage.setItem("python_quest_current_view", JSON.stringify(view));
    window.scrollTo(0, 0);
  }, [view]);

  // Handle initial redirection se o usuario ja viu a introducao
  useEffect(() => {
    if (hasHydrated && state.hasSeenTutorial && view.name === "welcome") {
      setView({ name: "map" });
    }
  }, [hasHydrated, state.hasSeenTutorial, view.name]);

  const goWelcome = () => setView({ name: "welcome" });
  const goMap = () => setView({ name: "map" });
  const goProfile = () => setView({ name: "profile" });
  const goList = (worldId: string) => setView({ name: "list", worldId });
  const goArena = (challengeId: string, worldId: string) =>
    setView({ name: "arena", challengeId, worldId });
  const goBoss = (worldId: string) => setView({ name: "boss", worldId });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {view.name === "welcome" && <Welcome onStart={goMap} />}

      {view.name === "map" && (
        <WorldMap
          onSelectWorld={goList}
          onOpenProfile={goProfile}
          onOpenGitSimulator={() => setView({ name: "git-simulator" })}
          onOpenDockerSimulator={() => setView({ name: "docker-simulator" })}
          onOpenNetworkSimulator={() => setView({ name: "network-simulator" })}
          onOpenCyberSecSimulator={() => setView({ name: "cybersec-simulator" })}
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

      {view.name !== "welcome" && <PomodoroTimer />}

      <Toaster position="top-center" expand={false} theme="dark" richColors />
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
        <Toaster position="top-center" expand={false} theme="dark" richColors />
      </>
    );
  }

  return (
    <GameProvider userId={user?.id}>
      <PomodoroProvider>
        <AppContent />
        <DevPanel />
      </PomodoroProvider>
    </GameProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <AppContentWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
}
