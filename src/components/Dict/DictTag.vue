<template>
  <el-tag
    v-if="showLabel && showLabel !== emptyValue"
    :type="tagType"
    :class="dictItem?.cssClass"
  >
    {{ showLabel }}
  </el-tag>
  <span v-else>{{ showLabel }}</span>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDictStore } from '@/dict/dictStore';

/**
 * @description: 字典展示组件 (DictTag)
 * 自动根据 dictType 和 value 显示对应的标签 label 和样式
 */
defineOptions({
  name: 'DictTag'
});

interface Props {
  /** 字典类型 */
  type: string;
  /** 业务值 (String/Number/Boolean) */
  value?: string | number | boolean;
  /** 找不到字典时是否显示原值 */
  showRaw?: boolean;
  /** 空值时的占位符 */
  emptyValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showRaw: true,
  emptyValue: '-'
});

const dictStore = useDictStore();

// 获取当前类型的字典列表
const options = computed(() => dictStore.dictMap[props.type] || []);

// 查找匹配的字典项
const dictItem = computed(() => {
  if (props.value === undefined || props.value === null || props.value === '') {
    return null;
  }
  // 兼容字符串和数字比较
  return options.value.find(item => String(item.value) === String(props.value));
});

// 计算显示文本
const showLabel = computed(() => {
  if (dictItem.value) {
    return dictItem.value.label;
  }
  if (props.value === undefined || props.value === null || props.value === '') {
    return props.emptyValue;
  }
  return props.showRaw ? String(props.value) : '';
});

// 计算 Tag 类型
const tagType = computed(() => {
  if (dictItem.value && dictItem.value.listClass) {
    const listClass = dictItem.value.listClass;
    // 映射 element-plus 的 tag type: success/info/warning/danger/primary
    if (['success', 'info', 'warning', 'danger', 'primary'].includes(listClass)) {
      return listClass as 'success' | 'info' | 'warning' | 'danger' | 'primary';
    }
  }
  return undefined; // 默认样式
});

// 组件挂载时尝试加载字典数据 (如果 store 中没有)
onMounted(() => {
  if (!options.value.length) {
    dictStore.getDict(props.type);
  }
});
</script>

<style scoped>
/* 可根据需要添加额外样式 */
</style>
