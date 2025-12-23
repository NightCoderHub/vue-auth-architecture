/**
 * Path Governance Utilities
 * 路径治理核心工具
 *
 * 负责全系统的路径标准化处理，确保 Trailing Slash 的一致性。
 * 规则：非根路径（/）严禁尾随斜杠。
 */

/**
 * 标准化路径
 * 移除路径末尾的斜杠（除非是根路径 /）
 *
 * @param path 原始路径
 * @returns 标准化后的路径
 *
 * @example
 * normalizePath('/user/') // '/user'
 * normalizePath('/user')  // '/user'
 * normalizePath('/')      // '/'
 * normalizePath('')       // ''
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  if (path === '/') return path;

  // 如果包含查询参数或 Hash，需要分别处理
  const hashIndex = path.indexOf('#');
  const queryIndex = path.indexOf('?');
  
  // 找到路径结束的位置（在 ? 或 # 之前）
  let pathEndIndex = path.length;
  if (queryIndex !== -1) {
    pathEndIndex = queryIndex;
  }
  if (hashIndex !== -1) {
    // 如果有 query，hash 肯定在 query 之后，所以 min 是多余的，但为了安全
    pathEndIndex = Math.min(pathEndIndex, hashIndex);
  }

  const purePath = path.substring(0, pathEndIndex);
  const suffix = path.substring(pathEndIndex);

  if (purePath !== '/' && purePath.endsWith('/')) {
    return purePath.slice(0, -1) + suffix;
  }

  return path;
}

/**
 * 比较两个路径是否相等（忽略尾随斜杠）
 * @param pathA
 * @param pathB
 */
export function isPathEqual(pathA: string, pathB: string): boolean {
  return normalizePath(pathA) === normalizePath(pathB);
}
