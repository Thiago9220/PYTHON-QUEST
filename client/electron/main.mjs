/**
 * PYTHON-QUEST — Electron Main Process (Steam / Desktop)
 * Executa o jogo em janela nativa com suporte a Tela Cheia (F11),
 * servidor estático embutido (corrige caminhos absolutos /assets e /avatars),
 * salvamento em arquivo local (%APPDATA%/python-quest/steam_save.json)
 * compatível com Steam Auto-Cloud e hook pronto para Steamworks SDK.
 */

import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let staticServer = null;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
};

function startLocalStaticServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url || "/", "http://127.0.0.1");
        let safePath = decodeURIComponent(parsedUrl.pathname);
        if (safePath === "/") safePath = "/index.html";

        let filePath = path.join(distDir, safePath);
        // Previne directory traversal
        if (!filePath.startsWith(distDir)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, "index.html");
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
        });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });

    server.on("error", reject);
  });
}

function getSaveFilePath() {
  const userDataDir = app.getPath("userData");
  return path.join(userDataDir, "steam_save.json");
}

function getAppIconPath() {
  const candidates = [
    path.join(__dirname, "..", "public", "assets", "images", "python-protocol-mark.png"),
    path.join(__dirname, "..", "dist", "assets", "images", "python-protocol-mark.png"),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

  async function createWindow() {
    const iconPath = getAppIconPath();
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1024,
      minHeight: 700,
      title: "Python Quest — A Ascensão do Scriptweaver",
      icon: iconPath,
      backgroundColor: "#020617",
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    mainWindow.setMenuBarVisibility(false);

    let allowedOrigin = "";
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("https://")) {
        void shell.openExternal(url);
      }
      return { action: "deny" };
    });

    mainWindow.webContents.on("will-navigate", (event, url) => {
      try {
        const targetOrigin = new URL(url).origin;
        if (allowedOrigin && targetOrigin === allowedOrigin) {
          return;
        }
      } catch {
        // Ignore malformed URLs and block navigation
      }
      event.preventDefault();
      if (url.startsWith("https://")) {
        void shell.openExternal(url);
      }
    });

    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
      const separator = devServerUrl.includes("?") ? "&" : "?";
      const targetUrl = `${devServerUrl}${separator}steam=1`;
      allowedOrigin = new URL(targetUrl).origin;
      await mainWindow.loadURL(targetUrl);
    } else {
      const distDir = path.join(__dirname, "..", "dist");
      const { server, port } = await startLocalStaticServer(distDir);
      staticServer = server;
      const targetUrl = `http://127.0.0.1:${port}/?steam=1`;
      allowedOrigin = new URL(targetUrl).origin;
      await mainWindow.loadURL(targetUrl);
    }

    // Atalho nativo F11 para alternar Tela Cheia e bloqueio de atalhos de navegador
    mainWindow.webContents.on("before-input-event", (event, input) => {
      if (input.type !== "keyDown") return;

      if (input.key === "F11") {
        event.preventDefault();
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
        return;
      }

      if (!devServerUrl) {
        const key = input.key.toLowerCase();
        if (
          input.key === "F5" ||
          ((input.control || input.meta) && (key === "r" || key === "=" || key === "-" || key === "0"))
        ) {
          event.preventDefault();
        }
      }
    });

    // Desativa clique direito padrão do navegador fora de campos editáveis
    mainWindow.webContents.on("context-menu", (event, params) => {
      if (!params.isEditable) {
        event.preventDefault();
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
    void createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) void createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (staticServer) {
      staticServer.close();
      staticServer = null;
    }
    if (process.platform !== "darwin") app.quit();
  });
