/**
 * 历史记录存储工具
 * 使用 localStorage 保存计算历史
 */

export interface HistoryItem {
  id: string;
  relationChain: string;
  result: string;
  timestamp: number;
}

const HISTORY_KEY = 'relative_calculator_history';
const MAX_HISTORY_ITEMS = 50;

/**
 * 获取所有历史记录
 */
export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('读取历史记录失败:', error);
    return [];
  }
}

/**
 * 添加历史记录
 */
export function addHistory(relationChain: string, result: string): void {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      relationChain,
      result,
      timestamp: Date.now(),
    };

    // 添加到开头
    history.unshift(newItem);

    // 限制历史记录数量
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
}

/**
 * 删除历史记录
 */
export function deleteHistory(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('删除历史记录失败:', error);
  }
}

/**
 * 清空所有历史记录
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('清空历史记录失败:', error);
  }
}

