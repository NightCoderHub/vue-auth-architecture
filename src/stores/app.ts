import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const sidebar = ref({
    opened: true,
    withoutAnimation: false,
  });

  const device = ref('desktop');

  const toggleSidebar = () => {
    sidebar.value.opened = !sidebar.value.opened;
    sidebar.value.withoutAnimation = false;
  };

  const closeSidebar = (withoutAnimation: boolean) => {
    sidebar.value.opened = false;
    sidebar.value.withoutAnimation = withoutAnimation;
  };

  const toggleDevice = (d: string) => {
    device.value = d;
  };

  return {
    sidebar,
    device,
    toggleSidebar,
    closeSidebar,
    toggleDevice,
  };
}, {
  persist: true
});
