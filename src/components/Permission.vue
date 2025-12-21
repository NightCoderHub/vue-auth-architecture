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

// Check if user has the specific permission code
const hasAccess = computed(() => {
  // If 'admin' role implies all permissions, handle it here.
  // For now, strict match.
  return permissionStore.permissions.includes(props.code);
});
</script>
