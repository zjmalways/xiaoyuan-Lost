import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true
})

request.interceptors.response.use(
  response => {
    const result = response.data
    if (result && typeof result.code === 'number' && result.code !== 200) {
      const message = result.message || (result.code >= 500
        ? `服务器处理失败（业务码 ${result.code}）`
        : `请求失败（业务码 ${result.code}）`)
      return Promise.reject(new Error(message))
    }
    return result
  },
  error => {
    const message = error.response?.data?.message || error.message || '网络请求失败'
    return Promise.reject(new Error(message))
  }
)

export default request
