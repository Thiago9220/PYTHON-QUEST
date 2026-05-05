import { useState } from "react";
import { Toaster } from "sonner";
import { GameProvider } from "./contexts/GameContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Welcome from "./pages/Welcome";
import WorldMap from "./pages/WorldMap";
import ChallengeList from "./pages/ChallengeList";
import GameArena from "./pages/GameArena";
import Profile from "./pages/Profile";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import { PomodoroTimer } from "./components/PomodoroTimer";

type View =
  | { name: "welcome" }
  | { name: "map" }
  | { name: "list"; worldId: string }
  | { name: "arena"; challengeId: string; worldId: string }
  | { name: "profile" };

function AppContent() {
  const [view, setView] = useState<View>({ name: "welcome" });

  const goWelcome = () => setView({ name: "welcome" });
  const goMap = () => setView({ name: "map" });
  const goProfile = () => setView({ name: "profile" });
  const goList = (worldId: string) => setView({ name: "list", worldId });
  const goArena = (challengeId: string, worldId: string) =>
    setView({ name: "arena", challengeId, worldId });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {view.name === "welcome" && <Welcome onStart={goMap} />}

      {view.name === "map" && (
        <WorldMap onSelectWorld={goList} onOpenProfile={goProfile} />
      )}

      {view.name === "list" && (
        <ChallengeList
          worldId={view.worldId}
          onSelectChallenge={(id) => goArena(id, view.worldId)}
          onBack={goMap}
          onBackToHome={goWelcome}
          onOpenProfile={goProfile}
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

      <Toaster position="top-center" expand={false} richColors />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <GameProvider>
          <PomodoroProvider>
            <AppContent />
          </PomodoroProvider>
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
