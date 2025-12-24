<template>
  <div class="role-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" size="small">新增角色</el-button>
        </div>
      </template>

      <el-table :data="roleData" style="width: 100%" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色标识" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default>
            <el-button link type="primary" size="small">分配权限</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const roleData = ref([
  {
    id: 1,
    name: 'admin',
    description: '系统管理员，拥有所有权限',
    createTime: '2023-01-01 12:00:00'
  },
  {
    id: 2,
    name: 'editor',
    description: '内容编辑，拥有部分权限',
    createTime: '2023-01-02 10:00:00'
  },
  {
    id: 3,
    name: 'visitor',
    description: '访客，仅有查看权限',
    createTime: '2023-01-03 09:30:00'
  }
])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
