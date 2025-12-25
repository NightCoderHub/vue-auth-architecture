import { onBeforeMount, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';

const { body } = document;
const WIDTH = 992; // Bootstrap md breakpoint

/**
 * 响应式布局处理 Hook
 * 自动根据窗口大小切换移动端/桌面端模式
 */
export default function useResizeHandler() {
  const appStore = useAppStore();
  const route = useRoute();

  const device = computed(() => appStore.device);
  const sidebar = computed(() => appStore.sidebar);

  const isMobile = () => {
    const rect = body.getBoundingClientRect();
    return rect.width - 1 < WIDTH;
  };

  const resizeHandler = () => {
    if (!document.hidden) {
      const isMobileDevice = isMobile();
      appStore.toggleDevice(isMobileDevice ? 'mobile' : 'desktop');

      if (isMobileDevice) {
        appStore.closeSidebar(true);
      }
    }
  };

  watch(
    () => route.path,
    () => {
      if (device.value === 'mobile' && sidebar.value.opened) {
        appStore.closeSidebar(false);
      }
    }
  );

  onBeforeMount(() => {
    window.addEventListener('resize', resizeHandler);
  });

  onMounted(() => {
    const isMobileDevice = isMobile();
    if (isMobileDevice) {
      appStore.toggleDevice('mobile');
      appStore.closeSidebar(true);
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler);
  });

  return {
    device,
    sidebar,
  };
}
