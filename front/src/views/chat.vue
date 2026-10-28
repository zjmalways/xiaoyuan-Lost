<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Promotion, VideoPause } from '@element-plus/icons-vue'
import { createChatSession, getChatMessages, getChatSessions, streamChat } from '@/api/chatApi'
import { formatTime } from '@/utils/format'

const sessions = ref([])
const messages = ref([])
const selectedSession = ref(null)
const question = ref('')
const loading = ref(false)
const historyLoading = ref(false)
const messageArea = ref(null)
let abortController = null

async function loadSessions() {
  try {
    sessions.value = await getChatSessions() || []
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function selectSession(session) {
  if (loading.value) return
  selectedSession.value = session
  historyLoading.value = true
  try {
    messages.value = await getChatMessages(session.sessionId) || []
    await scrollToBottom()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    historyLoading.value = false
  }
}

async function newSession() {
  if (loading.value) return ElMessage.warning('请等待当前回复完成')
  try {
    const session = await createChatSession({ title: '新对话' })
    sessions.value.unshift(session)
    selectedSession.value = session
    messages.value = []
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function sendMessage() {
  const content = question.value.trim()
  if (!content || loading.value) return
  if (content.length > 4000) return ElMessage.warning('问题不能超过 4000 字')
  if (!selectedSession.value) {
    try {
      const session = await createChatSession({ title: content.slice(0, 40) })
      sessions.value.unshift(session)
      selectedSession.value = session
    } catch (error) {
      ElMessage.error(error.message)
      return
    }
  }

  messages.value.push({
    messageId: `user-${Date.now()}`, role: 'USER', content, createdAt: new Date().toISOString(), status: 'COMPLETED'
  })
  const answer = {
    messageId: `assistant-${Date.now()}`, role: 'ASSISTANT', content: '', createdAt: new Date().toISOString(), status: 'COMPLETED'
  }
  messages.value.push(answer)
  question.value = ''
  loading.value = true
  abortController = new AbortController()
  await scrollToBottom()
  try {
    const sessionId = await streamChat(content, selectedSession.value.sessionId, chunk => {
      answer.content += chunk
      scrollToBottom()
    }, abortController.signal)
    if (sessionId && String(sessionId) !== String(selectedSession.value.sessionId)) {
      selectedSession.value.sessionId = sessionId
    }
    if (!answer.content) answer.content = '暂时没有收到回复，请稍后再试。'
    await loadSessions()
  } catch (error) {
    if (error.name === 'AbortError') answer.status = 'CANCELLED'
    else {
      answer.status = 'FAILED'
      answer.content = error.message || '客服暂时无法回复，请稍后重试。'
      ElMessage.error(answer.content)
    }
  } finally {
    loading.value = false
    abortController = null
    await scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messageArea.value) messageArea.value.scrollTop = messageArea.value.scrollHeight
}

function stopReply() {
  abortController?.abort()
}

async function clearConversation() {
  if (loading.value) return
  try {
    await ElMessageBox.confirm('新建对话不会删除已有的历史记录。', '开始新对话', { confirmButtonText: '新建对话', type: 'info' })
    await newSession()
  } catch {
    // The dialog was dismissed.
  }
}

onMounted(loadSessions)
onUnmounted(stopReply)
</script>

<template>
  <section class="chat-page">
    <aside class="chat-sidebar">
      <div class="chat-sidebar-head"><div><span class="eyebrow">YOUR ASSISTANT</span><h2>智能客服</h2></div><el-button circle :icon="Plus" aria-label="新建对话" @click="clearConversation" /></div>
      <el-button class="new-chat-button" plain @click="newSession"><el-icon><EditPen /></el-icon>开启新对话</el-button>
      <div class="session-label">最近对话</div>
      <div class="session-list">
        <button v-for="session in sessions" :key="session.sessionId" class="session-button" :class="{ active: selectedSession?.sessionId === session.sessionId }" @click="selectSession(session)">
          <el-icon><ChatLineRound /></el-icon><span>{{ session.title || '新对话' }}</span>
        </button>
        <el-empty v-if="!sessions.length" description="还没有历史对话" :image-size="60" />
      </div>
      <div class="chat-safety"><el-icon><Lock /></el-icon><span>请勿在对话中发送密码等敏感信息</span></div>
    </aside>
    <div class="chat-main">
      <header class="chat-header"><div class="assistant-avatar"><el-icon><Service /></el-icon></div><div><strong>校园小助手</strong><small><span class="online-dot"></span>在线 · 可以帮你查询失物、发布信息</small></div></header>
      <div ref="messageArea" v-loading="historyLoading" class="chat-messages">
        <div v-if="!messages.length" class="chat-welcome"><div class="welcome-icon"><el-icon><ChatDotRound /></el-icon></div><span class="eyebrow">HERE TO HELP</span><h2>你好，有什么可以帮你？</h2><p>我可以帮你查找物品、了解校园公告，或告诉你如何发布信息。</p><div class="suggestion-list"><button @click="question = '图书馆附近有没有捡到的钥匙？'">图书馆附近有没有捡到的钥匙？<el-icon><ArrowRight /></el-icon></button><button @click="question = '怎么发布一条失物招领信息？'">怎么发布一条失物招领信息？<el-icon><ArrowRight /></el-icon></button><button @click="question = '最近有什么校园公告？'">最近有什么校园公告？<el-icon><ArrowRight /></el-icon></button></div></div>
        <div v-for="message in messages" :key="message.messageId" class="message-row" :class="message.role === 'USER' ? 'from-user' : 'from-assistant'">
          <div v-if="message.role !== 'USER'" class="message-avatar"><el-icon><Service /></el-icon></div>
          <div class="message-bubble"><p>{{ message.content || (loading ? '正在思考…' : '') }}</p><small>{{ formatTime(message.createdAt) }}</small></div>
          <div v-if="message.role === 'USER'" class="message-avatar user-avatar"><el-icon><UserFilled /></el-icon></div>
        </div>
      </div>
      <div class="chat-input-area"><div class="chat-input-box"><el-input v-model="question" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" maxlength="4000" placeholder="输入你想咨询的问题…" @keydown.enter.exact.prevent="sendMessage" /><el-button v-if="loading" type="danger" plain circle :icon="VideoPause" aria-label="停止回复" @click="stopReply" /><el-button v-else type="primary" circle :icon="Promotion" aria-label="发送消息" :disabled="!question.trim()" @click="sendMessage" /></div><div class="input-caption">Enter 发送 · Shift + Enter 换行 · AI 回复仅供参考</div></div>
    </div>
  </section>
</template>
