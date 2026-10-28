import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/utils/auth'
import Layout from '@/views/layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', name: 'home', component: () => import('@/views/home.vue') },
        { path: 'items/new', name: 'item-create', component: () => import('@/views/itemForm.vue'), meta: { requiresAuth: true } },
        { path: 'items/:itemId/edit', name: 'item-edit', component: () => import('@/views/itemForm.vue'), meta: { requiresAuth: true } },
        { path: 'items/:itemId', name: 'item-detail', component: () => import('@/views/itemDetail.vue') },
        { path: 'profile', name: 'profile', component: () => import('@/views/profile.vue'), meta: { requiresAuth: true } },
        { path: 'announcements', name: 'announcements', component: () => import('@/views/announcements.vue') },
        { path: 'chat', name: 'chat', component: () => import('@/views/chat.vue'), meta: { requiresAuth: true } }
      ]
    },
    { path: '/login', name: 'login', component: () => import('@/views/login.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async to => {
  const { initialize, user } = useAuth()
  try {
    await initialize()
  } catch (error) {
    ElMessage.error(error.message)
    if (to.meta.requiresAuth) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  if (to.meta.requiresAuth && !user.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
