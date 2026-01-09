/**
 * 基于图的亲戚关系存储和计算
 * 使用图结构来表示各种称呼及其间的关系
 */

export type RelationType = '父' | '母' | '夫' | '妻' | '兄' | '弟' | '姐' | '妹' | '子' | '女';

/**
 * 关系边的定义
 */
interface RelationEdge {
  from: string;        // 起始节点（称呼）
  to: string;          // 目标节点（称呼）
  relation: RelationType;  // 关系类型
  reverseRelation?: RelationType;  // 反向关系（可选）
}

/**
 * 图节点（亲属称呼）
 */
interface GraphNode {
  title: string;       // 称呼
  gender: 'male' | 'female' | 'unknown';  // 性别
  generation: number;  // 辈分：0=同辈，正数=长辈，负数=晚辈
}

/**
 * 基于图的亲戚关系存储
 */
class RelativeGraph {
  // 节点映射：称呼 -> 节点信息
  private nodes: Map<string, GraphNode> = new Map();
  
  // 邻接表：称呼 -> [关系边]
  private adjacencyList: Map<string, RelationEdge[]> = new Map();
  
  // 反向邻接表：用于快速查找反向关系
  private reverseAdjacencyList: Map<string, RelationEdge[]> = new Map();

  constructor() {
    this.buildGraph();
  }

  /**
   * 构建关系图
   */
  private buildGraph() {
    // 1. 定义基础节点（自我）
    this.addNode('我', { gender: 'unknown', generation: 0 });
    
    // 2. 定义直接关系（从"我"出发的一度关系）
    this.addDirectRelations();
    
    // 3. 定义间接关系（通过路径可达的关系）
    this.addIndirectRelations();
  }

  /**
   * 添加节点
   */
  private addNode(title: string, node: Omit<GraphNode, 'title'>) {
    this.nodes.set(title, { ...node, title });
    if (!this.adjacencyList.has(title)) {
      this.adjacencyList.set(title, []);
    }
    if (!this.reverseAdjacencyList.has(title)) {
      this.reverseAdjacencyList.set(title, []);
    }
  }

  /**
   * 添加关系边
   */
  private addEdge(from: string, to: string, relation: RelationType, reverseRelation?: RelationType) {
    const edge: RelationEdge = { from, to, relation, reverseRelation };
    
    // 添加到正向邻接表
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, []);
    }
    this.adjacencyList.get(from)!.push(edge);
    
    // 添加到反向邻接表
    if (!this.reverseAdjacencyList.has(to)) {
      this.reverseAdjacencyList.set(to, []);
    }
    this.reverseAdjacencyList.get(to)!.push(edge);
  }

  /**
   * 添加直接关系（一度关系）
   */
  private addDirectRelations() {
    // 从"我"出发的直接关系
    
    // 父母
    this.addNode('父亲', { gender: 'male', generation: 1 });
    this.addNode('母亲', { gender: 'female', generation: 1 });
    this.addEdge('我', '父亲', '父');
    this.addEdge('我', '母亲', '母');
    this.addEdge('父亲', '我', '子', '父');
    this.addEdge('母亲', '我', '女', '母');
    
    // 配偶
    this.addNode('丈夫', { gender: 'male', generation: 0 });
    this.addNode('妻子', { gender: 'female', generation: 0 });
    this.addEdge('我', '丈夫', '夫');
    this.addEdge('我', '妻子', '妻');
    this.addEdge('丈夫', '我', '妻', '夫');
    this.addEdge('妻子', '我', '夫', '妻');
    
    // 兄弟姐妹
    this.addNode('哥哥', { gender: 'male', generation: 0 });
    this.addNode('弟弟', { gender: 'male', generation: 0 });
    this.addNode('姐姐', { gender: 'female', generation: 0 });
    this.addNode('妹妹', { gender: 'female', generation: 0 });
    this.addEdge('我', '哥哥', '兄');
    this.addEdge('我', '弟弟', '弟');
    this.addEdge('我', '姐姐', '姐');
    this.addEdge('我', '妹妹', '妹');
    
    // 子女
    this.addNode('儿子', { gender: 'male', generation: -1 });
    this.addNode('女儿', { gender: 'female', generation: -1 });
    this.addEdge('我', '儿子', '子');
    this.addEdge('我', '女儿', '女');
    this.addEdge('儿子', '我', '父', '子');
    this.addEdge('女儿', '我', '母', '女');
  }

  /**
   * 添加间接关系（通过路径组合可达的关系）
   */
  private addIndirectRelations() {
    // 父亲的亲属
    this.addNode('爷爷', { gender: 'male', generation: 2 });
    this.addNode('奶奶', { gender: 'female', generation: 2 });
    this.addEdge('父亲', '爷爷', '父');
    this.addEdge('父亲', '奶奶', '母');
    
    this.addNode('伯父', { gender: 'male', generation: 1 });
    this.addNode('叔父', { gender: 'male', generation: 1 });
    this.addNode('姑妈', { gender: 'female', generation: 1 });
    this.addEdge('父亲', '伯父', '兄');
    this.addEdge('父亲', '叔父', '弟');
    this.addEdge('父亲', '姑妈', '姐');
    
    // 母亲的亲属
    this.addNode('外公', { gender: 'male', generation: 2 });
    this.addNode('外婆', { gender: 'female', generation: 2 });
    this.addEdge('母亲', '外公', '父');
    this.addEdge('母亲', '外婆', '母');
    
    this.addNode('舅舅', { gender: 'male', generation: 1 });
    this.addNode('姨妈', { gender: 'female', generation: 1 });
    this.addEdge('母亲', '舅舅', '兄');
    this.addEdge('母亲', '姨妈', '姐');
    
    // 配偶的亲属
    this.addNode('岳父', { gender: 'male', generation: 1 });
    this.addNode('岳母', { gender: 'female', generation: 1 });
    this.addEdge('妻子', '岳父', '父');
    this.addEdge('妻子', '岳母', '母');
    
    this.addNode('公公', { gender: 'male', generation: 1 });
    this.addNode('婆婆', { gender: 'female', generation: 1 });
    this.addEdge('丈夫', '公公', '父');
    this.addEdge('丈夫', '婆婆', '母');
    
    // 兄弟姐妹的配偶
    this.addNode('嫂子', { gender: 'female', generation: 0 });
    this.addNode('弟媳', { gender: 'female', generation: 0 });
    this.addNode('姐夫', { gender: 'male', generation: 0 });
    this.addNode('妹夫', { gender: 'male', generation: 0 });
    this.addEdge('哥哥', '嫂子', '妻');
    this.addEdge('弟弟', '弟媳', '妻');
    this.addEdge('姐姐', '姐夫', '夫');
    this.addEdge('妹妹', '妹夫', '夫');
    
    // 兄弟姐妹的子女
    this.addNode('侄子', { gender: 'male', generation: -1 });
    this.addNode('侄女', { gender: 'female', generation: -1 });
    this.addNode('外甥', { gender: 'male', generation: -1 });
    this.addNode('外甥女', { gender: 'female', generation: -1 });
    this.addEdge('哥哥', '侄子', '子');
    this.addEdge('哥哥', '侄女', '女');
    this.addEdge('姐姐', '外甥', '子');
    this.addEdge('姐姐', '外甥女', '女');
    
    // 子女的配偶
    this.addNode('儿媳', { gender: 'female', generation: -1 });
    this.addNode('女婿', { gender: 'male', generation: -1 });
    this.addEdge('儿子', '儿媳', '妻');
    this.addEdge('女儿', '女婿', '夫');
    
    // 子女的子女
    this.addNode('孙子', { gender: 'male', generation: -2 });
    this.addNode('孙女', { gender: 'female', generation: -2 });
    this.addNode('外孙', { gender: 'male', generation: -2 });
    this.addNode('外孙女', { gender: 'female', generation: -2 });
    this.addEdge('儿子', '孙子', '子');
    this.addEdge('儿子', '孙女', '女');
    this.addEdge('女儿', '外孙', '子');
    this.addEdge('女儿', '外孙女', '女');
    
    // 妻子的兄弟姐妹
    this.addNode('大舅子', { gender: 'male', generation: 0 });
    this.addNode('小舅子', { gender: 'male', generation: 0 });
    this.addNode('大姨子', { gender: 'female', generation: 0 });
    this.addNode('小姨子', { gender: 'female', generation: 0 });
    this.addEdge('妻子', '大舅子', '兄');
    this.addEdge('妻子', '小舅子', '弟');
    this.addEdge('妻子', '大姨子', '姐');
    this.addEdge('妻子', '小姨子', '妹');
    
    // 丈夫的兄弟姐妹
    this.addNode('大伯', { gender: 'male', generation: 0 });
    this.addNode('小叔', { gender: 'male', generation: 0 });
    this.addNode('大姑', { gender: 'female', generation: 0 });
    this.addNode('小姑', { gender: 'female', generation: 0 });
    this.addEdge('丈夫', '大伯', '兄');
    this.addEdge('丈夫', '小叔', '弟');
    this.addEdge('丈夫', '大姑', '姐');
    this.addEdge('丈夫', '小姑', '妹');
    
    // 关键关系：父母的配偶
    this.addEdge('母亲', '父亲', '夫');
    this.addEdge('父亲', '母亲', '妻');
    
    // 添加更多复杂关系
    this.addComplexRelations();
  }

  /**
   * 添加复杂关系
   */
  private addComplexRelations() {
    // 妻子的兄弟姐妹的配偶
    this.addNode('大舅嫂', { gender: 'female', generation: 0 });
    this.addNode('小舅嫂', { gender: 'female', generation: 0 });
    this.addNode('大姨夫', { gender: 'male', generation: 0 });
    this.addNode('小姨夫', { gender: 'male', generation: 0 });
    this.addEdge('大舅子', '大舅嫂', '妻');
    this.addEdge('小舅子', '小舅嫂', '妻');
    this.addEdge('大姨子', '大姨夫', '夫');
    this.addEdge('小姨子', '小姨夫', '夫');
    
    // 妻子的兄弟姐妹的子女
    this.addNode('内侄', { gender: 'male', generation: -1 });
    this.addNode('内侄女', { gender: 'female', generation: -1 });
    this.addEdge('大舅子', '内侄', '子');
    this.addEdge('大舅子', '内侄女', '女');
    this.addEdge('小舅子', '内侄', '子');
    this.addEdge('小舅子', '内侄女', '女');
    
    // 丈夫的兄弟姐妹的配偶
    this.addNode('大伯母', { gender: 'female', generation: 0 });
    this.addNode('小婶', { gender: 'female', generation: 0 });
    this.addNode('大姑父', { gender: 'male', generation: 0 });
    this.addNode('小姑父', { gender: 'male', generation: 0 });
    this.addEdge('大伯', '大伯母', '妻');
    this.addEdge('小叔', '小婶', '妻');
    this.addEdge('大姑', '大姑父', '夫');
    this.addEdge('小姑', '小姑父', '夫');
    
    // 父的兄弟姐妹的配偶
    this.addNode('伯母', { gender: 'female', generation: 1 });
    this.addNode('婶婶', { gender: 'female', generation: 1 });
    this.addNode('姑父', { gender: 'male', generation: 1 });
    this.addEdge('伯父', '伯母', '妻');
    this.addEdge('叔父', '婶婶', '妻');
    this.addEdge('姑妈', '姑父', '夫');
    
    // 母的兄弟姐妹的配偶
    this.addNode('舅母', { gender: 'female', generation: 1 });
    this.addNode('姨父', { gender: 'male', generation: 1 });
    this.addEdge('舅舅', '舅母', '妻');
    this.addEdge('姨妈', '姨父', '夫');
    
    // 堂兄弟姐妹
    this.addNode('堂兄', { gender: 'male', generation: 0 });
    this.addNode('堂弟', { gender: 'male', generation: 0 });
    this.addNode('堂姐', { gender: 'female', generation: 0 });
    this.addNode('堂妹', { gender: 'female', generation: 0 });
    this.addEdge('伯父', '堂兄', '子');
    this.addEdge('伯父', '堂弟', '子');
    this.addEdge('伯父', '堂姐', '女');
    this.addEdge('伯父', '堂妹', '女');
    this.addEdge('叔父', '堂兄', '子');
    this.addEdge('叔父', '堂弟', '子');
    this.addEdge('叔父', '堂姐', '女');
    this.addEdge('叔父', '堂妹', '女');
    
    // 表兄弟姐妹
    this.addNode('表兄', { gender: 'male', generation: 0 });
    this.addNode('表弟', { gender: 'male', generation: 0 });
    this.addNode('表姐', { gender: 'female', generation: 0 });
    this.addNode('表妹', { gender: 'female', generation: 0 });
    this.addEdge('姑妈', '表兄', '子');
    this.addEdge('姑妈', '表弟', '子');
    this.addEdge('姑妈', '表姐', '女');
    this.addEdge('姑妈', '表妹', '女');
    this.addEdge('舅舅', '表兄', '子');
    this.addEdge('舅舅', '表弟', '子');
    this.addEdge('舅舅', '表姐', '女');
    this.addEdge('舅舅', '表妹', '女');
    this.addEdge('姨妈', '表兄', '子');
    this.addEdge('姨妈', '表弟', '子');
    this.addEdge('姨妈', '表姐', '女');
    this.addEdge('姨妈', '表妹', '女');
    
    // 祖父母辈
    this.addNode('太爷爷', { gender: 'male', generation: 3 });
    this.addNode('太奶奶', { gender: 'female', generation: 3 });
    this.addNode('太外公', { gender: 'male', generation: 3 });
    this.addNode('太外婆', { gender: 'female', generation: 3 });
    this.addEdge('爷爷', '太爷爷', '父');
    this.addEdge('奶奶', '太奶奶', '母');
    this.addEdge('外公', '太外公', '父');
    this.addEdge('外婆', '太外婆', '母');
  }

  /**
   * 通过关系路径查找称呼
   * @param relations 关系类型数组，如 ['妻', '父'] 表示"妻子的父亲"
   * @returns 称呼，如果找不到则返回null
   */
  public findTitleByPath(relations: RelationType[]): string | null {
    if (relations.length === 0) {
      return '我';
    }

    let currentNode = '我';
    
    // 沿着关系路径遍历图
    for (const relation of relations) {
      const edges = this.adjacencyList.get(currentNode);
      if (!edges) {
        return null;
      }
      
      // 查找匹配的关系边
      const edge = edges.find(e => e.relation === relation);
      if (!edge) {
        return null;
      }
      
      currentNode = edge.to;
    }
    
    return currentNode;
  }

  /**
   * 通过关系链字符串查找称呼
   * @param relationChain 关系链字符串，如 "妻子的父"
   * @returns 称呼
   */
  public calculate(relationChain: string): string {
    if (!relationChain || relationChain.trim() === '') {
      return '请输入关系';
    }

    // 规范化输入：先移除空格，但保留"丈夫"和"夫"的原始形式
    const cleaned = relationChain.replace(/\s+/g, '');
    
    // 先尝试原始输入（包含"丈夫"）
    let relations = cleaned.split('的').filter(r => r.length > 0);
    
    // 将"丈夫"转换为"夫"以便匹配关系类型
    const normalizedRelations = relations.map(r => r === '丈夫' ? '夫' : r) as RelationType[];
    
    if (normalizedRelations.length === 0) {
      return '无法识别的关系';
    }

    // 通过路径查找
    const title = this.findTitleByPath(normalizedRelations);
    
    if (title) {
      return title;
    }

    // 如果找不到精确匹配，尝试使用通用计算逻辑
    return this.calculateGeneric(normalizedRelations);
  }

  /**
   * 通用计算逻辑（当图中找不到精确路径时）
   */
  private calculateGeneric(_relations: RelationType[]): string {
    // 这里可以保留一些通用的计算逻辑作为后备
    // 或者返回"未知关系"
    return '未知关系';
  }

  /**
   * 获取所有可达的节点（用于调试）
   */
  public getAllNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * 获取从某个节点出发的所有关系（用于调试）
   */
  public getRelationsFrom(node: string): RelationEdge[] {
    return this.adjacencyList.get(node) || [];
  }
}

// 导出单例
export const relativeGraph = new RelativeGraph();

