<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  sessions: { type: Array, required: true },
  sessionId: { type: String, required: true },
  messages: { type: Array, required: true },
  question: { type: String, required: true },
  loading: { type: Boolean, required: true },
  date: { type: Function, required: true },
})

const emit = defineEmits(['new-session', 'select-session', 'update:question', 'submit'])
const messageList = ref(null)

watch(() => props.messages, async () => {
  await nextTick()
  if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
}, { deep: true, flush: 'post' })
</script>

<template>
  <section class="page-view chat-view">
    <div class="chat-header">
      <p class="eyebrow">LIGHTHOUSE ASSISTANT</p>
      <h1>有什么想问的？</h1>
      <p>关于发布、寻找、认领，拾光都可以帮你。</p>
    </div>
    <div class="chat-workspace">
      <aside class="chat-sidebar">
        <button class="new-chat-button" :disabled="loading" @click="emit('new-session')">＋ 新建会话</button>
        <div class="chat-session-list">
          <button v-for="session in sessions" :key="session.sessionId"
            :class="{ active: String(session.sessionId) === sessionId }"
            :disabled="loading" @click="emit('select-session', session)">
            <strong>{{ session.title || '新对话' }}</strong>
            <small>{{ date(session.updatedAt || session.createdAt) }}</small>
          </button>
          <p v-if="!sessions.length" class="chat-session-empty">你的历史会话会显示在这里</p>
        </div>
      </aside>
      <div class="chat-box">
        <div ref="messageList" class="chat-messages">
          <div v-if="!messages.length" class="chat-placeholder">
            <strong>你好，我是拾光助手</strong>
            <span>可以帮你查找物品、了解平台使用方法。</span>
            <button @click="emit('update:question', '如何发布物品？')">如何发布物品？</button>
            <button @click="emit('update:question', '在哪里查看拾到的物品？')">在哪里查看拾到的物品？</button>
          </div>
          <div v-for="(message, index) in messages" :key="message.messageId || `${message.role}-${index}`"
            :class="['chat-message', message.role === 'USER' ? 'user-message' : 'assistant-message', { failed: message.status === 'FAILED' }]">
            <span>{{ message.role === 'USER' ? '我' : '拾光助手' }}</span>
            <p>{{ message.content || (loading && index === messages.length - 1 ? '正在思考…' : '') }}</p>
          </div>
        </div>
        <div class="chat-input">
          <input :value="question" :disabled="loading" maxlength="4000" placeholder="输入你的问题..."
            @input="emit('update:question', $event.target.value)" @keyup.enter="emit('submit')">
          <button :disabled="loading || !question.trim()" aria-label="发送消息" @click="emit('submit')">
            {{ loading ? '…' : '↗' }}
          </button>
        </div>
        <small class="chat-hint">问题最多 4000 字 · AI 生成的操作会再次向你确认</small>
      </div>
    </div>
  </section>
</template>
