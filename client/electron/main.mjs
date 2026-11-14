/**
 * PYTHON-QUEST — Electron Main Process (Steam / Desktop)
 * Executa o jogo em janela nativa com suporte a Tela Cheia (F11),
 * salvamento em arquivo local (%APPDATA%/python-quest/steam_save.json)
 * compatível com Steam Auto-Cloud e hook pronto para Steamworks SDK.
 */

import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

function getSaveFilePath() {
  const userDataDir = app.getPath("userData");
  return path.join(userDataDir, "steam_save.json");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Python Quest — A Ascensão do Scriptweaver",
    backgroundColor: "#020617",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    const separator = devServerUrl.includes("?") ? "&" : "?";
    mainWindow.loadURL(`${devServerUrl}${separator}steam=1`);
  } else {
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    mainWindow.loadFile(indexPath, { query: { steam: "1" } });
  }

  // Atalho nativo F11 para alternar Tela Cheia
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });
}

// IPC Handlers para o jogo
ipcMain.handle("steam:get-profile", async () => {
  const username = os.userInfo().username || "Operador Steam";
  return {
    id: "steam-local-player",
    displayName: username,
    avatarEmoji: "/avatars/hacker.webp",
  };
});

ipcMain.handle("steam:load-save", async () => {
  try {
    const filePath = getSaveFilePath();
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao carregar save local:", err);
    return null;
  }
});

ipcMain.handle("steam:write-save", async (_event, data) => {
  try {
    const filePath = getSaveFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Erro ao gravar save local:", err);
    return false;
  }
});

ipcMain.handle("steam:unlock-achievement", async (_event, achievementId) => {
  // Quando integrar steamworks.js com AppID da Valve, ative aqui:
  // steamClient.achievement.activate(achievementId);
  console.log(`[Steamworks] Achievement unlocked: ${achievementId}`);
  return true;
});

ipcMain.handle("steam:toggle-fullscreen", async () => {
  if (!mainWindow) return false;
  const next = !mainWindow.isFullScreen();
  mainWindow.setFullScreen(next);
  return next;
});

ipcMain.handle("steam:quit", async () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

