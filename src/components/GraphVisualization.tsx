import { useEffect, useRef, useState } from 'react';
import { relativeGraph } from '../utils/relativeGraph';

/**
 * 图可视化组件
 * 使用 SVG 和 Canvas 绘制关系图
 */
export default function GraphVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [graphData, setGraphData] = useState(relativeGraph.getGraphData());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      // 设置画布大小
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 使用力导向布局计算节点位置
      const positions = calculateForceDirectedLayout(graphData.nodes, graphData.edges, canvas.width, canvas.height);

      // 绘制边
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      graphData.edges.forEach((edge) => {
        const fromPos = positions.get(edge.from);
        const toPos = positions.get(edge.to);
        if (fromPos && toPos) {
          ctx.beginPath();
          ctx.moveTo(fromPos.x, fromPos.y);
          ctx.lineTo(toPos.x, toPos.y);
          ctx.stroke();

          // 绘制关系标签（只在距离足够时显示）
          const distance = Math.sqrt(Math.pow(toPos.x - fromPos.x, 2) + Math.pow(toPos.y - fromPos.y, 2));
          if (distance > 40) {
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Arial';
            ctx.fillText(edge.relation, midX + 5, midY - 5);
          }
        }
      });

      // 绘制节点
      graphData.nodes.forEach((node) => {
        const pos = positions.get(node.id);
        if (!pos) return;

        const isSelected = selectedNode === node.id;
        const isRoot = node.id === '我';

        // 绘制节点圆圈
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isRoot ? 20 : 15, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected
          ? '#3b82f6'
          : isRoot
          ? '#10b981'
          : node.gender === 'male'
          ? '#60a5fa'
          : node.gender === 'female'
          ? '#f472b6'
          : '#94a3b8';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#1d4ed8' : '#64748b';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        // 绘制节点标签
        ctx.fillStyle = '#1f2937';
        ctx.font = isRoot ? 'bold 12px Arial' : '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.title, pos.x, pos.y);
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [graphData, selectedNode]);

  // 处理节点点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查点击的是哪个节点
    const positions = calculateForceDirectedLayout(
      graphData.nodes,
      graphData.edges,
      canvas.width,
      canvas.height
    );

    for (const node of graphData.nodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      const radius = node.id === '我' ? 20 : 15;

      if (distance <= radius) {
        setSelectedNode(node.id);
        return;
      }
    }

    setSelectedNode(null);
  };

  // 获取选中节点的信息
  const selectedNodeInfo = selectedNode
    ? graphData.nodes.find((n) => n.id === selectedNode)
    : null;

  const selectedNodeEdges = selectedNode
    ? graphData.edges.filter((e) => e.from === selectedNode || e.to === selectedNode)
    : [];

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30">
        <h2 className="text-base font-semibold text-slate-800 mb-1">称呼关系图</h2>
        <p className="text-xs text-slate-500">
          点击节点查看详情 · {graphData.nodes.length} 个节点 · {graphData.edges.length} 条关系
        </p>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ minHeight: '300px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
          style={{ background: '#f8fafc', width: '100%', height: '100%' }}
        />
      </div>

      {selectedNodeInfo && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 max-h-36 overflow-y-auto">
          <h3 className="font-semibold text-slate-800 mb-2 text-sm">
            {selectedNodeInfo.title}
          </h3>
          <div className="text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">性别:</span>
              <span className={`px-2 py-0.5 rounded ${
                selectedNodeInfo.gender === 'male' 
                  ? 'bg-blue-100 text-blue-700' 
                  : selectedNodeInfo.gender === 'female'
                  ? 'bg-pink-100 text-pink-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {selectedNodeInfo.gender === 'male' ? '男' : selectedNodeInfo.gender === 'female' ? '女' : '未知'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">辈分:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {selectedNodeInfo.generation > 0 ? `+${selectedNodeInfo.generation} (长辈)` : selectedNodeInfo.generation < 0 ? `${selectedNodeInfo.generation} (晚辈)` : '0 (同辈)'}
              </span>
            </div>
            {selectedNodeEdges.length > 0 && (
              <div>
                <p className="text-slate-400 mb-1">关系 ({selectedNodeEdges.length}):</p>
                <div className="pl-2 space-y-1 max-h-20 overflow-y-auto">
                  {selectedNodeEdges.slice(0, 4).map((edge, idx) => (
                    <p key={idx} className="text-xs text-slate-600">
                      {edge.from === selectedNode
                        ? <span><span className="text-indigo-600">{edge.relation}</span> → {edge.to}</span>
                        : <span>{edge.to} ← <span className="text-indigo-600">{edge.relation}</span></span>}
                    </p>
                  ))}
                  {selectedNodeEdges.length > 4 && (
                    <p className="text-xs text-slate-400">...还有 {selectedNodeEdges.length - 4} 条</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 计算力导向布局
 */
function calculateForceDirectedLayout(
  nodes: Array<{ id: string }>,
  edges: Array<{ from: string; to: string }>,
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 初始化位置
  nodes.forEach((node, index) => {
    if (node.id === '我') {
      // "我"节点放在中心
      positions.set(node.id, { x: width / 2, y: height / 2 });
    } else {
      // 其他节点随机分布
      positions.set(node.id, {
        x: Math.random() * width,
        y: Math.random() * height,
      });
    }
  });

  // 力导向算法迭代
  const iterations = 100;
  const k = Math.sqrt((width * height) / nodes.length); // 理想距离

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { x: number; y: number }>();

    // 初始化力
    nodes.forEach((node) => {
      forces.set(node.id, { x: 0, y: 0 });
    });

    // 计算排斥力（所有节点之间）
    nodes.forEach((node1) => {
      const pos1 = positions.get(node1.id)!;
      nodes.forEach((node2) => {
        if (node1.id === node2.id) return;
        const pos2 = positions.get(node2.id)!;
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const force = (k * k) / distance;
        const fx = (force * dx) / distance;
        const fy = (force * dy) / distance;
        const f1 = forces.get(node1.id)!;
        f1.x -= fx;
        f1.y -= fy;
      });
    });

    // 计算吸引力（连接的节点之间）
    edges.forEach((edge) => {
      const pos1 = positions.get(edge.from);
      const pos2 = positions.get(edge.to);
      if (!pos1 || !pos2) return;

      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
      const force = (distance * distance) / k;
      const fx = (force * dx) / distance;
      const fy = (force * dy) / distance;

      const f1 = forces.get(edge.from)!;
      f1.x += fx;
      f1.y += fy;

      const f2 = forces.get(edge.to)!;
      f2.x -= fx;
      f2.y -= fy;
    });

    // 应用力（但保持"我"节点在中心）
    nodes.forEach((node) => {
      if (node.id === '我') return;
      const force = forces.get(node.id)!;
      const pos = positions.get(node.id)!;
      const damping = 0.1;
      pos.x += force.x * damping;
      pos.y += force.y * damping;

      // 边界约束
      pos.x = Math.max(30, Math.min(width - 30, pos.x));
      pos.y = Math.max(30, Math.min(height - 30, pos.y));
    });
  }

  return positions;
}

