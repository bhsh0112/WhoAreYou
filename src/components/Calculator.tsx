import { useState, useEffect } from 'react';
// 使用新的图结构计算器
import { relativeGraph } from '../utils/relativeGraph';
import { addHistory, getHistory, deleteHistory, clearHistory, type HistoryItem } from '../utils/historyStorage';
import GraphVisualization from './GraphVisualization';

/**
 * 关系按钮类型
 */
type RelationButton = '父' | '母' | '丈夫' | '妻' | '兄' | '弟' | '姐' | '妹' | '子' | '女' | '的' | '=' | 'AC' | 'DEL';

/**
 * 计算器组件
 */
export default function Calculator() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);

  // 加载历史记录
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  /**
   * 格式化输入显示（将独立的"夫"显示为"丈夫"，但不替换"丈夫"中的"夫"）
   */
  const formatInputDisplay = (text: string): string => {
    // 先保护所有"丈夫"，然后替换独立的"夫"，最后恢复"丈夫"
    // 使用特殊标记避免与用户输入冲突
    return text
      .replace(/丈夫/g, '【HUSBAND_PLACEHOLDER】')  // 先标记所有"丈夫"
      .replace(/夫/g, '丈夫')                        // 替换独立的"夫"为"丈夫"
      .replace(/【HUSBAND_PLACEHOLDER】/g, '丈夫');  // 恢复原来的"丈夫"
  };

  /**
   * 处理按钮点击
   */
  const handleButtonClick = (button: RelationButton) => {
    if (button === 'AC') {
      setInput('');
      setResult('');
    } else if (button === 'DEL') {
      setInput(prev => prev.slice(0, -1));
      setResult('');
    } else if (button === '=') {
      if (input.trim()) {
        const calculatedResult = relativeGraph.calculate(input);
        setResult(calculatedResult);
        addHistory(input, calculatedResult);
        setHistory(getHistory());
      }
    } else if (button === '丈夫') {
      // 如果最后是"丈"，则替换为"丈夫"；否则追加"丈夫"
      setInput(prev => {
        if (prev.endsWith('丈')) {
          return prev.slice(0, -1) + '丈夫';
        }
        return prev + '丈夫';
      });
      setResult('');
    } else {
      setInput(prev => prev + button);
      setResult('');
    }
  };

  /**
   * 从历史记录中选择
   */
  const handleHistorySelect = (item: HistoryItem) => {
    setInput(item.relationChain);
    setResult(item.result);
    setShowHistory(false);
  };

  /**
   * 删除历史记录项
   */
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistory(id);
    setHistory(getHistory());
  };

  /**
   * 清空所有历史记录
   */
  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
      setHistory([]);
    }
  };

  // 按钮配置
  const buttons: RelationButton[][] = [
    ['父', '母', '丈夫', '妻'],
    ['兄', '弟', '姐', '妹'],
    ['子', '女', '的', '='],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            辈分计算器
          </h1>
          <p className="text-sm text-slate-500">输入关系链，计算正确称呼</p>
        </div>

        {/* 计算器主体 */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* 显示屏 */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="text-right">
              <div className="text-slate-400 text-sm mb-3 min-h-[24px] break-all font-mono">
                {formatInputDisplay(input) || <span className="opacity-50">请输入关系</span>}
              </div>
              {result && (
                <div className="text-3xl font-bold text-white mt-3 break-all">
                  {result}
                </div>
              )}
            </div>
          </div>

          {/* 控制栏 */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  showHistory
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>📜</span>
                  <span>{showHistory ? '隐藏' : '历史'}</span>
                  {history.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                      {history.length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setShowGraph(!showGraph)}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  showGraph
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🕸️</span>
                  <span>{showGraph ? '隐藏' : '关系图'}</span>
                </span>
              </button>
            </div>
            {showHistory && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors border border-red-200"
              >
                清空
              </button>
            )}
          </div>

          {/* 历史记录面板 */}
          {showHistory && (
            <div className="max-h-64 overflow-y-auto border-b bg-slate-50/50">
              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <div className="text-4xl mb-2">📝</div>
                  <div>暂无历史记录</div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {history.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleHistorySelect(item)}
                      className="p-4 hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-700 font-medium truncate">
                            {formatInputDisplay(item.relationChain)}
                          </div>
                          <div className="text-sm text-indigo-600 font-semibold mt-1">
                            {item.result}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-2 py-1 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 关系图面板 */}
          {showGraph && (
            <div className="h-96 border-b bg-white">
              <GraphVisualization />
            </div>
          )}

          {/* 键盘 */}
          <div className="p-5 bg-gradient-to-b from-slate-50 to-white">
            {/* 功能按钮行 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => handleButtonClick('AC')}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
              >
                清空
              </button>
              <button
                onClick={() => handleButtonClick('DEL')}
                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
              >
                删除
              </button>
            </div>

            {/* 关系按钮 */}
            {buttons.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-3 mb-3 last:mb-0">
                {row.map((button) => {
                  const isEquals = button === '=';
                  const isDe = button === '的';
                  return (
                    <button
                      key={button}
                      onClick={() => handleButtonClick(button)}
                      className={`
                        px-3 py-4 rounded-xl font-medium text-base
                        active:scale-[0.98] transition-all
                        ${
                          isEquals
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md col-span-2'
                            : isDe
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-sm hover:shadow-md'
                            : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow'
                        }
                      `}
                    >
                      {button}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>各地称呼可能不同，计算结果仅供参考</p>
        </div>
      </div>
    </div>
  );
}

