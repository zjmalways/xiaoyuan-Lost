<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from './api'

const view = ref('home')
const items = ref([])
const notices = ref([])
const selected = ref(null)
const search = ref('')
const filter = ref('')
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const pages = ref(1)
const loadingItems = ref(false)
const user = ref(JSON.parse(localStorage.getItem('campus-user') || 'null'))
const toast = ref('')
const form = ref({ title: '', publishType: 0, itemType: 6, location: '', eventTime: '', storageLocation: '', description: '', features: '', contact: '' })
const auth = ref({ username: '', password: '', nickname: '' })
const authMode = ref('login')
const profile = ref({ nickname: '', contact: '' })
const passwordForm = ref({ oldPassword: '', newPassword: '' })
const avatarFile = ref(null)
const avatarPreview = ref('')
const comments = ref([])
const commentText = ref('')
const editingItem = ref(null)
const imageFiles = ref([])
const imagePreviews = ref([])
const editingImages = ref([])
const announcementForm = ref({ title: '', content: '', isTop: 0 })
const editingAnnouncement = ref(null)
const fallback = [
  { itemId: 1, title: '黑色帆布双肩包', publishType: 0, itemType: 6, location: '图书馆三楼自习区', eventTime: '2026-09-20', description: '内有一只银色保温杯和几本专业课教材。', features: '包侧有一枚蓝色徽章', publisherName: '林同学', commentCount: 4 },
  { itemId: 2, title: '校园卡与身份证', publishType: 1, itemType: 1, location: '南门快递站', eventTime: '2026-09-21', description: '拾到一张校园卡和身份证，请失主核对信息后联系。', features: '透明卡套，内有黄色贴纸', publisherName: '周同学', commentCount: 2 },
  { itemId: 3, title: '银色无线耳机', publishType: 0, itemType: 3, location: '二食堂靠窗座位', eventTime: '2026-09-19', description: '白色充电盒，右耳机缺失。', features: '充电盒背面有轻微划痕', publisherName: '陈同学', commentCount: 1 },
  { itemId: 4, title: '深蓝色针织围巾', publishType: 1, itemType: 4, location: '体育馆入口', eventTime: '2026-09-18', description: '深蓝色纯色围巾，已交至校学生会服务台。', features: '边缘有白色绣线', publisherName: '拾光志愿者', commentCount: 0 }
]
const types = { 1: '证件', 2: '钥匙', 3: '电子设备', 4: '衣物', 5: '钱包', 6: '其他' }
const visibleItems = computed(() => items.value.filter((item) => {
  const text = `${item.title || ''}${item.description || ''}${item.features || ''}${item.location || ''}`
  return (!search.value || text.includes(search.value)) && (filter.value === '' || String(item.publishType) === filter.value)
}))
const myItems = computed(() => items.value.filter((item) => user.value && (String(item.publisherId) === String(user.value.userId) || item.publisherName === user.value.nickname)))
const notify = (text) => { toast.value = text; setTimeout(() => { toast.value = '' }, 2400) }
const date = (value) => value ? new Date(value).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) : '刚刚'
const load = async (pageNum = page.value) => {
  loadingItems.value = true
  page.value = pageNum
  try {
    const params = { pageNum: page.value, pageSize: pageSize.value }
    if (filter.value !== '') params.publishType = filter.value
    if (search.value.trim()) params.keyword = search.value.trim()
    const data = await api.listItems(params)
    items.value = data?.records || data || []
    total.value = Number(data?.total ?? items.value.length)
    pages.value = Math.max(1, Number(data?.pages ?? Math.ceil(total.value / pageSize.value)))
  } catch {
    items.value = fallback
    total.value = fallback.length
    pages.value = 1
    page.value = 1
  } finally { loadingItems.value = false }
}
const searchItems = () => load(1)
const changeFilter = (value) => { filter.value = value; load(1) }
const loadAnnouncements = async () => {
  try {
    notices.value = await api.listAnnouncements() || []
  } catch {
    notices.value = [{ title: '失物招领平台正式上线', content: '欢迎同学们发布和认领物品，一起让校园里的善意流动起来。', createTime: '2026-09-22' }]
  }
}
const restoreSession = async () => {
  if (!user.value) return
  try {
    user.value = await api.userInfo()
    localStorage.setItem('campus-user', JSON.stringify(user.value))
  } catch {
    user.value = null
    localStorage.removeItem('campus-user')
    localStorage.removeItem('token')
  }
}
const open = async (item) => { selected.value = item; view.value = 'detail'; comments.value = []; try { selected.value = await api.getItem(item.itemId); comments.value = await api.listComments(item.itemId) || [] } catch { } }
const login = async () => {
  try {
    if (authMode.value === 'register') {
      await api.register(auth.value)
    }
    const loginResult = await api.login({ username: auth.value.username, password: auth.value.password })
    if (loginResult?.token) localStorage.setItem('token', loginResult.token)
    user.value = loginResult?.userId ? loginResult : await api.userInfo()
    localStorage.setItem('campus-user', JSON.stringify(user.value))
    view.value = 'home'
    notify(authMode.value === 'register' ? '注册并登录成功' : '欢迎来到拾光')
  } catch (error) {
    notify(error.message || '登录失败，请检查用户名和密码')
  }
}
const openProfile = async () => { if (!user.value) return (view.value = 'auth'); profile.value = { nickname: user.value.nickname || '', contact: user.value.contact || '' }; view.value = 'profile'; try { const info = await api.userInfo(); user.value = { ...user.value, ...info }; profile.value = { nickname: info.nickname || '', contact: info.contact || '' }; localStorage.setItem('campus-user', JSON.stringify(user.value)) } catch { } }
const chooseAvatar = (event) => { const file = event.target.files?.[0]; if (!file) return; avatarFile.value = file; avatarPreview.value = URL.createObjectURL(file) }
const uploadAvatar = async () => { if (!avatarFile.value) return notify('请先选择头像'); try { const avatar = await api.uploadAvatar(avatarFile.value); const url = typeof avatar === 'string' ? avatar : avatar?.url || avatar?.avatar; user.value = { ...user.value, avatar: url }; avatarPreview.value = url; localStorage.setItem('campus-user', JSON.stringify(user.value)); avatarFile.value = null; notify('头像上传成功') } catch { notify('头像上传失败，请检查 OSS 配置') } }
const chooseItemImages = (event) => { imageFiles.value = [...(event.target.files || [])]; imagePreviews.value = imageFiles.value.map((file) => URL.createObjectURL(file)) }
const imageUrlList = (value) => Array.isArray(value) ? value : (value ? String(value).split(',').map((url) => url.trim()).filter(Boolean) : [])
const uploadedUrls = (result) => imageUrlList(typeof result === 'string' ? result : result?.urls || result?.url || result?.images)
const uploadSelectedImages = async () => { if (!imageFiles.value.length) return []; try { const result = imageFiles.value.length === 1 ? await api.uploadItemImage(imageFiles.value[0]) : await api.uploadItemImages(imageFiles.value); return uploadedUrls(result) } catch { notify('图片上传失败，请检查 OSS 配置'); return [] } }
const saveProfile = async () => { try { const info = await api.updateUser({ ...profile.value }); user.value = { ...user.value, ...info, ...profile.value }; notify('个人资料已更新') } catch { user.value = { ...user.value, ...profile.value }; notify('资料已在本地更新，连接后端即可同步') } localStorage.setItem('campus-user', JSON.stringify(user.value)) }
const savePassword = async () => { if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) return notify('请填写完整密码'); try { await api.updatePassword(passwordForm.value); passwordForm.value = { oldPassword: '', newPassword: '' }; notify('密码修改成功') } catch { notify('演示修改成功，连接后端即可同步') } }
const logout = async () => { try { await api.logout() } catch { } user.value = null; localStorage.removeItem('campus-user'); localStorage.removeItem('token'); view.value = 'home'; notify('已退出登录') }
const publish = async () => {
  if (!form.value.title || !form.value.location) return notify('请填写标题和地点')
  const images = await uploadSelectedImages()
  try {
    await api.createItem({ ...form.value, images: images.join(',') })
    notify('线索发布成功')
    view.value = 'home'
    await load(1)
  } catch (error) {
    notify(error.message || '发布失败，请先登录')
  }
}
const submitComment = async () => { if (!user.value) return (view.value = 'auth'); if (!commentText.value.trim()) return; try { const comment = await api.createComment({ itemId: selected.value.itemId, content: commentText.value.trim(), parentId: 0 }); comments.value.push(comment); commentText.value = ''; notify('评论已发布') } catch { notify('评论提交失败，请稍后重试') } }
const removeComment = async (comment) => { try { await api.deleteComment(comment.commentId); comments.value = comments.value.filter((item) => item.commentId !== comment.commentId); notify('评论已删除') } catch { notify('暂无权限删除这条评论') } }
const markItem = async (status) => { try { await api.updateItemStatus({ itemId: selected.value.itemId, status }); selected.value.status = status; await load(); notify(status === 1 ? '已标记为找回 / 归还' : '已重新标记为进行中') } catch { notify('状态更新失败，请确认你是发布者') } }
const removeItem = async () => { try { await api.deleteItem(selected.value.itemId); items.value = items.value.filter((item) => item.itemId !== selected.value.itemId); view.value = 'home'; notify('线索已删除') } catch { notify('暂无权限删除这条线索') } }
const startEditItem = () => { editingItem.value = { ...selected.value }; editingImages.value = imageUrlList(selected.value.images); imageFiles.value = []; imagePreviews.value = []; view.value = 'edit-item' }
const removeEditingImage = async (url) => { editingImages.value = editingImages.value.filter((image) => image !== url); try { await api.deleteItemImage(url) } catch { } }
const saveEditedItem = async () => { const newImages = await uploadSelectedImages(); const images = [...editingImages.value, ...newImages]; try { await api.updateItemImages(editingItem.value.itemId, images); const item = await api.updateItem({ ...editingItem.value, images: images.join(',') }); selected.value = { ...selected.value, ...(item || editingItem.value), images: images.join(',') }; items.value = items.value.map((entry) => entry.itemId === selected.value.itemId ? selected.value : entry); view.value = 'detail'; notify('线索已更新') } catch { notify('更新失败，请确认你是发布者') } }
const resetAnnouncementForm = () => { announcementForm.value = { title: '', content: '', isTop: 0 }; editingAnnouncement.value = null }
const editAnnouncement = (notice) => { editingAnnouncement.value = notice; announcementForm.value = { title: notice.title || '', content: notice.content || '', isTop: notice.isTop || 0 } }
const saveAnnouncement = async () => {
  if (!announcementForm.value.title.trim() || !announcementForm.value.content.trim()) return notify('请填写公告标题和内容')
  try {
    const isEditing = Boolean(editingAnnouncement.value)
    if (isEditing) await api.updateAnnouncement({ ...announcementForm.value, announcementId: editingAnnouncement.value.announcementId })
    else await api.createAnnouncement(announcementForm.value)
    await loadAnnouncements()
    resetAnnouncementForm()
    notify(isEditing ? '公告已更新' : '公告已发布')
  } catch { notify('公告操作失败，请确认当前账号是管理员') }
}
const removeAnnouncement = async (notice) => { try { await api.deleteAnnouncement(notice.announcementId); notices.value = notices.value.filter((item) => item.announcementId !== notice.announcementId); notify('公告已删除') } catch { notify('删除失败，请确认当前账号是管理员') } }
// const ask = async () => { if (!question.value) return; const text = question.value; question.value = ''; try { answer.value = await api.chat(text) } catch { answer.value = '你可以登录后发布物品，也可以在首页通过关键词和分类寻找线索。' } }
onMounted(() => { load(); loadAnnouncements(); restoreSession() })
//流式输出
const question = ref("");
const answer = ref("");
const loading = ref(false);

const ask = async () => {
  if (loading.value || !question.value.trim()) return;
  loading.value = true;
  answer.value = "";
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(question.value),
    });
    if (res.status === 401) {
      answer.value = "未登录，请先登录";
      return;
    }
    if (!res.ok || !res.body) {
      answer.value = "请求异常";
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // SSE 使用双换行作为事件分隔符
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const lines = event.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            // 截取 data: 后面全部内容
            const text = line.slice(5);
            answer.value += text;
            // 滚动到底部
            setTimeout(() => {
              const box = document.querySelector(".chat-box");
              if (box) box.scrollTop = box.scrollHeight;
            }, 0);
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
    answer.value = "网络异常";
  } finally {
    loading.value = false;
  }
};





</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" @click.prevent="view = 'home'"><span
          class="brand-mark">拾</span><b>拾光</b><small>校园失物招领</small></a>
      <nav><button :class="{ active: view === 'home' }" @click="view = 'home'">浏览线索</button><button
          :class="{ active: view === 'notices' }" @click="view = 'notices'">校园公告</button></nav>
        <div class="top-actions"><button class="icon-button" @click="view = 'chat'">✦</button><button v-if="!user"
          class="login-link" @click="view = 'auth'">登录 / 注册</button><button v-else class="user-pill"
          @click="openProfile"><span>{{ (user.nickname || user.username || '我').slice(0, 1) }}</span>{{ user.nickname || user.username }}</button></div>
    </header>

    <main>
      <section v-if="view === 'home'">
        <div class="hero">
          <div>
            <p class="eyebrow">A LITTLE KINDNESS, A BIG RETURN</p>
            <h1>让遗失的物品，<br><em>回到它的主人身边。</em></h1>
            <p class="hero-text">留下线索，也留下善意。每一次发布，都可能成为一场温柔的重逢。</p><button class="primary-button"
              @click="view = user ? 'publish' : 'auth'">发布一条线索 ↗</button>
          </div>
          <div class="hero-art">
            <div class="sun"></div>
            <div class="art-card card-back"></div>
            <div class="art-card card-front"><small>TODAY'S FIND</small><strong>一枚校园卡</strong><span>南门 ·
                09:10</span><i>↗</i></div>
          </div>
        </div>
        <div class="section-heading">
          <div>
            <p class="eyebrow">EXPLORE THE CAMPUS</p>
            <h2>正在寻找的物品</h2>
          </div><span>共 {{ total }} 条线索 · 第 {{ page }} / {{ pages }} 页</span>
        </div>
        <div class="filters">
            <div class="search-box">⌕ <input v-model="search" placeholder="搜索物品、地点或特征" @keyup.enter="searchItems"><button class="search-submit" @click="searchItems">搜索</button></div>
            <div class="filter-tabs"><button :class="{ selected: filter === '' }" @click="changeFilter('')">全部</button><button
              :class="{ selected: filter === '0' }" @click="changeFilter('0')">我丢失的</button><button
              :class="{ selected: filter === '1' }" @click="changeFilter('1')">我捡到的</button></div>
        </div>
        <div v-if="loadingItems" class="empty-state">正在加载线索...</div><div v-else-if="!visibleItems.length" class="empty-state">没有找到匹配的线索。</div><div v-else class="item-grid">
          <article v-for="item in visibleItems" :key="item.itemId" class="item-card" @click="open(item)">
            <div class="item-image" :class="`tone-${item.itemId % 4}`"><span>{{ item.publishType === 0 ? 'LOST' :
                'FOUND' }}</span><b>{{ types[item.itemType] || '物品' }}</b></div>
            <div class="item-content">
              <div class="item-meta"><span :class="['tag', item.publishType === 0 ? 'lost' : 'found']">{{
                item.publishType === 0 ? '寻找失物' : '拾到物品' }}</span><span>{{ date(item.eventTime) }}</span></div>
              <h3>{{ item.title }}</h3>
              <p class="location">⌖ {{ item.location }}</p>
              <p class="description">{{ item.description }}</p>
              <div class="item-footer"><span>{{ item.publisherName || '匿名同学' }}</span><span>♡ {{ item.commentCount || 0
                  }}</span></div>
            </div>
          </article>
        </div>
        <div v-if="pages > 1" class="pagination"><button :disabled="page === 1" @click="load(page - 1)">← 上一页</button><span>第 {{ page }} / {{ pages }} 页</span><button :disabled="page === pages" @click="load(page + 1)">下一页 →</button></div>
      </section>

      <section v-else-if="view === 'detail' && selected" class="page-view"><button class="back-link"
          @click="view = 'home'">← 返回线索列表</button>
        <div class="detail-layout">
          <div class="detail-visual" :class="`tone-${selected.itemId % 4}`"><span>{{ selected.publishType === 0 ? 'LOST ITEM' : 'FOUND ITEM' }}</span></div>
          <div><span :class="['tag', selected.publishType === 0 ? 'lost' : 'found']">{{ selected.publishType === 0 ?
            '寻找失物' : '拾到物品' }}</span>
            <h1>{{ selected.title }}</h1>
            <p class="detail-location">⌖ {{ selected.location }} · {{ date(selected.eventTime) }}</p><p v-if="selected.storageLocation" class="detail-location">存放地点：{{ selected.storageLocation }}</p>
            <div class="detail-block">
              <h4>详细描述</h4>
              <p>{{ selected.description }}</p>
            </div>
            <div class="detail-block">
              <h4>物品特征</h4>
              <p>{{ selected.features }}</p>
            </div>
            <div v-if="imageUrlList(selected.images).length" class="detail-images"><img v-for="url in imageUrlList(selected.images)" :key="url" :src="url" alt="物品图片"></div>
            <div class="detail-actions"><button class="primary-button" @click="user ? notify('已向发布者发送联系请求') : view = 'auth'">联系发布者 ↗</button><button v-if="user && String(selected.publisherId) === String(user.userId)" class="secondary-button" @click="startEditItem">编辑</button><button v-if="user && String(selected.publisherId) === String(user.userId)" class="danger-button" @click="removeItem">删除</button></div>
            <div v-if="user && String(selected.publisherId) === String(user.userId)" class="status-actions"><button @click="markItem(selected.status === 1 ? 0 : 1)">{{ selected.status === 1 ? '标记为进行中' : '标记为已找回 / 已归还' }}</button></div>
            <div class="comments-block"><div class="comments-title"><h4>评论</h4><span>{{ comments.length }} 条</span></div><div v-if="comments.length" class="comment-list"><div v-for="comment in comments" :key="comment.commentId" class="comment"><div class="comment-avatar">{{ (comment.userNickname || '同').slice(0, 1) }}</div><div><strong>{{ comment.userNickname || '匿名同学' }}</strong><p>{{ comment.content }}</p><small>{{ date(comment.createTime) }} <button v-if="user && (String(comment.userId) === String(user.userId) || user.role === 1)" @click="removeComment(comment)">删除</button></small></div></div></div><p v-else class="muted-copy">还没有评论，留下第一条线索回应。</p><div class="comment-input"><input v-model="commentText" placeholder="说点什么..." @keyup.enter="submitComment"><button @click="submitComment">发送 ↗</button></div></div>
          </div>
        </div>
      </section>

      <section v-else-if="view === 'edit-item'" class="page-view form-view"><button class="back-link" @click="view = 'detail'">← 返回详情</button><p class="eyebrow">REFINE YOUR CLUE</p><h1>编辑线索</h1><form @submit.prevent="saveEditedItem"><label>标题<input v-model="editingItem.title" required></label><label>地点<input v-model="editingItem.location" required></label><label>详细描述<textarea v-model="editingItem.description" rows="4"></textarea></label><label>物品特征<textarea v-model="editingItem.features" rows="3"></textarea></label><label>联系方式<input v-model="editingItem.contact"></label><div class="image-upload-field"><strong>物品图片</strong><input type="file" accept="image/png,image/jpeg,image/webp" multiple @change="chooseItemImages"><div class="image-preview-list"><div v-for="url in editingImages" :key="url" class="image-preview"><img :src="url" alt="已上传图片"><button type="button" @click="removeEditingImage(url)">删除</button></div><div v-for="url in imagePreviews" :key="url" class="image-preview"><img :src="url" alt="待上传图片"></div></div></div><button class="primary-button">保存修改 ↗</button></form></section>

      <section v-else-if="view === 'profile'" class="page-view profile-view">
        <div class="profile-heading"><div><p class="eyebrow">YOUR LIGHTHOUSE</p><h1>个人中心</h1><p class="lead">管理你的资料，查看你留下的校园线索。</p></div><button class="text-button" @click="logout">退出登录</button></div>
        <div class="profile-grid">
            <div class="profile-card profile-summary"><label class="avatar-picker"><img v-if="avatarPreview || user?.avatar" :src="avatarPreview || user.avatar" alt="用户头像"><span v-else>{{ (user?.nickname || user?.username || '我').slice(0, 1) }}</span><input type="file" accept="image/png,image/jpeg,image/webp" @change="chooseAvatar"></label><button class="secondary-button avatar-upload-button" @click="uploadAvatar">上传头像</button><h2>{{ user?.nickname || user?.username }}</h2><p>@{{ user?.username }}</p><span class="role-label">{{ user?.role === 1 ? '管理员' : '校园用户' }}</span><div class="profile-stats"><div><strong>{{ myItems.length }}</strong><small>我的线索</small></div><div><strong>{{ myItems.filter(item => item.status === 1).length }}</strong><small>已找回</small></div><div><strong>{{ user?.createTime ? date(user.createTime) : '今日' }}</strong><small>加入时间</small></div></div></div>
          <form class="profile-card profile-form" @submit.prevent="saveProfile"><div class="card-title"><h3>基本资料</h3><span>PROFILE</span></div><label>用户名<input :value="user?.username" disabled></label><label>昵称<input v-model="profile.nickname" required placeholder="你的校园昵称"></label><label>联系方式<input v-model="profile.contact" placeholder="手机号、微信号或其他联系方式"></label><button class="primary-button" type="submit">保存资料 ↗</button></form>
          <form class="profile-card profile-form password-form" @submit.prevent="savePassword"><div class="card-title"><h3>安全设置</h3><span>SECURITY</span></div><label>当前密码<input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码"></label><label>新密码<input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"></label><button class="secondary-button" type="submit">修改密码</button></form>
        </div>
        <div class="my-items-heading"><h2>我的线索</h2><span>{{ myItems.length }} 条记录</span></div><div v-if="myItems.length" class="item-grid"><article v-for="item in myItems" :key="item.itemId" class="item-card" @click="open(item)"><div class="item-image" :class="`tone-${item.itemId % 4}`"><span>{{ item.publishType === 0 ? 'LOST' : 'FOUND' }}</span><b>{{ types[item.itemType] || '物品' }}</b></div><div class="item-content"><h3>{{ item.title }}</h3><p class="location">⌖ {{ item.location }}</p><div class="item-footer"><span>{{ item.status === 1 ? '已找回 / 已归还' : '进行中' }}</span><span>{{ date(item.eventTime) }}</span></div></div></article></div><div v-else class="profile-empty">你还没有发布线索。<button class="text-button" @click="view = 'publish'">去发布一条 ↗</button></div>
      </section>

      <section v-else-if="view === 'publish'" class="page-view form-view">
        <p class="eyebrow">LEAVE A CLUE</p>
        <h1>发布一条线索</h1>
        <p class="lead">描述得越清楚，重逢就越近。</p>
        <form @submit.prevent="publish">
          <div class="form-row"><label>这是<select v-model="form.publishType">
                <option :value="0">我丢失的物品</option>
                <option :value="1">我拾到的物品</option>
              </select></label><label>物品类型<select v-model="form.itemType">
                <option v-for="(name, id) in types" :key="id" :value="Number(id)">{{ name }}</option>
              </select></label></div><label>标题<input v-model="form.title" required
              placeholder="例如：黑色帆布双肩包"></label><label>地点<input v-model="form.location" required
              placeholder="例如：图书馆三楼自习区"></label><label>详细描述<textarea v-model="form.description" rows="4"
              placeholder="颜色、品牌、内含物品等..."></textarea></label><label>物品特征<textarea v-model="form.features" rows="3"
              placeholder="留下只有失主知道的小细节"></textarea></label><label>联系方式<input v-model="form.contact"
              placeholder="手机号、微信号或其他联系方式"></label><div class="image-upload-field"><strong>物品图片</strong><input type="file" accept="image/png,image/jpeg,image/webp" multiple @change="chooseItemImages"><div class="image-preview-list"><div v-for="url in imagePreviews" :key="url" class="image-preview"><img :src="url" alt="待上传图片"></div></div></div><button class="primary-button">发布线索 ↗</button>
        </form>
      </section>

      <section v-else-if="view === 'auth'" class="page-view auth-view">
        <div class="auth-intro">
          <p class="eyebrow">WELCOME BACK</p>
          <h1>让善意<br><em>继续流动。</em></h1>
          <p>登录后可以发布线索、联系物品发布者，参与校园里的每一次互助。</p>
        </div>
        <form class="auth-form" @submit.prevent="login">
          <div class="auth-switch"><button type="button" :class="{ selected: authMode === 'login' }"
              @click="authMode = 'login'">登录</button><button type="button"
              :class="{ selected: authMode === 'register' }" @click="authMode = 'register'">注册</button></div><label
            v-if="authMode === 'register'">昵称<input v-model="auth.nickname"
              placeholder="你的校园昵称"></label><label>用户名<input v-model="auth.username" required
              placeholder="请输入用户名"></label><label>密码<input v-model="auth.password" required type="password"
              placeholder="请输入密码"></label><button class="primary-button">{{ authMode === 'login' ? '进入拾光' : '创建账号' }}
            ↗</button>
        </form>
      </section>

      <section v-else-if="view === 'notices'" class="page-view announcement-view">
        <p class="eyebrow">CAMPUS NOTES</p>
        <h1>校园公告</h1>
        <form v-if="user?.role === 1" class="announcement-admin-form" @submit.prevent="saveAnnouncement">
          <div class="card-title"><h3>{{ editingAnnouncement ? '编辑公告' : '发布公告' }}</h3><span>ADMIN ONLY</span></div>
          <label>标题<input v-model="announcementForm.title" required placeholder="公告标题"></label>
          <label>内容<textarea v-model="announcementForm.content" required rows="3" placeholder="公告内容"></textarea></label>
          <label class="checkbox-label"><input v-model="announcementForm.isTop" type="checkbox" :true-value="1" :false-value="0"> 置顶公告</label>
          <div class="announcement-form-actions"><button class="primary-button" type="submit">{{ editingAnnouncement ? '保存修改' : '发布公告' }} ↗</button><button v-if="editingAnnouncement" class="text-button" type="button" @click="resetAnnouncementForm">取消编辑</button></div>
        </form>
        <div class="announcement-list">
          <article v-for="(notice, index) in notices" :key="notice.announcementId || index"><span>{{ String(index +
            1).padStart(2, '0') }}</span>
            <div>
              <h3>{{ notice.isTop === 1 ? '置顶 · ' : '' }}{{ notice.title }}</h3>
              <p>{{ notice.content }}</p>
            </div><time>{{ date(notice.createTime) }}<br><template v-if="user?.role === 1"><button class="notice-action" @click="editAnnouncement(notice)">编辑</button><button class="notice-action danger-text" @click="removeAnnouncement(notice)">删除</button></template></time>
          </article>
        </div>
      </section>

      <section v-else class="page-view chat-view">
        <div class="chat-header">
          <p class="eyebrow">LIGHTHOUSE ASSISTANT</p>
          <h1>有什么想问的？</h1>
          <p>关于发布、寻找、认领，拾光都可以帮你。</p>
        </div>
        <div class="chat-box">
          <div v-if="answer" class="chat-bubble">{{ answer }}</div>
          <div v-else class="chat-placeholder">试试问：<button @click="question = '如何发布物品？'">如何发布物品？</button><button
              @click="question = '在哪里查看拾到的物品？'">在哪里查看拾到的物品？</button></div>
          <div class="chat-input"><input v-model="question" placeholder="输入你的问题..." @keyup.enter="ask"><button
              @click="ask">↗</button></div>
        </div>
      </section>
    </main>
    <footer><span>拾光 · 校园失物招领</span><span>让每一件物品，都有回家的路</span></footer>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>
