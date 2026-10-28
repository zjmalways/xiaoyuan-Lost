<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createAnnouncement, deleteAnnouncement, getAnnouncements, getAnnouncement, updateAnnouncement } from '@/api/communityApi'
import { useAuth } from '@/utils/auth'
import { formatTime } from '@/utils/format'

const { user } = useAuth()
const announcements = ref([])
const loading = ref(false)
const detail = ref(null)
const editorVisible = ref(false)
const editing = ref(false)
const saving = ref(false)
const form = reactive({ announcementId: null, title: '', content: '', isTop: 0 })
const isAdmin = () => Number(user.value?.role) === 1

async function loadAnnouncements() {
  loading.value = true
  try {
    const result = await getAnnouncements()
    announcements.value = Array.isArray(result) ? result : []
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

async function showDetail(item) {
  try {
    detail.value = await getAnnouncement(item.announcementId)
  } catch (error) {
    ElMessage.error(error.message)
  }
}

function openEditor(item) {
  editing.value = Boolean(item)
  Object.assign(form, item
    ? { announcementId: item.announcementId, title: item.title, content: item.content, isTop: Number(item.isTop || 0) }
    : { announcementId: null, title: '', content: '', isTop: 0 })
  editorVisible.value = true
}

async function saveAnnouncement() {
  if (!form.title.trim() || !form.content.trim()) return ElMessage.warning('标题和内容不能为空')
  saving.value = true
  try {
    const payload = { title: form.title.trim(), content: form.content.trim(), isTop: Number(form.isTop) }
    if (editing.value) await updateAnnouncement({ ...payload, announcementId: form.announcementId })
    else await createAnnouncement(payload)
    editorVisible.value = false
    await loadAnnouncements()
    ElMessage.success(editing.value ? '公告已更新' : '公告已发布')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    saving.value = false
  }
}

async function removeAnnouncement(item) {
  try {
    await ElMessageBox.confirm(`确定删除公告「${item.title}」吗？`, '删除公告', { type: 'warning' })
    await deleteAnnouncement(item.announcementId)
    announcements.value = announcements.value.filter(value => value.announcementId !== item.announcementId)
    ElMessage.success('公告已删除')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message)
  }
}

onMounted(loadAnnouncements)
</script>

<template>
  <section class="announcements-page">
    <div class="announcement-hero"><span class="eyebrow">CAMPUS BULLETIN</span><div class="announcement-heading"><div><h1>校园公告</h1><p>重要通知与校园动态，一站了解</p></div><el-button v-if="isAdmin()" type="primary" @click="openEditor()">发布公告 <el-icon class="el-icon--right"><Plus /></el-icon></el-button></div></div>
    <div v-loading="loading" class="announcement-list">
      <el-card v-for="item in announcements" :key="item.announcementId" class="announcement-card" shadow="never">
        <div class="announcement-date"><span>{{ new Date(item.createTime).getDate() }}</span><small>{{ new Date(item.createTime).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }) }}</small></div>
        <div class="announcement-copy"><div class="announcement-labels"><el-tag v-if="Number(item.isTop) === 1" type="danger" size="small">置顶</el-tag><span>校园通知</span></div><h2 @click="showDetail(item)">{{ item.title }}</h2><p>{{ item.content }}</p><small>{{ item.publisherName || '校园管理处' }} · {{ formatTime(item.createTime) }}</small></div>
        <div v-if="isAdmin()" class="announcement-actions"><el-button text type="primary" @click="openEditor(item)">编辑</el-button><el-button text type="danger" @click="removeAnnouncement(item)">删除</el-button></div>
      </el-card>
      <el-empty v-if="!loading && !announcements.length" description="目前还没有公告" />
    </div>
    <el-dialog v-model="editorVisible" :title="editing ? '编辑公告' : '发布公告'" width="min(620px, 92vw)">
      <el-form :model="form" label-position="top">
        <el-form-item label="公告标题" required><el-input v-model="form.title" maxlength="200" /></el-form-item>
        <el-form-item label="公告内容" required><el-input v-model="form.content" type="textarea" :rows="8" maxlength="10000" show-word-limit /></el-form-item>
        <el-form-item label="展示方式"><el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" active-text="置顶" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="editorVisible = false">取消</el-button><el-button type="primary" :loading="saving" @click="saveAnnouncement">保存公告</el-button></template>
    </el-dialog>
    <el-dialog v-model="detail" :title="detail?.title" width="min(680px, 92vw)">
      <article class="announcement-detail">{{ detail?.content }}</article>
      <template #footer><span class="dialog-caption">{{ detail?.publisherName }} · {{ formatTime(detail?.createTime) }}</span></template>
    </el-dialog>
  </section>
</template>
