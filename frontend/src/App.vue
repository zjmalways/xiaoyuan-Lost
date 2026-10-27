<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from './api'
import AnnouncementsPage from './components/AnnouncementsPage.vue'
import AuthPage from './components/AuthPage.vue'
import ChatPage from './components/ChatPage.vue'
import EditItemPage from './components/EditItemPage.vue'
import HomePage from './components/HomePage.vue'
import ItemDetailPage from './components/ItemDetailPage.vue'
import ProfilePage from './components/ProfilePage.vue'
import PublishPage from './components/PublishPage.vue'

const view = ref('home')
const items = ref([])
const notices = ref([])
const selected = ref(null)
const search = ref('')
const filter = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const pages = ref(1)
const loadingItems = ref(false)
const itemsError = ref('')
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
const types = ref({ 1: '证件', 2: '钥匙', 3: '电子设备', 4: '衣物', 5: '钱包', 6: '其他' })
const visibleItems = computed(() => items.value)
const myItems = ref([])
const myItemsError = ref('')
const canManageItem = (item) => user.value && (
  Number(user.value.role) === 1 || String(item.publisherId) === String(user.value.userId)
)
const notify = (text) => { toast.value = text; setTimeout(() => { toast.value = '' }, 2400) }
const date = (value) => value ? new Date(value).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) : '刚刚'
const load = async (pageNum = page.value) => {
  loadingItems.value = true
  page.value = pageNum
  try {
    const params = { pageNum: page.value, pageSize: pageSize.value }
    if (filter.value !== '') params.publishType = filter.value
    if (typeFilter.value !== '') params.itemType = typeFilter.value
    if (statusFilter.value !== '') params.status = statusFilter.value
    if (search.value.trim()) params.keyword = search.value.trim()
    const data = await api.listItems(params)
    items.value = data?.records || []
    total.value = Number(data?.total ?? items.value.length)
    pages.value = Math.max(1, Number(data?.pages ?? Math.ceil(total.value / pageSize.value)))
    itemsError.value = ''
  } catch (error) {
    items.value = []
    total.value = 0
    pages.value = 1
    itemsError.value = error.message || '物品线索加载失败，请稍后重试'
  } finally { loadingItems.value = false }
}
const searchItems = () => load(1)
const changeFilter = (value) => { filter.value = value; load(1) }
const changeTypeFilter = (value) => { typeFilter.value = value; load(1) }
const changeStatusFilter = (value) => { statusFilter.value = value; load(1) }
const loadAnnouncements = async () => {
  try {
    const data = await api.listAnnouncements()
    notices.value = Array.isArray(data) ? data : []
  } catch (error) {
    notices.value = []
    notify(error.message || '公告加载失败，请稍后重试')
  }
}
const loadItemTypes = async () => {
  try {
    const data = await api.listItemTypes()
    if (data && typeof data === 'object') {
      Object.assign(types.value, data)
    }
  } catch (error) {
    notify(error.message || '物品分类加载失败，正在使用默认分类')
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
const loadMyItems = async () => {
  if (!user.value) {
    myItems.value = []
    myItemsError.value = ''
    return
  }
  try {
    const data = await api.listItems({ pageNum: 1, pageSize: 100, publisherId: user.value.userId })
    myItems.value = data?.records || []
    myItemsError.value = ''
  } catch (error) {
    myItems.value = []
    myItemsError.value = error.message || '我的线索加载失败'
  }
}
const open = async (item) => {
  selected.value = item
  view.value = 'detail'
  comments.value = []
  try {
    selected.value = await api.getItem(item.itemId)
    comments.value = await api.listComments(item.itemId) || []
  } catch (error) {
    notify(error.message || '物品详情或评论加载失败')
  }
}
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
const openProfile = async () => {
  if (!user.value) return (view.value = 'auth')
  profile.value = { nickname: user.value.nickname || '', contact: user.value.contact || '' }
  view.value = 'profile'
  try {
    const info = await api.userInfo()
    user.value = { ...user.value, ...info }
    profile.value = { nickname: info.nickname || '', contact: info.contact || '' }
    localStorage.setItem('campus-user', JSON.stringify(user.value))
  } catch (error) {
    notify(error.message || '个人资料加载失败')
  }
  await loadMyItems()
}
const chooseAvatar = (event) => { const file = event.target.files?.[0]; if (!file) return; avatarFile.value = file; avatarPreview.value = URL.createObjectURL(file) }
const uploadAvatar = async () => {
  if (!avatarFile.value) return notify('请先选择头像')
  try {
    const avatar = await api.uploadAvatar(avatarFile.value)
    const url = typeof avatar === 'string' ? avatar : avatar?.url || avatar?.avatar
    if (!url) throw new Error('上传响应中没有头像地址')
    user.value = { ...user.value, avatar: url }
    avatarPreview.value = url
    localStorage.setItem('campus-user', JSON.stringify(user.value))
    avatarFile.value = null
    notify('头像上传成功')
  } catch (error) {
    notify(error.message || '头像上传失败')
  }
}
const chooseItemImages = (event) => { imageFiles.value = [...(event.target.files || [])]; imagePreviews.value = imageFiles.value.map((file) => URL.createObjectURL(file)) }
const imageUrlList = (value) => Array.isArray(value) ? value : (value ? String(value).split(',').map((url) => url.trim()).filter(Boolean) : [])
const uploadedUrls = (result) => imageUrlList(typeof result === 'string' ? result : result?.urls || result?.url || result?.images)
const uploadSelectedImages = async () => {
  if (!imageFiles.value.length) return []
  const result = imageFiles.value.length === 1
    ? await api.uploadItemImage(imageFiles.value[0])
    : await api.uploadItemImages(imageFiles.value)
  const urls = uploadedUrls(result)
  if (!urls.length) throw new Error('图片上传成功，但响应中没有图片地址')
  return urls
}
const saveProfile = async () => {
  try {
    const info = await api.updateUser({ ...profile.value })
    user.value = { ...user.value, ...info, ...profile.value }
    localStorage.setItem('campus-user', JSON.stringify(user.value))
    notify('个人资料已更新')
  } catch (error) {
    notify(error.message || '个人资料更新失败')
  }
}
const savePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) return notify('请填写完整密码')
  try {
    await api.updatePassword(passwordForm.value)
    passwordForm.value = { oldPassword: '', newPassword: '' }
    notify('密码修改成功')
  } catch (error) {
    notify(error.message || '密码修改失败')
  }
}
const logout = async () => {
  let logoutError = ''
  try {
    await api.logout()
  } catch (error) {
    logoutError = error.message || '服务端登出请求失败'
  }
  user.value = null
  myItems.value = []
  myItemsError.value = ''
  chatSessions.value = []
  chatSessionId.value = ''
  chatMessages.value = []
  localStorage.removeItem('campus-user')
  localStorage.removeItem('token')
  view.value = 'home'
  notify(logoutError ? `本地登录状态已清除；${logoutError}` : '已退出登录')
}
const publish = async () => {
  if (!form.value.title || !form.value.location) return notify('请填写标题和地点')
  try {
    const images = await uploadSelectedImages()
    await api.createItem({ ...form.value, images: images.join(',') })
    notify('线索发布成功')
    view.value = 'home'
    await load(1)
    await loadMyItems()
  } catch (error) {
    notify(error.message || '发布失败，请先登录')
  }
}
const submitComment = async () => {
  if (!user.value) return (view.value = 'auth')
  if (!commentText.value.trim()) return
  try {
    const comment = await api.createComment({ itemId: selected.value.itemId, content: commentText.value.trim(), parentId: 0 })
    comments.value.push(comment)
    commentText.value = ''
    notify('评论已发布')
  } catch (error) {
    notify(error.message || '评论提交失败')
  }
}
const removeComment = async (comment) => {
  try {
    await api.deleteComment(comment.commentId)
    comments.value = comments.value.filter((item) => item.commentId !== comment.commentId)
    notify('评论已删除')
  } catch (error) {
    notify(error.message || '评论删除失败，请确认操作权限')
  }
}
const markItem = async (status) => { try { await api.updateItemStatus({ itemId: selected.value.itemId, status }); selected.value.status = status; await load(); await loadMyItems(); notify(status === 1 ? '已标记为找回 / 归还' : '已重新标记为进行中') } catch (error) { notify(error.message || '状态更新失败，请确认你是发布者') } }
const removeItem = async () => { try { await api.deleteItem(selected.value.itemId); items.value = items.value.filter((item) => item.itemId !== selected.value.itemId); view.value = 'home'; notify('线索已删除') } catch { notify('暂无权限删除这条线索') } }
const startEditItem = () => { editingItem.value = { ...selected.value }; editingImages.value = imageUrlList(selected.value.images); imageFiles.value = []; imagePreviews.value = []; view.value = 'edit-item' }
const removeEditingImage = async (url) => {
  try {
    await api.deleteItemImage(url)
    editingImages.value = editingImages.value.filter((image) => image !== url)
  } catch (error) {
    notify(error.message || '图片删除失败')
  }
}
const saveEditedItem = async () => {
  try {
    const newImages = await uploadSelectedImages()
    const images = [...editingImages.value, ...newImages]
    await api.updateItem({ ...editingItem.value, images: images.join(',') })
    selected.value = { ...selected.value, ...editingItem.value, images: images.join(',') }
    items.value = items.value.map((entry) => entry.itemId === selected.value.itemId ? selected.value : entry)
    imageFiles.value = []
    imagePreviews.value = []
    view.value = 'detail'
    notify('线索已更新')
  } catch (error) {
    notify(error.message || '更新失败，请确认你是发布者')
  }
}
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
const question = ref("");
const loading = ref(false);
const chatSessions = ref([]);
const chatSessionId = ref('');
const chatMessages = ref([]);

const selectChatSession = async (session) => {
  if (loading.value || !session?.sessionId) return
  chatSessionId.value = String(session.sessionId)
  chatMessages.value = []
  try {
    const messages = await api.listChatMessages(chatSessionId.value)
    chatMessages.value = Array.isArray(messages) ? messages : []
  } catch (error) {
    notify(error.message || '会话记录加载失败')
  }
}
const loadChatSessions = async () => {
  try {
    const data = await api.listChatSessions()
    chatSessions.value = Array.isArray(data) ? data : []
    if (!chatSessionId.value && chatSessions.value.length) {
      await selectChatSession(chatSessions.value[0])
    }
  } catch (error) {
    notify(error.message || '会话列表加载失败')
  }
}
const openChat = async () => {
  if (!user.value) {
    view.value = 'auth'
    notify('请先登录后使用智能客服')
    return
  }
  view.value = 'chat'
  await loadChatSessions()
}
const startNewChat = async () => {
  if (!user.value || loading.value) return
  try {
    const session = await api.createChatSession({ title: '新对话' })
    if (!session?.sessionId) throw new Error('新建会话响应缺少 sessionId')
    chatSessionId.value = String(session.sessionId)
    chatMessages.value = []
    await loadChatSessions()
  } catch (error) {
    notify(error.message || '新建会话失败')
  }
}
const ask = async () => {
  const text = question.value.trim()
  if (loading.value || !text) return
  if (!user.value) {
    view.value = 'auth'
    notify('请先登录后使用智能客服')
    return
  }
  loading.value = true
  question.value = ''
  chatMessages.value.push({ role: 'USER', content: text })
  const assistantMessage = { role: 'ASSISTANT', content: '', status: 'COMPLETED' }
  chatMessages.value.push(assistantMessage)
  let pendingAnswer = "";
  let scrollFrame = null;
  const flushAnswer = () => {
    assistantMessage.content += pendingAnswer;
    pendingAnswer = "";
    scrollFrame = null;
  };
  try {
    const res = await api.streamChat(text, chatSessionId.value)
    if (res.status === 401) {
      throw new Error('登录状态已失效，请重新登录')
    }
    if (!res.ok || !res.body) {
      const body = (await res.text()).trim()
      let message = body
      try {
        message = JSON.parse(body).message || body
      } catch {
        message = body
      }
      throw new Error(message || `客服请求失败（${res.status}）`)
    }
    const sessionId = res.headers.get('X-Chat-Session-Id')
    if (sessionId) chatSessionId.value = sessionId
    else if (!chatSessionId.value) throw new Error('客服响应缺少会话 ID，请检查后端 CORS 配置')

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    const consumeEvent = (event) => {
      const data = event.split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).replace(/^ /, ''))
      if (!data.length) return
      const content = data.join('\n')
      if (content === '[DONE]') return
      pendingAnswer += content
      if (scrollFrame === null) scrollFrame = requestAnimationFrame(flushAnswer)
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode()
        break
      }
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";
      events.forEach(consumeEvent)
    }
    if (buffer) consumeEvent(buffer)
    if (pendingAnswer) {
      if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
      flushAnswer();
    }
    if (!assistantMessage.content) assistantMessage.content = '暂未收到回复，请重试。'
    await loadChatSessions()
  } catch (error) {
    if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
    pendingAnswer = "";
    assistantMessage.status = 'FAILED'
    assistantMessage.content = error.message || '网络异常，请稍后重试'
  } finally {
    loading.value = false;
  }
};
onMounted(() => { load(); loadAnnouncements(); loadItemTypes(); restoreSession() })





</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" @click.prevent="view = 'home'">
        <span class="brand-mark">拾</span><b>拾光</b><small>校园失物招领</small>
      </a>
      <nav>
        <button :class="{ active: view === 'home' }" @click="view = 'home'">浏览线索</button>
        <button :class="{ active: view === 'notices' }" @click="view = 'notices'">校园公告</button>
      </nav>
      <div class="top-actions">
        <button class="icon-button" aria-label="智能客服" @click="openChat">✦</button>
        <button v-if="!user" class="login-link" @click="view = 'auth'">登录 / 注册</button>
        <button v-else class="user-pill" @click="openProfile">
          <span>{{ (user.nickname || user.username || '我').slice(0, 1) }}</span>
          {{ user.nickname || user.username }}
        </button>
      </div>
    </header>

    <main>
      <HomePage
        v-if="view === 'home'"
        v-model:search="search"
        :items="visibleItems"
        :total="total"
        :page="page"
        :pages="pages"
        :loading="loadingItems"
        :error="itemsError"
        :filter="filter"
        :type-filter="typeFilter"
        :status-filter="statusFilter"
        :types="types"
        :date="date"
        :image-url-list="imageUrlList"
        @search="searchItems"
        @filter="changeFilter"
        @type-filter="changeTypeFilter"
        @status-filter="changeStatusFilter"
        @page="load"
        @open="open"
        @publish="view = user ? 'publish' : 'auth'"
      />
      <ItemDetailPage
        v-else-if="view === 'detail' && selected"
        v-model:comment-text="commentText"
        :item="selected"
        :user="user"
        :comments="comments"
        :date="date"
        :image-url-list="imageUrlList"
        :can-manage="canManageItem(selected)"
        @back="view = 'home'"
        @login="view = 'auth'"
        @contact="notify(selected.contact || '该线索暂未提供联系方式')"
        @edit="startEditItem"
        @delete="removeItem"
        @mark="markItem"
        @submit-comment="submitComment"
        @delete-comment="removeComment"
      />
      <EditItemPage
        v-else-if="view === 'edit-item' && editingItem"
        :item="editingItem"
        :images="editingImages"
        :previews="imagePreviews"
        @back="view = 'detail'"
        @choose-images="chooseItemImages"
        @remove-image="removeEditingImage"
        @save="saveEditedItem"
      />
      <ProfilePage
        v-else-if="view === 'profile' && user"
        :user="user"
        :my-items="myItems"
        :my-items-error="myItemsError"
        :profile="profile"
        :password-form="passwordForm"
        :avatar-preview="avatarPreview"
        :types="types"
        :date="date"
        :image-url-list="imageUrlList"
        @logout="logout"
        @choose-avatar="chooseAvatar"
        @upload-avatar="uploadAvatar"
        @save-profile="saveProfile"
        @save-password="savePassword"
        @open-item="open"
        @publish="view = 'publish'"
      />
      <PublishPage
        v-else-if="view === 'publish'"
        :form="form"
        :types="types"
        :previews="imagePreviews"
        @choose-images="chooseItemImages"
        @submit="publish"
      />
      <AuthPage
        v-else-if="view === 'auth'"
        v-model:mode="authMode"
        :form="auth"
        @submit="login"
      />
      <AnnouncementsPage
        v-else-if="view === 'notices'"
        :notices="notices"
        :user="user"
        :form="announcementForm"
        :editing="editingAnnouncement"
        :date="date"
        @submit="saveAnnouncement"
        @edit="editAnnouncement"
        @delete="removeAnnouncement"
        @cancel-edit="resetAnnouncementForm"
      />
      <ChatPage
        v-else-if="view === 'chat'"
        v-model:question="question"
        :sessions="chatSessions"
        :session-id="chatSessionId"
        :messages="chatMessages"
        :loading="loading"
        :date="date"
        @new-session="startNewChat"
        @select-session="selectChatSession"
        @submit="ask"
      />
    </main>
    <footer><span>拾光 · 校园失物招领</span><span>让每一件物品，都有回家的路</span></footer>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>
