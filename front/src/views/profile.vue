<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getItems } from '@/api/itemApi'
import { updatePassword, updateUser, uploadAvatar } from '@/api/userApi'
import { useAuth } from '@/utils/auth'
import { formatTime } from '@/utils/format'

const { user, refresh } = useAuth()
const profile = reactive({ nickname: '', contact: '', avatar: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '' })
const items = ref([])
const loading = ref(false)
const avatarLoading = ref(false)

async function loadProfile() {
  await refresh()
  Object.assign(profile, {
    nickname: user.value?.nickname || '',
    contact: user.value?.contact || '',
    avatar: user.value?.avatar || ''
  })
  if (user.value?.userId) {
    const result = await getItems({ pageNum: 1, pageSize: 100, publisherId: user.value.userId })
    items.value = result.records || []
  }
}

async function saveProfile() {
  loading.value = true
  try {
    await updateUser(profile)
    await refresh()
    ElMessage.success('个人资料已更新')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

async function savePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) return ElMessage.warning('请填写当前密码和新密码')
  try {
    await updatePassword(passwordForm)
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    ElMessage.success('密码修改成功')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function changeAvatar(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  avatarLoading.value = true
  try {
    const result = await uploadAvatar(file)
    profile.avatar = typeof result === 'string' ? result : result?.url || result?.avatar || ''
    if (!profile.avatar) throw new Error('头像上传响应中没有图片地址')
    await updateUser({ avatar: profile.avatar })
    await refresh()
    ElMessage.success('头像已更新')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    avatarLoading.value = false
  }
}

async function confirmDelete(item) {
  try {
    await ElMessageBox.confirm(`确定删除「${item.title}」吗？`, '删除物品', { type: 'warning' })
    const { deleteItem } = await import('@/api/itemApi')
    await deleteItem(item.itemId)
    items.value = items.value.filter(value => value.itemId !== item.itemId)
    ElMessage.success('物品已删除')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message)
  }
}

onMounted(async () => {
  try {
    await loadProfile()
  } catch (error) {
    ElMessage.error(error.message)
  }
})
</script>

<template>
  <section class="profile-page">
    <div class="page-title"><span class="eyebrow">YOUR ACCOUNT</span><h1>个人中心</h1><p>管理你的个人资料和发布的寻物信息</p></div>
    <div class="profile-layout">
      <div class="profile-column">
        <el-card class="profile-card" shadow="never">
          <div class="card-title"><div><h2>个人资料</h2><p>这些信息会帮助同学更好地联系你</p></div></div>
          <div class="avatar-editor"><el-avatar :size="76" :src="profile.avatar">{{ (profile.nickname || user?.username || '我').slice(0, 1) }}</el-avatar><label class="avatar-upload"><input type="file" accept="image/*" :disabled="avatarLoading" @change="changeAvatar" />{{ avatarLoading ? '正在上传…' : '更换头像' }}</label></div>
          <el-form :model="profile" label-position="top">
            <el-form-item label="用户名"><el-input :model-value="user?.username" disabled /></el-form-item>
            <el-form-item label="昵称"><el-input v-model="profile.nickname" maxlength="50" /></el-form-item>
            <el-form-item label="联系方式"><el-input v-model="profile.contact" maxlength="200" placeholder="选填" /></el-form-item>
            <el-button type="primary" :loading="loading" @click="saveProfile">保存资料</el-button>
          </el-form>
        </el-card>
        <el-card class="profile-card" shadow="never">
          <div class="card-title"><div><h2>修改密码</h2><p>定期更新密码，保护账号安全</p></div></div>
          <el-form :model="passwordForm" label-position="top">
            <el-form-item label="当前密码"><el-input v-model="passwordForm.oldPassword" type="password" show-password autocomplete="current-password" /></el-form-item>
            <el-form-item label="新密码"><el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="new-password" /></el-form-item>
            <el-button @click="savePassword">更新密码</el-button>
          </el-form>
        </el-card>
      </div>
      <el-card class="profile-card my-items-card" shadow="never">
        <div class="card-title"><div><h2>我发布的信息</h2><p>你发布的寻物启事和失物招领</p></div><el-button type="primary" plain @click="$router.push('/items/new')">发布信息</el-button></div>
        <el-empty v-if="!items.length" description="你还没有发布过信息" />
        <div v-for="item in items" :key="item.itemId" class="my-item-row">
          <div class="my-item-copy"><div><el-tag size="small" :type="Number(item.publishType) === 1 ? 'success' : 'warning'">{{ Number(item.publishType) === 1 ? '招领' : '寻物' }}</el-tag><strong>{{ item.title }}</strong></div><small>{{ item.location || '地点未填写' }} · {{ formatTime(item.createTime) }}</small></div>
          <div class="my-item-actions"><el-button text @click="$router.push(`/items/${item.itemId}`)">查看</el-button><el-button text type="primary" @click="$router.push(`/items/${item.itemId}/edit`)">编辑</el-button><el-button text type="danger" @click="confirmDelete(item)">删除</el-button></div>
        </div>
      </el-card>
    </div>
  </section>
</template>
