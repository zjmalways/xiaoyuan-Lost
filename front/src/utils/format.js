export const itemTypes = [
  { value: 1, label: '证件' },
  { value: 2, label: '钥匙' },
  { value: 3, label: '电子设备' },
  { value: 4, label: '衣物' },
  { value: 5, label: '钱包' },
  { value: 6, label: '其他' }
]

export function itemTypeName(value) {
  return itemTypes.find(type => type.value === Number(value))?.label || '其他'
}

export function formatTime(value) {
  if (!value) return '时间未提供'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false })
}

export function imageList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return typeof value === 'string' ? value.split(',').map(url => url.trim()).filter(Boolean) : []
}
