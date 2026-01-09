/**
 * Electron API 类型定义
 */
export interface ElectronAPI {
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

