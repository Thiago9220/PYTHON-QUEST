/**
 * PYTHON-QUEST — Camada de Plataforma Híbrida (Web + Steam/Desktop)
 * Mantém a versão Web (Supabase Auth + Cloud) intacta e habilita
 * automaticamente o modo Desktop/Steam (Offline-First, Save Local,
 * Tela Cheia e ponte para Conquistas Steam) quando executado via Electron
 * ou com ?steam=1 / VITE_PLATFORM=steam.
 */

export interface SteamDesktopBridge {
  isSteamDesktop: boolean;
  getPlayerProfile: () => Promise<{
    id: string;
    displayName: string;
    avatarEmoji: string;
  }>;
  loadSaveData: () => Promise<any | null>;
  writeSaveData: (data: any) => Promise<boolean>;
  unlockAchievement: (achievementId: string) => Promise<boolean>;
  toggleFullscreen: () => Promise<boolean>;
  quitGame: () => Promise<void>;
}

declare global {
  interface Window {
    steamBridge?: SteamDesktopBridge;
  }
}

export function isSteamMode(): boolean {
  if (typeof window === "undefined") return false;
  if (window.steamBridge?.isSteamDesktop) return true;
  if (import.meta.env.VITE_PLATFORM === "steam") return true;
  const params = new URLSearchParams(window.location.search);
  if (params.get("steam") === "1") {
    sessionStorage.setItem("python_quest_steam_mode", "true");
    return true;
  }
  return sessionStorage.getItem("python_quest_steam_mode") === "true";
}

export const STEAM_DEFAULT_USER_ID = "steam-local-player";

// --- Demo (Steam Next Fest): build com VITE_DEMO=true (npm run steam:demo) ---

/** Setores jogáveis na demo; o resto aparece trancado como "Jogo completo". */
export const DEMO_WORLD_IDS = ["vila-variaveis", "vale-condicoes"];

export function isDemoBuild(): boolean {
  return import.meta.env.VITE_DEMO === "true";
}

export function isDemoLocked(worldId: string): boolean {
  return isDemoBuild() && !DEMO_WORLD_IDS.includes(worldId);
}

/** Página da loja do jogo completo (VITE_STEAM_STORE_APPID), ou null se ainda não houver. */
export function getStoreUrl(): string | null {
  const appId = import.meta.env.VITE_STEAM_STORE_APPID;
  return appId ? `https://store.steampowered.com/app/${appId}/` : null;
}

export async function loadSteamSaveSnapshot(): Promise<any | null> {
  if (typeof window !== "undefined" && window.steamBridge?.loadSaveData) {
    try {
      const diskData = await window.steamBridge.loadSaveData();
      if (diskData) return diskData;
    } catch (err) {
      console.warn("Falha ao ler save do disco Steam, usando cache local:", err);
    }
  }
  try {
    const raw = localStorage.getItem(`python_quest_game_snapshot:${STEAM_DEFAULT_USER_ID}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function persistSteamSaveSnapshot(snapshot: any): Promise<void> {
  try {
    localStorage.setItem(
      `python_quest_game_snapshot:${STEAM_DEFAULT_USER_ID}`,
      JSON.stringify(snapshot)
    );
  } catch {
    // ignore storage quota errors
  }

  if (typeof window !== "undefined" && window.steamBridge?.writeSaveData) {
    try {
      await window.steamBridge.writeSaveData(snapshot);
    } catch (err) {
      console.warn("Falha ao gravar save em disco:", err);
    }
  }
}

export async function notifySteamAchievement(achievementId: string): Promise<void> {
  if (typeof window !== "undefined" && window.steamBridge?.unlockAchievement) {
    try {
      await window.steamBridge.unlockAchievement(achievementId);
    } catch {
      // ignore if Steamworks is not active
    }
  }
}

export async function toggleDesktopFullscreen(): Promise<void> {
  if (typeof window !== "undefined" && window.steamBridge?.toggleFullscreen) {
    await window.steamBridge.toggleFullscreen();
    return;
  }
  if (typeof document !== "undefined") {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  }
}

export async function quitDesktopGame(): Promise<void> {
  if (typeof window !== "undefined" && window.steamBridge?.quitGame) {
    await window.steamBridge.quitGame();
  } else if (typeof window !== "undefined") {
    window.close();
  }
}

