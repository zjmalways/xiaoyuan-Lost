import request from '@/utils/request'

export const getComments = itemId => request.get(`/comments/item/${itemId}`).then(result => result.data)
export const createComment = payload => request.post('/comments/create', payload).then(result => result.data)
export const deleteComment = id => request.delete(`/comments/delete/${id}`).then(result => result.data)

export const getAnnouncements = params => request.get('/announcements/list', { params }).then(result => result.data)
export const getAnnouncement = id => request.get(`/announcements/detail/${id}`).then(result => result.data)
export const createAnnouncement = payload => request.post('/announcements/create', payload).then(result => result.data)
export const updateAnnouncement = payload => request.put('/announcements/update', payload).then(result => result.data)
export const deleteAnnouncement = id => request.delete(`/announcements/delete/${id}`).then(result => result.data)
