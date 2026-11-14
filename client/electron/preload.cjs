const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("steamBridge", {
  isSteamDesktop: true,
  getPlayerProfile: () => ipcRenderer.invoke("steam:get-profile"),
  loadSaveData: () => ipcRenderer.invoke("steam:load-save"),
  writeSaveData: (data) => ipcRenderer.invoke("steam:write-save", data),
  unlockAchievement: (achievementId) =>
    ipcRenderer.invoke("steam:unlock-achievement", achievementId),
  toggleFullscreen: () => ipcRenderer.invoke("steam:toggle-fullscreen"),
  quitGame: () => ipcRenderer.invoke("steam:quit"),
});

