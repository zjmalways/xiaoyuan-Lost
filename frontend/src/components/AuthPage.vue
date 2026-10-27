<script setup>
defineProps({
  form: { type: Object, required: true },
  mode: { type: String, required: true },
})

const emit = defineEmits(['update:mode', 'submit'])
</script>

<template>
  <section class="page-view auth-view">
    <div class="auth-intro">
      <p class="eyebrow">WELCOME BACK</p>
      <h1>让善意<br><em>继续流动。</em></h1>
      <p>登录后可以发布线索、联系物品发布者，参与校园里的每一次互助。</p>
    </div>
    <form class="auth-form" @submit.prevent="emit('submit')">
      <div class="auth-switch">
        <button type="button" :class="{ selected: mode === 'login' }" @click="emit('update:mode', 'login')">登录</button>
        <button type="button" :class="{ selected: mode === 'register' }" @click="emit('update:mode', 'register')">注册</button>
      </div>
      <label v-if="mode === 'register'">昵称<input v-model="form.nickname" placeholder="你的校园昵称"></label>
      <label v-if="mode === 'register'">联系方式（可选）<input v-model="form.contact"
        placeholder="手机号、微信号或其他联系方式"></label>
      <label>用户名<input v-model="form.username" required placeholder="请输入用户名"></label>
      <label>密码<input v-model="form.password" required type="password" placeholder="请输入密码"></label>
      <button class="primary-button">{{ mode === 'login' ? '进入拾光' : '创建账号' }} ↗</button>
    </form>
  </section>
</template>
