<script setup>
defineProps({
  item: { type: Object, required: true },
  user: { type: Object, default: null },
  comments: { type: Array, required: true },
  commentText: { type: String, required: true },
  date: { type: Function, required: true },
  imageUrlList: { type: Function, required: true },
  canManage: { type: Boolean, required: true },
})

const emit = defineEmits([
  'back', 'login', 'contact', 'edit', 'delete', 'mark', 'update:commentText', 'submit-comment', 'delete-comment',
])
</script>

<template>
  <section class="page-view">
    <button class="back-link" @click="emit('back')">← 返回线索列表</button>
    <div class="detail-layout">
      <div class="detail-visual" :class="`tone-${item.itemId % 4}`">
        <img v-if="imageUrlList(item.images).length" class="detail-cover" :src="imageUrlList(item.images)[0]"
          :alt="item.title">
        <span>{{ item.publishType === 0 ? 'LOST ITEM' : 'FOUND ITEM' }}</span>
      </div>
      <div>
        <span :class="['tag', item.publishType === 0 ? 'lost' : 'found']">
          {{ item.publishType === 0 ? '寻找失物' : '拾到物品' }}
        </span>
        <h1>{{ item.title }}</h1>
        <p class="detail-location">⌖ {{ item.location }} · {{ date(item.eventTime) }}</p>
        <p v-if="item.storageLocation" class="detail-location">存放地点：{{ item.storageLocation }}</p>
        <div class="detail-block">
          <h4>详细描述</h4>
          <p>{{ item.description }}</p>
        </div>
        <div class="detail-block">
          <h4>物品特征</h4>
          <p>{{ item.features }}</p>
        </div>
        <div v-if="imageUrlList(item.images).length" class="detail-images">
          <img v-for="url in imageUrlList(item.images)" :key="url" :src="url" alt="物品图片"
            loading="lazy" decoding="async">
        </div>
        <div class="detail-actions">
          <button class="primary-button" @click="user ? emit('contact') : emit('login')">查看联系方式 ↗</button>
          <button v-if="canManage" class="secondary-button" @click="emit('edit')">编辑</button>
          <button v-if="canManage" class="danger-button" @click="emit('delete')">删除</button>
        </div>
        <div v-if="canManage" class="status-actions">
          <button @click="emit('mark', Number(item.status) === 1 ? 0 : 1)">
            {{ Number(item.status) === 1 ? '标记为进行中' : '标记为已找回 / 已归还' }}
          </button>
        </div>
        <div class="comments-block">
          <div class="comments-title"><h4>评论</h4><span>{{ comments.length }} 条</span></div>
          <div v-if="comments.length" class="comment-list">
            <div v-for="comment in comments" :key="comment.commentId" class="comment">
              <div class="comment-avatar">{{ (comment.userNickname || '同').slice(0, 1) }}</div>
              <div>
                <strong>{{ comment.userNickname || '匿名同学' }}</strong>
                <p>{{ comment.content }}</p>
                <small>
                  {{ date(comment.createTime) }}
                  <button v-if="user && (String(comment.userId) === String(user.userId) || Number(user.role) === 1)"
                    @click="emit('delete-comment', comment)">删除</button>
                </small>
              </div>
            </div>
          </div>
          <p v-else class="muted-copy">还没有评论，留下第一条线索回应。</p>
          <div class="comment-input">
            <input :value="commentText" placeholder="说点什么..."
              @input="emit('update:commentText', $event.target.value)" @keyup.enter="emit('submit-comment')">
            <button @click="emit('submit-comment')">发送 ↗</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
