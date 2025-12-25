<template>
  <component :is="type" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script setup lang="ts">
/**
 * @description: 链接组件
 * 自动识别内部链接 (router-link) 和外部链接 (a 标签)
 */
import { computed } from 'vue';

const props = defineProps<{
  /** 链接地址 */
  to: string
}>();

const isExternal = computed(() => {
  return /^(https?:|mailto:|tel:)/.test(props.to);
});

const type = computed(() => {
  if (isExternal.value) {
    return 'a';
  }
  return 'router-link';
});

const linkProps = (to: string) => {
  if (isExternal.value) {
    return {
      href: to,
      target: '_blank',
      rel: 'noopener',
    };
  }
  return {
    to: to,
  };
};
</script>
