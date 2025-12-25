import apiClient from '@/axios';

export interface MenuData {
  id?: number;
  parentId?: number | null;
  title: string;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  type?: number; // 0:目录 1:菜单 2:按钮
  permissions?: string[];
  hidden?: boolean;
  keepAlive?: boolean;
  alwaysShow?: boolean;
  redirect?: string;
  status?: number; // 1:启用 0:禁用
  children?: MenuData[];
}

export interface MenuQueryParams {
  keyword?: string;
  status?: number;
}

// 获取菜单列表
export function getMenuList(params?: MenuQueryParams) {
  return apiClient.get<MenuData[]>('/menus', { params });
}

// 新增菜单
export function createMenu(data: MenuData) {
  return apiClient.post<MenuData>('/menus', data);
}

// 获取菜单详情
export function getMenuDetail(id: number) {
  return apiClient.get<MenuData>(`/menus/${id}`);
}

// 更新菜单
export function updateMenu(id: number, data: MenuData) {
  return apiClient.put<null>(`/menus/${id}`, data);
}

// 删除菜单
export function deleteMenu(id: number) {
  return apiClient.delete<null>(`/menus/${id}`);
}

// 切换状态
export function updateMenuStatus(id: number, status: number) {
  return apiClient.patch<null>(`/menus/${id}/status`, { status });
}
