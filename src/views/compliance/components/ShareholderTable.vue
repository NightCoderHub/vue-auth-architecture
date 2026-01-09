<script setup lang="ts">
import { useFieldArray, useFieldError, Field } from 'vee-validate';
import { computed } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';

/**
 * @description: 股东信息动态表格组件
 * 负责管理股东列表的增删改及校验展示
 */

const props = defineProps<{
  name: string; // 表单字段路径，例如 'shareholders'
  errors?: Record<string, string | undefined>;
}>();

// 使用 vee-validate 的 array hook
const { remove, push, fields } = useFieldArray(props.name);

// 获取该数组字段的整体错误（例如：总和不为100%）
const arrayError = useFieldError(props.name);

// 计算当前持股比例总和
const totalRatio = computed(() => {
  return fields.value.reduce((sum, field: any) => {
    // field.value 是当前行的数据代理
    const val = field.value.ratio;
    return sum + (Number(val) || 0);
  }, 0);
});

const addShareholder = () => {
  push({ name: '', ratio: 0, nationality: '' });
};
</script>

<template>
  <div class="shareholder-table">
    <div class="header">
      <h3>股东信息</h3>
      <el-button type="primary" size="small" :icon="Plus" @click="addShareholder">
        添加股东
      </el-button>
    </div>

    <el-table :data="fields" style="width: 100%" border>
      <el-table-column label="姓名" min-width="150">
        <template #default="{  $index }">
          <!-- 动态绑定路径：shareholders[0].name -->
          <Field :name="`${props.name}[${$index}].name`" v-slot="{ componentField, errorMessage }">
            <el-input v-bind="componentField" placeholder="请输入姓名" />
            <div class="error-msg" v-if="errorMessage">{{ errorMessage }}</div>
          </Field>
        </template>
      </el-table-column>

      <el-table-column label="持股比例 (%)" min-width="150">
        <template #default="{  $index }">
          <Field :name="`${props.name}[${$index}].ratio`" v-slot="{ componentField, errorMessage }">
            <el-input-number
              v-bind="componentField"
              :min="0"
              :max="100"
              :precision="2"
              style="width: 100%"
            />
            <div class="error-msg" v-if="errorMessage">{{ errorMessage }}</div>
          </Field>
        </template>
      </el-table-column>

      <el-table-column label="国籍" min-width="150">
        <template #default="{  $index }">
           <Field :name="`${props.name}[${$index}].nationality`" v-slot="{ componentField, errorMessage }">
            <el-input v-bind="componentField" placeholder="请输入国籍" />
            <div class="error-msg" v-if="errorMessage">{{ errorMessage }}</div>
          </Field>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="80" align="center">
        <template #default="{ $index }">
          <el-button type="danger" link :icon="Delete" @click="remove($index)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部统计与错误展示 -->
    <div class="footer">
      <div class="summary">
        当前总持股比例:
        <span :class="{ 'text-success': totalRatio === 100, 'text-error': totalRatio !== 100 }">
          {{ totalRatio.toFixed(2) }}%
        </span>
      </div>
      <el-alert
        v-if="arrayError"
        :title="arrayError"
        type="error"
        :closable="false"
        show-icon
        class="mt-2"
      />
    </div>
  </div>
</template>

<style scoped>
.shareholder-table {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  padding: 15px;
  border-radius: 4px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.error-msg {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}
.footer {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}
.text-error { color: #f56c6c; font-weight: bold; }
.text-success { color: #67c23a; font-weight: bold; }
.mt-2 { margin-top: 8px; }
</style>
