<script setup lang="ts">

/**
 * @description: 步骤 1 - 基础信息
 */
interface Props {
  /** 校验错误信息 */
  errors: Record<string, string | undefined>;
}

const props = defineProps<Props>();

// 使用平铺的 defineModel 确保响应式直达父组件
const name = defineModel<string>('name');
const code = defineModel<string>('code');
const foundingDate = defineModel<string>('foundingDate');
const investmentAmountUSD = defineModel<number>('investmentAmountUSD');
</script>

<template>
  <div class="step-basic">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="企业名称" :error="errors['basicInfo.name']" >
          <el-input
            v-model="name"
            placeholder="请输入企业名称"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="统一社会信用代码" :error="errors['basicInfo.code']" >
          <el-input
            v-model="code"
            placeholder="18位统一社会信用代码"
          />
          <div class="tip">输入 '999' 将触发模拟的异步校验拦截</div>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="成立日期" :error="errors['basicInfo.foundingDate']" >
          <el-date-picker
            v-model="foundingDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="投资金额 (USD)" :error="errors['basicInfo.investmentAmountUSD']" >
          <el-input-number
            v-model="investmentAmountUSD"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 4px;
}
</style>
