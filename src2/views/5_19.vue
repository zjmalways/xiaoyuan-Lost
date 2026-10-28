<script setup>
import { ref } from 'vue'
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'

const item = {
  date: '2016-05-02',
  name: 'Tom',
  address: 'No. 189, Grove St, Los Angeles',
}
const tableData = ref(Array.from({ length: 20 }).fill(item))
</script>

<template>
  <el-container class="layout-container-demo" style="height: 100%">
    <el-aside width="200px">
      <el-scrollbar>
        <!-- 首页 -->
        <el-menu router>
          <el-menu-item index="/index">
            <el-icon><message /></el-icon>首页
          </el-menu-item>
          <!-- 班级学院管理 -->
          <el-sub-menu index="2">
            <template #title>
              <el-icon><icon-menu /></el-icon>班级学员管理
            </template>
            <el-menu-item-group>
              <el-menu-item index="/class">班级管理</el-menu-item>
              <el-menu-item index="/stu">学员管理</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>

          <!-- 系统信息管理 -->
          <el-sub-menu index="3">
            <template #title>
              <el-icon><setting /></el-icon>系统信息管理
            </template>
            <el-menu-item-group>
              <el-menu-item index="/dept">部门管理</el-menu-item>
              <el-menu-item index="/emp">员工管理</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <!-- 信息统计 -->
          <el-sub-menu index="4">
            <template #title>
              <el-icon><setting /></el-icon>数据统计管理
            </template>
            <el-menu-item-group>
              <el-menu-item index="stutj">学员信息</el-menu-item>
              <el-menu-item index="depttj">部门统计</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <div class="toolbar">
          <el-dropdown>
            <el-icon style="margin-right: 8px; margin-top: 1px">
              <setting />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>主页</el-dropdown-item>
                <el-dropdown-item>退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>Tom</span>
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>