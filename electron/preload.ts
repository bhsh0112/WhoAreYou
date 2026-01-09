import { contextBridge } from 'electron';

/**
 * 暴露安全的 API 给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 可以在这里添加需要与主进程通信的 API
  platform: process.platform,
});

