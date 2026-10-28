<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createComment, deleteComment, getComments } from '@/api/communityApi'
import { deleteItem, getItem, updateItemStatus } from '@/api/itemApi'
import { useAuth } from '@/utils/auth'
import { formatTime, imageList, itemTypeName } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const item = ref(null)
const comments = ref([])
const commentText = ref('')
const loading = ref(false)
const canManage = computed(() => user.value && item.value && (Number(user.value.role) === 1 || Number(user.value.userId) === Number(item.value.publisherId)))
const photos = computed(() => imageList(item.value?.images))

async function load() {
  loading.value = true
  try {
    const [itemData, commentData] = await Promise.all([getItem(route.params.itemId), getComments(route.params.itemId)])
    item.value = itemData
    comments.value = Array.isArray(commentData) ? commentData : []
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

async function addComment() {
  if (!commentText.value.trim()) return ElMessage.warning('请先填写评论内容')
  try {
    await createComment({ itemId: Number(route.params.itemId), content: commentText.value.trim(), parentId: 0 })
    commentText.value = ''
    comments.value = await getComments(route.params.itemId)
    ElMessage.success('评论已发布')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function removeComment(comment) {
  try {
    await ElMessageBox.confirm('确定删除这条评论吗？', '删除评论', { type: 'warning' })
    await deleteComment(comment.commentId)
    comments.value = comments.value.filter(value => value.commentId !== comment.commentId)
    ElMessage.success('评论已删除')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message)
  }
}

async function changeStatus() {
  try {
    await updateItemStatus({ itemId: item.value.itemId, status: Number(item.value.status) === 1 ? 0 : 1 })
    await load()
    ElMessage.success('物品状态已更新')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function removeItem() {
  try {
    await ElMessageBox.confirm(`确定删除「${item.value.title}」吗？此操作不可撤销。`, '删除物品', { type: 'warning' })
    await deleteItem(item.value.itemId)
    ElMessage.success('物品已删除')
    router.push('/')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<template>
  <section v-loading="loading" class="detail-page" v-if="item">
    <el-button text @click="router.push('/')"><el-icon><ArrowLeft /></el-icon>返回物品列表</el-button>
    <div class="detail-layout">
      <div class="detail-main">
        <div class="detail-cover">
          <el-carousel v-if="photos.length" height="420px" :autoplay="false">
            <el-carousel-item v-for="(photo, index) in photos" :key="photo"><img class="detail-image" :src="photo" :alt="`${item.title}图片${index + 1}`" /></el-carousel-item>
          </el-carousel>
          <div v-else class="detail-placeholder"><el-icon><Box /></el-icon><span>暂未上传物品图片</span></div>
        </div>
        <el-card class="detail-card" shadow="never">
          <div class="detail-tags">
            <el-tag :type="Number(item.publishType) === 1 ? 'success' : 'warning'">{{ Number(item.publishType) === 1 ? '失物招领' : '寻物启事' }}</el-tag>
            <el-tag>{{ itemTypeName(item.itemType) }}</el-tag>
            <el-tag v-if="Number(item.status) === 1" type="info">已找回 / 归还</el-tag>
          </div>
          <h1>{{ item.title }}</h1>
          <p class="detail-description">{{ item.description || '暂无详细描述' }}</p>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="地点">{{ item.location || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="发生时间">{{ formatTime(item.eventTime) }}</el-descriptions-item>
            <el-descriptions-item label="物品特征">{{ item.features || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="存放地点">{{ item.storageLocation || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ formatTime(item.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="浏览次数">{{ item.viewCount || 0 }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card class="detail-card comments-card" shadow="never">
          <h2>留言与线索 <span>{{ comments.length }}</span></h2>
          <div v-if="user" class="comment-editor"><el-input v-model="commentText" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="留下你的线索或留言…" /><el-button type="primary" @click="addComment">发布留言</el-button></div>
          <el-alert v-else title="登录后可以发布留言" type="info" :closable="false" />
          <el-empty v-if="!comments.length" description="还没有留言，来提供第一条线索吧" :image-size="72" />
          <div v-for="comment in comments" :key="comment.commentId" class="comment-row">
            <el-avatar :src="comment.userAvatar || ''">{{ (comment.userNickname || '同学').slice(0, 1) }}</el-avatar>
            <div class="comment-content"><div><strong>{{ comment.userNickname || '校园同学' }}</strong><time>{{ formatTime(comment.createTime) }}</time></div><p>{{ comment.content }}</p></div>
            <el-button v-if="user && (Number(user.role) === 1 || Number(user.userId) === Number(comment.userId))" text type="danger" @click="removeComment(comment)">删除</el-button>
          </div>
        </el-card>
      </div>
      <aside class="detail-sidebar">
        <el-card shadow="never">
          <span class="eyebrow">CONTACT</span><h3>联系发布者</h3>
          <div class="publisher"><el-avatar :src="item.publisherAvatar || ''">{{ (item.publisherName || '同').slice(0, 1) }}</el-avatar><div><strong>{{ item.publisherName || '校园同学' }}</strong><small>发布者</small></div></div>
          <div class="contact-box"><el-icon><Phone /></el-icon><span>{{ item.contact || '发布者暂未填写联系方式' }}</span></div>
          <p class="privacy-note">请友善沟通，并注意保护个人隐私。</p>
          <template v-if="canManage">
            <el-divider />
            <div class="manage-actions">
              <el-button class="full-button" @click="router.push(`/items/${item.itemId}/edit`)">编辑信息</el-button>
              <el-button class="full-button" type="success" plain @click="changeStatus">{{ Number(item.status) === 1 ? '标记为正在寻找' : '标记为已找回 / 归还' }}</el-button>
              <el-button class="full-button" type="danger" plain @click="removeItem">删除信息</el-button>
            </div>
          </template>
        </el-card>
      </aside>
    </div>
  </section>
  <el-empty v-else-if="!loading" description="物品信息暂不可用" />
</template>
