<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import logoImg from '@/assets/vue.svg';

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});

const title = ref('Vue Admin');
const logo = ref(logoImg);
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter-from,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: $sideLogoHeight;
  line-height: $sideLogoHeight;
  background: $menuBg;
  text-align: center;
  overflow: hidden;

  &.collapse {
    .sidebar-logo {
      margin-right: 0px !important;
    }
  }

  .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .sidebar-logo {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .sidebar-title {
      display: inline-block;
      margin: 0;
      color: $menuText;
      font-weight: $sideLogoFontWeight;
      line-height: normal;
      font-size: $sideLogoFontSize;
      font-family: var(--font-family);
      white-space: nowrap; // Prevent wrap
    }
  }
}
</style>
