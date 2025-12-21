<template>
  <slot v-if="hasAccess" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermissionStore } from '../permission/permissionStore';

const props = defineProps<{
  code: string
}>();

const permissionStore = usePermissionStore();

// 检查用户是否拥有特定权限代码
const hasAccess = computed(() => {
  // 如果 'admin' 角色暗示所有权限，在此处理。
  // 目前，严格匹配。
  return permissionStore.permissions.includes(props.code);
});
</script>
