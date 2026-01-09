<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';

/**
 * @description: 步骤 3A - 安全审查
 */
</script>

<template>
  <div class="step-security-review">
    <el-alert title="触发安全审查" type="warning" show-icon :closable="false" class="mb-4">
      由于您选择的目的地属于敏感区域，请完成以下安全问卷。
    </el-alert>
    <el-form-item label="安全问卷上传 (模拟)">
      <el-upload drag action="#" multiple>
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
      </el-upload>
    </el-form-item>
  </div>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>
