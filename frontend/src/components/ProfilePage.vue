<script setup>
defineProps({
  user: { type: Object, required: true },
  myItems: { type: Array, required: true },
  myItemsError: { type: String, default: '' },
  profile: { type: Object, required: true },
  passwordForm: { type: Object, required: true },
  avatarPreview: { type: String, default: '' },
  types: { type: Object, required: true },
  date: { type: Function, required: true },
  imageUrlList: { type: Function, required: true },
})

const emit = defineEmits(['logout', 'choose-avatar', 'upload-avatar', 'save-profile', 'save-password', 'open-item', 'publish'])
</script>

<template>
  <section class="page-view profile-view">
    <div class="profile-heading">
      <div>
        <p class="eyebrow">YOUR LIGHTHOUSE</p>
        <h1>个人中心</h1>
        <p class="lead">管理你的资料，查看你留下的校园线索。</p>
      </div>
      <button class="text-button" @click="emit('logout')">退出登录</button>
    </div>
    <div class="profile-grid">
      <div class="profile-card profile-summary">
        <label class="avatar-picker">
          <img v-if="avatarPreview || user.avatar" :src="avatarPreview || user.avatar" alt="用户头像">
          <span v-else>{{ (user.nickname || user.username || '我').slice(0, 1) }}</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" @change="emit('choose-avatar', $event)">
        </label>
        <button class="secondary-button avatar-upload-button" @click="emit('upload-avatar')">上传头像</button>
        <h2>{{ user.nickname || user.username }}</h2>
        <p>@{{ user.username }}</p>
        <span class="role-label">{{ Number(user.role) === 1 ? '管理员' : '校园用户' }}</span>
        <div class="profile-stats">
          <div><strong>{{ myItems.length }}</strong><small>我的线索</small></div>
          <div><strong>{{ myItems.filter(item => Number(item.status) === 1).length }}</strong><small>已找回</small></div>
          <div><strong>{{ user.createTime ? date(user.createTime) : '今日' }}</strong><small>加入时间</small></div>
        </div>
      </div>
      <form class="profile-card profile-form" @submit.prevent="emit('save-profile')">
        <div class="card-title"><h3>基本资料</h3><span>PROFILE</span></div>
        <label>用户名<input :value="user.username" disabled></label>
        <label>昵称<input v-model="profile.nickname" required placeholder="你的校园昵称"></label>
        <label>联系方式<input v-model="profile.contact" placeholder="手机号、微信号或其他联系方式"></label>
        <button class="primary-button" type="submit">保存资料 ↗</button>
      </form>
      <form class="profile-card profile-form password-form" @submit.prevent="emit('save-password')">
        <div class="card-title"><h3>安全设置</h3><span>SECURITY</span></div>
        <label>当前密码<input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码"></label>
        <label>新密码<input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"></label>
        <button class="secondary-button" type="submit">修改密码</button>
      </form>
    </div>
    <div class="my-items-heading"><h2>我的线索</h2><span>{{ myItems.length }} 条记录</span></div>
    <p v-if="myItemsError" class="profile-empty">{{ myItemsError }}</p>
    <div v-else-if="myItems.length" class="item-grid">
      <article v-for="item in myItems" :key="item.itemId" class="item-card" @click="emit('open-item', item)">
        <div class="item-image" :class="`tone-${item.itemId % 4}`">
          <img v-if="imageUrlList(item.images).length" class="item-cover" :src="imageUrlList(item.images)[0]"
            :alt="item.title" loading="lazy" decoding="async">
          <span>{{ item.publishType === 0 ? 'LOST' : 'FOUND' }}</span>
          <b>{{ types[item.itemType] || '物品' }}</b>
        </div>
        <div class="item-content">
          <h3>{{ item.title }}</h3>
          <p class="location">⌖ {{ item.location }}</p>
          <div class="item-footer">
            <span>{{ Number(item.status) === 1 ? '已找回 / 已归还' : '进行中' }}</span>
            <span>{{ date(item.eventTime) }}</span>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="profile-empty">
      你还没有发布线索。<button class="text-button" @click="emit('publish')">去发布一条 ↗</button>
    </div>
  </section>
</template>
