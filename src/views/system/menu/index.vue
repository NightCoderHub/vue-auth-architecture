<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.keyword"
        placeholder="搜索菜单名称"
        style="width: 200px; margin-right: 10px;"
        @keyup.enter="fetchList"
      />
      <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px; margin-right: 10px;">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="fetchList">
        <Icon icon="icon-park-outline:search" /> 搜索
      </el-button>
      <el-button type="success" @click="handleAdd()">
        <Icon icon="icon-park-outline:plus" /> 新增菜单
      </el-button>
      <el-button type="warning" @click="handleExport">
        <Icon icon="icon-park-outline:file-excel" /> 导出
      </el-button>
    </div>

    <el-table
      v-loading="isLoading"
      :data="tableData"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="title" label="菜单名称" min-width="150" />

      <el-table-column prop="icon" label="图标" width="80" align="center">
        <template #default="{ row }">
          <Icon v-if="row.icon" :icon="row.icon" style="font-size: 18px;" />
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="排序" width="80" align="center" />

      <el-table-column prop="permissions" label="权限标识" min-width="150">
        <template #default="{ row }">
          <el-tag v-for="p in row.permissions" :key="p" size="small" type="info" style="margin-right: 4px;">{{ p }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="path" label="路由路径" min-width="150" show-overflow-tooltip />
      <el-table-column prop="component" label="组件路径" min-width="150" show-overflow-tooltip />

      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            <Icon icon="icon-park-outline:edit" /> 编辑
          </el-button>
          <el-button type="primary" link size="small" @click="handleAdd(row.id)">
            <Icon icon="icon-park-outline:plus" /> 新增子项
          </el-button>
          <el-button
            :type="row.status === 1 ? 'warning' : 'success'"
            link
            size="small"
            @click="handleStatusChange(row)"
          >
            <Icon :icon="row.status === 1 ? 'icon-park-outline:close-one' : 'icon-park-outline:check-one'" />
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            <Icon icon="icon-park-outline:delete" /> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <MenuDialog ref="menuDialogRef" :menu-list="tableData" @success="fetchList" />
  </div>
</template>

<script setup lang="ts">
/**
 * @description: 菜单管理列表页面
 */
defineOptions({
  name: 'MenuManagement'
})

import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import apiProvider from "@/axios/instance";
import type { MenuItem } from '@/api';
import { useGetAllMenus } from '@/api/endpoints';
import { listToTree } from '@/utils/tree';
import MenuDialog from './components/MenuDialog.vue';
import * as XLSX from 'xlsx';

/**
 * 菜单数据结构
 * 扩展自 API 返回的 MenuItem，增加 UI 层所需的 status 字段并修正 children 类型
 * 同时将 id 和 name 设为可选，以支持表单的新增模式
 */
export interface MenuData extends Omit<MenuItem, 'children' | 'id' | 'name'> {
  id?: number;
  name?: string;
  /** 状态 (1:启用, 0:禁用) */
  status?: number;
  /** 子菜单 */
  children?: MenuData[];
}

// 查询参数
const queryParams = ref({
  keyword: '',
  status: undefined as number | undefined
});

const getData = async () => {
  try {
    const response = await apiProvider.menus.getAllMenus();
    console.log('获取菜单列表成功:', response);

  } catch (error) {
    console.error('获取菜单列表失败:', error);

  }
};

// 使用 TanStack Query 获取数据
const { data: menuRawData, isLoading, refetch } = useGetAllMenus();

// 处理后的表格数据（过滤 + 树形转换）
const tableData = computed(() => {
  if (!menuRawData.value) return [];

  // 1. 映射数据（处理 status/enabled 兼容性）
  let list = menuRawData.value.map(item => ({
    ...item,
    status: (item as any).status ?? (item.enabled ? 1 : 0)
  })) as MenuData[];

  // 2. 客户端过滤
  if (queryParams.value.keyword) {
    const keyword = queryParams.value.keyword.toLowerCase();
    list = list.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.path.toLowerCase().includes(keyword)
    );
  }

  if (queryParams.value.status !== undefined) {
    list = list.filter(item => item.status === queryParams.value.status);
  }

  // 3. 转换为树形结构
  return listToTree(list);
});

// 引用弹窗组件
const menuDialogRef = ref<InstanceType<typeof MenuDialog>>();

// 获取列表 (手动刷新)
const fetchList = () => {
  refetch();
};

// 新增
const handleAdd = (parentId?: number) => {
  const defaultData = parentId ? { parentId } as MenuData : undefined;
  menuDialogRef.value?.open(defaultData);
};

// 编辑
const handleEdit = (row: MenuData) => {
  menuDialogRef.value?.open(row);
};

// 删除
const handleDelete = (row: MenuData) => {
  ElMessageBox.confirm(
    `确定要删除菜单 "${row.title}" 吗？如果包含子菜单将一并删除。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      if (row.id) {
        await apiProvider.menus.deleteMenu(row.id);
        ElMessage.success('删除成功');
        fetchList();
      }
    } catch (error) {
      console.error(error);
    }
  }).catch(() => {
    // 取消删除
  });
};

// 状态切换
const handleStatusChange = async (row: MenuData) => {
  if (!row.id || row.status === undefined) return;
  const newStatus = row.status === 1 ? 0 : 1;
  const text = newStatus === 1 ? '启用' : '禁用';

  try {
    // await apiProvider.menus.updateMenuStatus(row.id, newStatus);
    row.status = newStatus;
    ElMessage.success(`已${text}菜单`);
  } catch (error) {
    // 恢复状态
    // row.status = row.status === 1 ? 0 : 1;
    console.error(error);
  }
};

// 导出 Excel
const handleExport = () => {
  // 扁平化数据用于导出
  const flatData: any[] = [];
  const flatten = (list: MenuData[]) => {
    list.forEach(item => {
      const { children, ...rest } = item;
      flatData.push(rest);
      if (children) flatten(children);
    });
  };
  flatten(tableData.value);

  const ws = XLSX.utils.json_to_sheet(flatData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Menus");
  XLSX.writeFile(wb, "menu_list.xlsx");
};

</script>



<style scoped>
.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
</style>
