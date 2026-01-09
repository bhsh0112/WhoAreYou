import { useState, useEffect } from 'react';
import { relativeCalculator } from '../utils/relativeCalculator';
import { addHistory, getHistory, deleteHistory, clearHistory, type HistoryItem } from '../utils/historyStorage';

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
        const calculatedResult = relativeCalculator.calculate(input);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">辈分计算器</h1>
          <p className="text-sm text-gray-600">输入关系链，计算正确称呼</p>
        </div>

        {/* 计算器主体 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 显示屏 */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
            <div className="text-right">
              <div className="text-gray-400 text-sm mb-2 min-h-[20px] break-all">
                {formatInputDisplay(input) || '请输入关系'}
              </div>
              {result && (
                <div className="text-2xl font-bold text-white mt-2 break-all">
                  = {result}
                </div>
              )}
            </div>
          </div>

          {/* 控制栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              {showHistory ? '隐藏' : '历史'} ({history.length})
            </button>
            {showHistory && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
              >
                清空
              </button>
            )}
          </div>

          {/* 历史记录面板 */}
          {showHistory && (
            <div className="max-h-48 overflow-y-auto border-b bg-gray-50">
              {history.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">暂无历史记录</div>
              ) : (
                <div className="divide-y">
                  {history.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleHistorySelect(item)}
                      className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-700 font-medium">{formatInputDisplay(item.relationChain)}</div>
                          <div className="text-xs text-gray-500 mt-1">= {item.result}</div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 键盘 */}
          <div className="p-4 bg-gray-50">
            {/* 功能按钮行 */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => handleButtonClick('AC')}
                className="px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-md"
              >
                清空 (AC)
              </button>
              <button
                onClick={() => handleButtonClick('DEL')}
                className="px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-md"
              >
                删除 (DEL)
              </button>
            </div>

            {/* 关系按钮 */}
            {buttons.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-2 mb-2">
                {row.map((button) => {
                  const isEquals = button === '=';
                  const isDe = button === '的';
                  return (
                    <button
                      key={button}
                      onClick={() => handleButtonClick(button)}
                      className={`
                        px-4 py-4 rounded-xl font-semibold text-lg
                        active:scale-95 transition-all shadow-md
                        ${
                          isEquals
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 col-span-2'
                            : isDe
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
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
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>各地称呼不同，计算结果仅供参考</p>
        </div>
      </div>
    </div>
  );
}

