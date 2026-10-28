import request from '@/utils/request'

export const loginApi = payload => request.post('/user/login', payload).then(result => result.data)
export const registerApi = payload => request.post('/user/register', payload).then(result => result.data)
export const getUserInfo = () => request.get('/user/info').then(result => result.data)
export const updateUser = payload => request.put('/user/update', payload).then(result => result.data)
export const updatePassword = payload => request.put('/user/password', payload).then(result => result.data)
export const logoutApi = () => request.post('/logout').then(result => result.data)
export const uploadAvatar = file => {
  const form = new FormData()
  form.append('file', file)
  return request.post('/user/avatar', form).then(result => result.data)
}
