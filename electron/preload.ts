import { contextBridge } from 'electron'

// Expose any needed Electron APIs to renderer here
// For now Momentum only needs browser APIs
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
})
