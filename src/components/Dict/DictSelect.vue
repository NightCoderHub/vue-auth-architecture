<template>
  <!-- Select 模式 -->
  <el-select
    v-if="renderType === 'select'"
    v-model="modelValue"
    v-bind="$attrs"
    style="width: 100%"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="Boolean($attrs.disabled)"
    />
  </el-select>

  <!-- Radio 模式 -->
  <el-radio-group
      v-else-if="renderType === 'radio'"
      :model-value="modelValue as any"
      @update:model-value="(val: any) => modelValue = val"
      v-bind="$attrs"
    >
      <el-radio
        v-for="item in options"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </el-radio>
    </el-radio-group>

    <!-- Checkbox 模式 -->
    <el-checkbox-group
      v-else-if="renderType === 'checkbox'"
      :model-value="modelValue as any"
      @update:model-value="(val: any) => modelValue = val"
      v-bind="$attrs"
    >
    <el-checkbox
      v-for="item in options"
      :key="item.value"
      :value="item.value"
    >
      {{ item.label }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useDictStore } from '@/dict/dictStore';

/**
 * @description: 字典选择组件 (DictSelect)
 * 自动加载字典数据，支持 Select/Radio/Checkbox 模式
 */
defineOptions({
  name: 'DictSelect'
});

interface Props {
  /** 字典类型 */
  dictType: string;
  /** 排除掉某些值 (数组) */
  exclude?: (string | number)[];
  /** 渲染模式 */
  renderType?: 'select' | 'radio' | 'checkbox';
  /** 值类型转换 */
  valueType?: 'string' | 'number' | 'boolean';
}

const props = withDefaults(defineProps<Props>(), {
  exclude: () => [],
  renderType: 'select',
  valueType: undefined
});

// Vue 3.4+ defineModel
const modelValue = defineModel<string | number | boolean | (string | number | boolean)[] | undefined>();

const dictStore = useDictStore();

// 获取原始字典列表
const rawOptions = computed(() => dictStore.dictMap[props.dictType] || []);

// 处理后的选项列表（类型转换 + 过滤）
const options = computed(() => {
  let opts = [...rawOptions.value];

  // 1. 类型转换 (解决后端返回 String 前端需要 Number 的问题)
  if (props.valueType) {
    opts = opts.map(item => {
      let newValue: string | number | boolean = item.value;
      if (props.valueType === 'number') {
        newValue = Number(item.value);
      } else if (props.valueType === 'string') {
        newValue = String(item.value);
      } else if (props.valueType === 'boolean') {
        newValue = Boolean(item.value);
      }
      return { ...item, value: newValue as any };
    });
  }

  // 2. 排除特定值 (统一转字符串比较，避免类型差异导致过滤失效)
  if (props.exclude && props.exclude.length > 0) {
    const excludeSet = new Set(props.exclude.map(e => String(e)));
    opts = opts.filter(item => !excludeSet.has(String(item.value)));
  }

  return opts;
});

// 自动设置默认值
watch(options, (newOptions) => {
  if (!newOptions.length) return;
  // 如果当前没有值，且存在默认项，则自动选中
  if (modelValue.value === undefined || modelValue.value === '' || (Array.isArray(modelValue.value) && modelValue.value.length === 0)) {
    const defaultItem = newOptions.find(item => item.isDefault);
    if (defaultItem) {
      if (props.renderType === 'checkbox') {
         if (Array.isArray(modelValue.value)) {
           if (!modelValue.value.includes(defaultItem.value)) {
             modelValue.value = [defaultItem.value];
           }
         } else {
            modelValue.value = [defaultItem.value];
         }
      } else {
        modelValue.value = defaultItem.value;
      }
    }
  }
}, { immediate: true });

// 组件挂载时请求数据
onMounted(() => {
  if (!rawOptions.value.length) {
    dictStore.getDict(props.dictType);
  }
});
</script>

<style scoped>
</style>
