/**
 * 亲戚关系计算器
 * 用于计算复杂的亲戚关系链并得出正确的称呼
 */

export type RelationType = '父' | '母' | '夫' | '妻' | '兄' | '弟' | '姐' | '妹' | '子' | '女';

/**
 * 关系节点
 */
interface RelationNode {
  type: RelationType;
  gender: 'male' | 'female';
  generation: number; // 辈分：0=同辈，正数=长辈，负数=晚辈
}

/**
 * 关系映射表
 */
const RELATION_MAP: Record<RelationType, { gender: 'male' | 'female'; generation: number }> = {
  父: { gender: 'male', generation: 1 },
  母: { gender: 'female', generation: 1 },
  夫: { gender: 'male', generation: 0 },
  妻: { gender: 'female', generation: 0 },
  兄: { gender: 'male', generation: 0 },
  弟: { gender: 'male', generation: 0 },
  姐: { gender: 'female', generation: 0 },
  妹: { gender: 'female', generation: 0 },
  子: { gender: 'male', generation: -1 },
  女: { gender: 'female', generation: -1 },
};

/**
 * 称呼映射表
 * 格式: {generation}_{gender}_{relationType} -> 称呼
 */
const TITLE_MAP: Record<string, string> = {
  // 长辈 - 男性
  '2_male_父': '太爷爷',
  '2_male_母': '太外公',
  '1_male_父': '爷爷',
  '1_male_母': '外公',
  '1_male_兄': '伯父',
  '1_male_弟': '叔父',
  '1_male_姐': '姑父',
  '1_male_妹': '姑父',
  '1_male_子': '父亲',
  '1_male_女': '父亲',
  '1_male_夫': '公公',
  '1_male_妻': '岳父',
  
  // 长辈 - 女性
  '2_female_父': '太奶奶',
  '2_female_母': '太外婆',
  '1_female_父': '奶奶',
  '1_female_母': '外婆',
  '1_female_兄': '伯母',
  '1_female_弟': '婶婶',
  '1_female_姐': '姑妈',
  '1_female_妹': '姑妈',
  '1_female_子': '母亲',
  '1_female_女': '母亲',
  '1_female_夫': '婆婆',
  '1_female_妻': '岳母',
  
  // 同辈 - 男性
  '0_male_兄': '哥哥',
  '0_male_弟': '弟弟',
  '0_male_姐': '姐夫',
  '0_male_妹': '妹夫',
  '0_male_夫': '丈夫',
  '0_male_妻': '妻子',
  '0_male_父': '父亲',
  '0_male_母': '母亲',
  
  // 同辈 - 女性
  '0_female_姐': '姐姐',
  '0_female_妹': '妹妹',
  '0_female_兄': '嫂子',
  '0_female_弟': '弟媳',
  '0_female_夫': '丈夫',
  '0_female_妻': '妻子',
  '0_female_父': '父亲',
  '0_female_母': '母亲',
  
  // 晚辈 - 男性
  '-1_male_子': '儿子',
  '-1_male_女': '女婿',
  '-1_male_兄': '侄子',
  '-1_male_弟': '侄子',
  '-1_male_姐': '外甥',
  '-1_male_妹': '外甥',
  
  // 晚辈 - 女性
  '-1_female_子': '儿媳',
  '-1_female_女': '女儿',
  '-1_female_兄': '侄女',
  '-1_female_弟': '侄女',
  '-1_female_姐': '外甥女',
  '-1_female_妹': '外甥女',
};

/**
 * 特殊关系组合的称呼
 */
const SPECIAL_RELATIONS: Record<string, string> = {
  '妻子的父': '岳父',
  '妻子的母': '岳母',
  '妻子的兄': '大舅子',
  '妻子的弟': '小舅子',
  '妻子的姐': '大姨子',
  '妻子的妹': '小姨子',
  '妻子的子': '继子',
  '妻子的女': '继女',
  '妻子的父的子': '舅仔',
  '妻子的父的兄': '大舅子',
  '妻子的父的弟': '小舅子',
  '妻子的母的子': '舅仔',
  '妻子的母的兄': '大舅子',
  '妻子的母的弟': '小舅子',
  
  '丈夫的父': '公公',
  '丈夫的母': '婆婆',
  '丈夫的兄': '大伯',
  '丈夫的弟': '小叔',
  '丈夫的姐': '大姑',
  '丈夫的妹': '小姑',
  '丈夫的子': '继子',
  '丈夫的女': '继女',
  
  '父的父': '爷爷',
  '父的母': '奶奶',
  '父的兄': '伯父',
  '父的弟': '叔父',
  '父的姐': '姑妈',
  '父的妹': '姑妈',
  '父的子': '哥哥/弟弟',
  '父的女': '姐姐/妹妹',
  
  '母的父': '外公',
  '母的母': '外婆',
  '母的兄': '舅舅',
  '母的弟': '舅舅',
  '母的姐': '姨妈',
  '母的妹': '姨妈',
  '母的子': '哥哥/弟弟',
  '母的女': '姐姐/妹妹',
  
  '兄的妻': '嫂子',
  '弟的妻': '弟媳',
  '兄的子': '侄子',
  '弟的子': '侄子',
  '兄的女': '侄女',
  '弟的女': '侄女',
  
  '姐的夫': '姐夫',
  '妹的夫': '妹夫',
  '姐的子': '外甥',
  '妹的子': '外甥',
  '姐的女': '外甥女',
  '妹的女': '外甥女',
  
  '子的妻': '儿媳',
  '女的夫': '女婿',
  '子的子': '孙子',
  '子的女': '孙女',
  '女的子': '外孙',
  '女的女': '外孙女',
};

/**
 * 亲戚关系计算器类
 */
export class RelativeCalculator {
  /**
   * 解析关系链字符串
   * @param relationChain 关系链，如 "妻子的父的子"
   * @returns 关系类型数组
   */
  private parseRelationChain(relationChain: string): RelationType[] {
    const relations: RelationType[] = [];
    const validRelations: RelationType[] = ['父', '母', '夫', '妻', '兄', '弟', '姐', '妹', '子', '女'];
    
    // 移除所有空格和"的"字
    const cleaned = relationChain.replace(/\s+/g, '').replace(/的/g, '');
    
    // 逐个字符匹配关系
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i] as RelationType;
      if (validRelations.includes(char)) {
        relations.push(char);
      }
    }
    
    return relations;
  }

  /**
   * 计算关系链的最终节点
   * @param relations 关系类型数组
   * @returns 最终关系节点
   */
  private calculateFinalNode(relations: RelationType[]): RelationNode {
    if (relations.length === 0) {
      throw new Error('关系链不能为空');
    }

    let currentNode: RelationNode = {
      type: relations[0],
      gender: RELATION_MAP[relations[0]].gender,
      generation: RELATION_MAP[relations[0]].generation,
    };

    // 从第二个关系开始计算
    for (let i = 1; i < relations.length; i++) {
      const nextRelation = relations[i];
      const nextRelationInfo = RELATION_MAP[nextRelation];

      // 计算新的性别（如果是通过配偶关系，性别会改变）
      let newGender = currentNode.gender;
      if (nextRelation === '夫' || nextRelation === '妻') {
        newGender = nextRelation === '夫' ? 'male' : 'female';
      } else if (nextRelationInfo.gender !== currentNode.gender && 
                 (nextRelation === '父' || nextRelation === '母' || 
                  nextRelation === '子' || nextRelation === '女')) {
        // 通过父母或子女关系，性别可能改变
        newGender = nextRelationInfo.gender;
      }

      // 计算新的辈分
      const newGeneration = currentNode.generation + nextRelationInfo.generation;

      currentNode = {
        type: nextRelation,
        gender: newGender,
        generation: newGeneration,
      };
    }

    return currentNode;
  }

  /**
   * 获取称呼
   * @param relationChain 关系链字符串
   * @returns 称呼结果
   */
  public calculate(relationChain: string): string {
    if (!relationChain || relationChain.trim() === '') {
      return '请输入关系';
    }

    // 先检查特殊关系组合
    const cleanedChain = relationChain.replace(/\s+/g, '');
    if (SPECIAL_RELATIONS[cleanedChain]) {
      return SPECIAL_RELATIONS[cleanedChain];
    }

    try {
      const relations = this.parseRelationChain(relationChain);
      if (relations.length === 0) {
        return '无法识别的关系';
      }

      const finalNode = this.calculateFinalNode(relations);
      
      // 构建查找键
      const key = `${finalNode.generation}_${finalNode.gender}_${finalNode.type}`;
      
      if (TITLE_MAP[key]) {
        return TITLE_MAP[key];
      }

      // 如果没有找到精确匹配，尝试生成通用称呼
      return this.generateGenericTitle(finalNode);
    } catch (error) {
      return '计算错误，请检查输入';
    }
  }

  /**
   * 生成通用称呼（当没有精确匹配时）
   */
  private generateGenericTitle(node: RelationNode): string {
    if (node.generation > 1) {
      return node.gender === 'male' ? '太爷爷辈' : '太奶奶辈';
    }
    if (node.generation === 1) {
      return node.gender === 'male' ? '长辈（男）' : '长辈（女）';
    }
    if (node.generation === 0) {
      return node.gender === 'male' ? '同辈（男）' : '同辈（女）';
    }
    if (node.generation === -1) {
      return node.gender === 'male' ? '晚辈（男）' : '晚辈（女）';
    }
    return '未知关系';
  }

  /**
   * 格式化关系链显示
   * @param relationChain 关系链字符串
   * @returns 格式化后的字符串
   */
  public formatRelationChain(relationChain: string): string {
    const cleaned = relationChain.replace(/\s+/g, '');
    const relations = this.parseRelationChain(cleaned);
    return relations.join('的');
  }
}

// 导出单例
export const relativeCalculator = new RelativeCalculator();

