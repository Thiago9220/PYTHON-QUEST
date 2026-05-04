import { useState } from "react";
import { GameProvider } from "./contexts/GameContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "sonner";
import GameArena from "./pages/GameArena";
import Welcome from "./pages/Welcome";
import WorldMap from "./pages/WorldMap";

function AppContent() {
  const [view, setView] = useState<"welcome" | "map" | "arena">("welcome");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const handleStart = () => setView("map");
  const handleSelectChallenge = (id: string) => {
    setSelectedChallengeId(id);
    setView("arena");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {view === "welcome" && <Welcome onStart={handleStart} />}
      {view === "map" && <WorldMap onSelectChallenge={handleSelectChallenge} onBack={() => setView("welcome")} />}
      {view === "arena" && selectedChallengeId && (
        <GameArena 
          challengeId={selectedChallengeId} 
          onBack={() => setView("map")} 
          onBackToHome={() => setView("welcome")}
          onNext={(nextId) => nextId ? setSelectedChallengeId(nextId) : setView("map")}
        />
      )}
      <Toaster position="top-center" expand={false} richColors />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
