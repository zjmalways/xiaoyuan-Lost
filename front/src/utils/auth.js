import { ref } from 'vue'
import { getUserInfo, loginApi, logoutApi, registerApi } from '@/api/userApi'

const user = ref(null)
let initialization
let initialized = false

function initialize() {
  if (initialized) return Promise.resolve(user.value)
  if (!initialization) {
    initialization = getUserInfo()
      .then(profile => {
        user.value = profile
        initialized = true
      })
      .catch(error => {
        if (/401|未登录|token/i.test(error.message)) {
          user.value = null
          initialized = true
          return
        }
        throw error
      })
      .finally(() => {
        initialization = null
      })
  }
  return initialization
}

function refresh() {
  initialized = false
  return initialize()
}

async function login(credentials) {
  const result = await loginApi(credentials)
  user.value = {
    userId: result.userId,
    username: result.username,
    nickname: result.nickname,
    role: result.role,
    avatar: result.avatar
  }
  initialized = true
  return result
}

async function register(payload) {
  return registerApi(payload)
}

async function logout() {
  await logoutApi()
  user.value = null
  initialized = true
}

export function useAuth() {
  return { user, initialize, refresh, login, register, logout }
}
