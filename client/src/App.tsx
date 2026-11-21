import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { GameProvider, useGame } from "./contexts/GameContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import AuthPage from "./pages/AuthPage";
import MainMenu from "./pages/MainMenu";
import Welcome from "./pages/Welcome";
import WorldMap from "./pages/WorldMap";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { DevPanel } from "./components/DevPanel";
import { SteamControls } from "./components/SteamControls";
import { BootSplash } from "./components/BootSplash";
import { PauseMenuModal } from "./components/PauseMenuModal";
import { isSteamMode, toggleDesktopFullscreen } from "./lib/platform";
import { soundManager, type MusicContext } from "./lib/sounds";
import { WORLDS } from "./lib/challenges";

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
  | { name: "mainmenu" }
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

// Os mundos a partir da Refinaria de Dados formam o Ato 2 da campanha.
const ACT_TWO_START = WORLDS.findIndex((w) => w.id === "refinaria-dados");

/** Clima da trilha para cada tela. */
function musicFor(view: View): MusicContext {
  if (view.name === "boss") {
    const world = WORLDS.find((w) => w.id === view.worldId);
    return world?.boss?.isFinal ? "final" : "chefe";
  }
  if (view.name === "list" || view.name === "arena") {
    const index = WORLDS.findIndex((w) => w.id === view.worldId);
    return ACT_TWO_START >= 0 && index >= ACT_TWO_START ? "ato2" : "ato1";
  }
  if (view.name.endsWith("-simulator")) return "ato1";
  return "menu";
}

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

function AppContent({
  bootDone,
  onBootComplete,
}: {
  bootDone: boolean;
  onBootComplete: () => void;
}) {
  const { state, hasHydrated } = useGame();
  const [pauseOpen, setPauseOpen] = useState(false);
  const [view, setViewState] = useState<View>(() => {
    // Steam desktop always opens into Main Menu like a native PC game
    if (isSteamMode()) {
      return { name: "mainmenu" };
    }
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

  // Global F11 fullscreen shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        void toggleDesktopFullscreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Persist view changes
  useEffect(() => {
    localStorage.setItem("python_quest_current_view", JSON.stringify(view));
    setPauseOpen(false);
    window.scrollTo(0, 0);
  }, [view]);

  // Trilha sonora acompanha a tela (mesmo clima não reinicia a música).
  useEffect(() => {
    soundManager.startAmbientMusic(musicFor(view));
  }, [view]);

  // Handle initial redirection se o usuario ja viu a introducao
  useEffect(() => {
    if (hasHydrated && state.hasSeenTutorial && view.name === "welcome") {
      navigate({ name: "map" }, true);
    }
  }, [hasHydrated, state.hasSeenTutorial, view.name, navigate]);

  const goMainMenu = () => navigate({ name: "mainmenu" });
  const goWelcome = () => navigate({ name: "welcome" });
  const goMap = () => navigate({ name: "map" });
  const goProfile = () => navigate({ name: "profile" });
  const goList = (worldId: string) => navigate({ name: "list", worldId });
  const goArena = (challengeId: string, worldId: string) =>
    navigate({ name: "arena", challengeId, worldId });
  const goBoss = (worldId: string) => navigate({ name: "boss", worldId });
  const goHome = isSteamMode() ? goMainMenu : goWelcome;

  const isInGameplay =
    bootDone && view.name !== "mainmenu" && view.name !== "welcome";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {!bootDone && (
        <BootSplash isDataReady={hasHydrated} onComplete={onBootComplete} />
      )}

      {bootDone && (
        <Suspense fallback={<ViewFallback />}>
          {view.name === "mainmenu" && (
            <MainMenu
              onContinue={goMap}
              onStartNewGame={goWelcome}
            />
          )}

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
            onBackToHome={goHome}
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
            onBackToHome={goHome}
            onNext={(nextId) =>
              nextId ? goArena(nextId, view.worldId) : goList(view.worldId)
            }
          />
        )}

        {view.name === "profile" && <Profile onBack={goMap} />}
        </Suspense>
      )}

      {isInGameplay && <PomodoroTimer />}
      {isInGameplay && <SteamControls onOpenPause={() => setPauseOpen(true)} />}
      {isInGameplay && (
        <PauseMenuModal
          isOpen={pauseOpen}
          onClose={() => setPauseOpen(false)}
          onTogglePause={() => setPauseOpen((prev) => !prev)}
          canReturnToMap={view.name !== "map"}
          onGoToMap={goMap}
          onGoToMainMenu={goMainMenu}
        />
      )}

      <Toaster position="top-center" expand={false} theme="dark" />
    </div>
  );
}

function AppContentWrapper() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [bootDone, setBootDone] = useState(() => !isSteamMode());

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
        <AppContent bootDone={bootDone} onBootComplete={() => setBootDone(true)} />
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
