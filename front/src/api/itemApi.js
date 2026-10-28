import request from '@/utils/request'

export const getItems = params => request.get('/items/list', { params }).then(result => result.data)
export const getItem = id => request.get(`/items/detail/${id}`).then(result => result.data)
export const getItemTypes = () => request.get('/items/types').then(result => result.data)
export const createItem = payload => request.post('/items/create', payload).then(result => result.data)
export const updateItem = payload => request.put('/items/update', payload).then(result => result.data)
export const deleteItem = id => request.delete(`/items/delete/${id}`).then(result => result.data)
export const updateItemStatus = payload => request.put('/items/status', payload).then(result => result.data)
export const updateItemImages = (id, imageUrls) => request.put(`/items/images/${id}`, { imageUrls }).then(result => result.data)
export const deleteItemImage = imageUrl => request.delete('/items/upload/image', { data: { imageUrl } }).then(result => result.data)

export const uploadItemImages = files => {
  const form = new FormData()
  files.forEach(file => form.append('files', file))
  return request.post('/items/upload/images', form).then(result => result.data)
}
