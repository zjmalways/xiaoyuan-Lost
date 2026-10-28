<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/utils/auth'

const router = useRouter()
const { user, logout } = useAuth()

async function handleLogout() {
  try {
    await logout()
    ElMessage.success('已退出登录')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <router-link class="brand" to="/">
        <span class="brand-mark">拾</span>
        <span>校园失物招领<small>让每一份遗失都有回音</small></span>
      </router-link>
      <nav class="main-nav">
        <router-link to="/">发现物品</router-link>
        <router-link to="/announcements">校园公告</router-link>
        <router-link to="/chat">智能客服</router-link>
      </nav>
      <div class="user-actions">
        <template v-if="user">
          <router-link class="user-link" to="/profile">
            <el-avatar :size="30" :src="user.avatar || ''">{{ (user.nickname || user.username || '我').slice(0, 1) }}</el-avatar>
            <span>{{ user.nickname || user.username }}</span>
          </router-link>
          <el-button text @click="handleLogout">退出</el-button>
        </template>
        <router-link v-else class="login-link" to="/login">登录 / 注册</router-link>
        <el-button type="primary" round @click="user ? router.push('/items/new') : router.push({ name: 'login', query: { redirect: '/items/new' } })">
          发布信息
        </el-button>
      </div>
    </header>
    <main class="page-content">
      <router-view />
    </main>
    <footer class="site-footer">校园失物招领 · 让善意在校园里传递</footer>
  </div>
</template>
