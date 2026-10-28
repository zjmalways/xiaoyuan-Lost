<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const { login, register } = useAuth()
const isRegister = ref(false)
const loading = ref(false)
const form = reactive({ username: '', password: '', nickname: '', contact: '' })

async function submit() {
  loading.value = true
  try {
    if (isRegister.value) {
      await register({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        contact: form.contact || undefined
      })
      await login({ username: form.username, password: form.password })
      ElMessage.success('注册成功，欢迎加入')
    } else {
      await login({ username: form.username, password: form.password })
      ElMessage.success('登录成功')
    }
    router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-intro">
      <router-link class="brand" to="/">
        <span class="brand-mark">拾</span>
        <span>校园失物招领<small>让每一份遗失都有回音</small></span>
      </router-link>
      <div class="auth-copy">
        <span class="eyebrow">CAMPUS COMMUNITY</span>
        <h1>拾起善意，<br />找回重要的东西。</h1>
        <p>在熟悉的校园里，让每一次寻找都更简单。</p>
      </div>
      <div class="auth-decoration">拾</div>
    </section>
    <section class="auth-form-wrap">
      <el-card class="auth-card" shadow="never">
        <div class="auth-heading">
          <div class="eyebrow">{{ isRegister ? 'JOIN OUR COMMUNITY' : 'WELCOME BACK' }}</div>
          <h2>{{ isRegister ? '创建账号' : '欢迎回来' }}</h2>
          <p>{{ isRegister ? '填写信息，开始使用校园失物招领' : '登录后继续寻找或发布物品' }}</p>
        </div>
        <el-form :model="form" label-position="top" @submit.prevent="submit">
          <el-form-item label="用户名">
            <el-input v-model="form.username" autocomplete="username" placeholder="请输入用户名" @keyup.enter="submit" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password autocomplete="current-password" placeholder="请输入密码" @keyup.enter="submit" />
          </el-form-item>
          <template v-if="isRegister">
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" placeholder="校园里大家如何称呼你" @keyup.enter="submit" />
            </el-form-item>
            <el-form-item label="联系方式（选填）">
              <el-input v-model="form.contact" placeholder="手机号、微信等" @keyup.enter="submit" />
            </el-form-item>
          </template>
          <el-button class="full-button" type="primary" :loading="loading" @click="submit">
            {{ isRegister ? '创建账号' : '登录' }}
          </el-button>
        </el-form>
        <div class="auth-switch">
          {{ isRegister ? '已经有账号？' : '还没有账号？' }}
          <el-button link type="primary" @click="isRegister = !isRegister">
            {{ isRegister ? '去登录' : '立即注册' }}
          </el-button>
        </div>
      </el-card>
    </section>
  </div>
</template>
