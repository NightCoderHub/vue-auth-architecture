<script setup lang="ts">
/**
 * @description: 菜单管理列表页面
 */
defineOptions({
  name: 'MenuManagement'
})

import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMenuList, deleteMenu, updateMenuStatus, type MenuData } from '@/api/system/menu';
import MenuDialog from './components/MenuDialog.vue';
import Sortable from 'sortablejs';
import * as XLSX from 'xlsx';

// 列表数据
const loading = ref(false);
const tableData = ref<MenuData[]>([]);
const queryParams = ref({
  keyword: '',
  status: undefined
});

// 引用弹窗组件
const menuDialogRef = ref<InstanceType<typeof MenuDialog>>();

// 获取列表
const fetchList = async () => {
  loading.value = true;
  try {
    const { data } = await getMenuList(queryParams.value);
    if (data.code === 200 && data.data) {
      tableData.value = data.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
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
        await deleteMenu(row.id);
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
    await updateMenuStatus(row.id, newStatus);
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

// 拖拽排序初始化
const initSortable = () => {
  const el = document.querySelector('.el-table__body-wrapper tbody');
  if (el) {
    Sortable.create(el as HTMLElement, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: ({ newIndex, oldIndex }) => {
        if (newIndex !== undefined && oldIndex !== undefined && newIndex !== oldIndex) {
          ElMessage.success(`排序已更新: ${oldIndex} -> ${newIndex} (仅前端演示)`);
          // 实际场景需调用后端排序接口
        }
      }
    });
  }
};

onMounted(() => {
  console.log(1);
  fetchList();
  nextTick(() => {
    initSortable();
  });
});
</script>

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
      v-loading="loading"
      :data="tableData"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column width="50" align="center">
        <template #default>
          <Icon icon="icon-park-outline:drag" class="drag-handle" style="cursor: grab; color: #999;" />
        </template>
      </el-table-column>

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

<style scoped>
.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
</style>
