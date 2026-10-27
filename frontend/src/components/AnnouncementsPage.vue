<script setup>
defineProps({
  notices: { type: Array, required: true },
  user: { type: Object, default: null },
  form: { type: Object, required: true },
  editing: { type: Object, default: null },
  date: { type: Function, required: true },
})

const emit = defineEmits(['submit', 'edit', 'delete', 'cancel-edit'])
</script>

<template>
  <section class="page-view announcement-view">
    <p class="eyebrow">CAMPUS NOTES</p>
    <h1>校园公告</h1>
    <form v-if="Number(user?.role) === 1" class="announcement-admin-form" @submit.prevent="emit('submit')">
      <div class="card-title">
        <h3>{{ editing ? '编辑公告' : '发布公告' }}</h3><span>ADMIN ONLY</span>
      </div>
      <label>标题<input v-model="form.title" required placeholder="公告标题"></label>
      <label>内容<textarea v-model="form.content" required rows="3" placeholder="公告内容"></textarea></label>
      <label class="checkbox-label">
        <input v-model="form.isTop" type="checkbox" :true-value="1" :false-value="0"> 置顶公告
      </label>
      <div class="announcement-form-actions">
        <button class="primary-button" type="submit">{{ editing ? '保存修改' : '发布公告' }} ↗</button>
        <button v-if="editing" class="text-button" type="button" @click="emit('cancel-edit')">取消编辑</button>
      </div>
    </form>
    <div class="announcement-list">
      <article v-for="(notice, index) in notices" :key="notice.announcementId || index">
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h3>{{ Number(notice.isTop) === 1 ? '置顶 · ' : '' }}{{ notice.title }}</h3>
          <p>{{ notice.content }}</p>
        </div>
        <time>
          {{ date(notice.createTime) }}<br>
          <template v-if="Number(user?.role) === 1">
            <button class="notice-action" @click="emit('edit', notice)">编辑</button>
            <button class="notice-action danger-text" @click="emit('delete', notice)">删除</button>
          </template>
        </time>
      </article>
    </div>
    <p v-if="!notices.length" class="empty-state">暂无公告。</p>
  </section>
</template>
