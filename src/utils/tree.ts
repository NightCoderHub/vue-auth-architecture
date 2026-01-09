/**
 * 将扁平列表转换为树形结构
 * @param list 原始扁平列表
 * @param options 配置项
 * @returns 树形结构列表
 */
export function listToTree<T extends Record<string, any>>(
  list: T[],
  options: {
    idKey?: string;
    parentIdKey?: string;
    childrenKey?: string;
  } = {}
): T[] {
  const {
    idKey = 'id',
    parentIdKey = 'parentId',
    childrenKey = 'children'
  } = options;

  const nodeMap = new Map<string | number, T>();
  const tree: T[] = [];

  // 首先将所有节点存入 map
  for (const node of list) {
    nodeMap.set(node[idKey], { ...node, [childrenKey]: [] });
  }

  // 构建树形结构
  for (const node of list) {
    const currentNode = nodeMap.get(node[idKey])!;
    const parentId = node[parentIdKey];

    if (parentId !== null && parentId !== undefined && nodeMap.has(parentId)) {
      const parentNode = nodeMap.get(parentId)!;
      if (!parentNode[childrenKey]) {
        (parentNode as any)[childrenKey] = [];
      }
      parentNode[childrenKey].push(currentNode);
    } else {
      tree.push(currentNode);
    }
  }

  return tree;
}
