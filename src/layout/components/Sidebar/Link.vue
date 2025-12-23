<template>
  <component :is="type" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Link Component
 *
 * Automatically renders an anchor tag (<a>) for external links
 * or a <router-link> for internal routes.
 */

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
});

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
