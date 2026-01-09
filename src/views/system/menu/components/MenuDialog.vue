<script setup lang="ts">
/**
 * @description: 菜单编辑/新增弹窗组件
 */
import { ref, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import apiProvider from "@/axios/instance";
import type { MenuData } from '../index.vue';

// Props 定义
interface Props {
  menuList: MenuData[]; // 用于父级菜单选择的树形数据
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'success'): void;
}>();

// 弹窗状态
const visible = ref(false);
const isEdit = ref(false);
const loading = ref(false);

// 表单数据
const formRef = ref<FormInstance>();
const formData = reactive<MenuData>({
  parentId: null,
  title: '',
  name: '',
  path: '',
  component: 'Layout',
  type: 1, // 默认为菜单
  icon: '',
  sort: 0,
  permissions: [],
  hidden: false,
  keepAlive: true,
  status: 1
});

// 权限标识输入辅助
const permissionInput = ref('');
const handlePermissionAdd = () => {
  if (permissionInput.value) {
    if (!formData.permissions) formData.permissions = [];
    if (!formData.permissions.includes(permissionInput.value)) {
      formData.permissions.push(permissionInput.value);
    }
    permissionInput.value = '';
  }
};
const handlePermissionClose = (tag: string) => {
  formData.permissions = formData.permissions?.filter(p => p !== tag);
};

// 表单校验规则
const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
});

// 计算属性：树形选择器的数据（排除自身及其子节点，防止循环引用）
const treeOptions = computed(() => {
  if (!isEdit.value || !formData.id) {
    return props.menuList;
  }

  /**
   * 递归过滤掉指定 ID 的节点及其子节点
   * @param list 菜单列表
   * @param targetId 要排除的节点 ID
   */
  const filterTree = (list: MenuData[], targetId: number): MenuData[] => {
    return list
      .filter(item => item.id !== targetId)
      .map(item => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: filterTree(item.children, targetId)
          };
        }
        return item;
      });
  };

  return filterTree(props.menuList, formData.id);
});

/**
 * 打开弹窗
 * @param row 编辑时传入的行数据，新增时不传
 */
const open = (row?: MenuData) => {
  visible.value = true;
  formRef.value?.resetFields();

  if (row) {
    isEdit.value = true;
    Object.assign(formData, JSON.parse(JSON.stringify(row)));
    // 兼容处理：确保 permissions 是数组
    if (!Array.isArray(formData.permissions)) {
      formData.permissions = row.permissions ? [row.permissions as any] : [];
    }
  } else {
    isEdit.value = false;
    // 重置表单
    formData.id = undefined;
    formData.parentId = null;
    formData.title = '';
    formData.name = '';
    formData.path = '';
    formData.component = 'Layout';
    formData.type = 1;
    formData.icon = '';
    formData.sort = 0;
    formData.permissions = [];
    formData.hidden = false;
    formData.keepAlive = true;
    formData.status = 1;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        if (isEdit.value && formData.id) {
          await apiProvider.menus.updateMenu(formData.id, formData as any);
          ElMessage.success('更新成功');
        } else {
          await apiProvider.menus.createMenu(formData as any);
          ElMessage.success('创建成功');
        }
        visible.value = false;
        emit('success');
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 暴露方法给父组件
defineExpose({
  open
});
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="treeOptions"
          :props="{ label: 'title', children: 'children' }"
          value-key="id"
          placeholder="选择上级菜单"
          check-strictly
          clearable
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="菜单类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button :value="0">目录</el-radio-button>
          <el-radio-button :value="1">菜单</el-radio-button>
          <el-radio-button :value="2">按钮</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="菜单名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入菜单名称" />
      </el-form-item>

      <template v-if="formData.type !== 2">
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称 (如 icon-park-outline:home)">
            <template #prefix>
              <Icon v-if="formData.icon" :icon="formData.icon" />
            </template>
          </el-input>
          <div class="form-tip">支持 Iconify 图标库，如 icon-park-outline:setting</div>
        </el-form-item>

        <el-form-item label="路由路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路由路径 (如 /system/user)" />
        </el-form-item>

        <el-form-item label="组件路径" prop="component">
          <el-input v-model="formData.component" placeholder="请输入组件路径 (如 system/UserList)" />
        </el-form-item>
      </template>

      <el-form-item label="权限标识" prop="permissions">
        <div class="permission-tags">
          <el-tag
            v-for="tag in formData.permissions"
            :key="tag"
            closable
            @close="handlePermissionClose(tag)"
            style="margin-right: 5px; margin-bottom: 5px;"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="formData.permissions?.length === 0 || permissionInput"
            v-model="permissionInput"
            size="small"
            style="width: 150px"
            placeholder="输入后回车添加"
            @keyup.enter="handlePermissionAdd"
            @blur="handlePermissionAdd"
          />
          <el-button v-else size="small" @click="permissionInput = ' '">+ 新增权限</el-button>
        </div>
        <div class="form-tip">例如: system:user:add</div>
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="999" />
      </el-form-item>

      <template v-if="formData.type !== 2">
        <el-form-item label="显示状态" prop="hidden">
          <el-switch
            v-model="formData.hidden"
            :active-value="false"
            :inactive-value="true"
            active-text="显示"
            inactive-text="隐藏"
          />
        </el-form-item>

        <el-form-item label="页面缓存" prop="keepAlive">
          <el-switch
            v-model="formData.keepAlive"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
      </template>

      <el-form-item label="菜单状态" prop="status">
        <el-switch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin-top: 4px;
}
.permission-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
