import request from '@/utils/request'

export const getChatSessions = () => request.get('/chat/sessions').then(result => result.data)
export const createChatSession = payload => request.post('/chat/sessions', payload).then(result => result.data)
export const getChatMessages = id => request.get(`/chat/sessions/${id}/messages`).then(result => result.data)

export async function streamChat(question, sessionId, onMessage, signal) {
  const headers = {
    Accept: 'text/event-stream',
    'Content-Type': 'text/plain'
  }
  if (sessionId) headers['X-Chat-Session-Id'] = String(sessionId)

  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: question,
    signal
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `客服请求失败（${response.status}）`)
  }
  if (!response.body) throw new Error('浏览器不支持读取客服流式响应')

  const newSessionId = response.headers.get('X-Chat-Session-Id')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  function dispatchEvent(rawEvent) {
    const data = rawEvent
      .split(/\r?\n/)
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).replace(/^ /, ''))
      .join('\n')
    if (data && data !== '[DONE]') onMessage(data)
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
      const events = buffer.split(/\r?\n\r?\n/)
      buffer = events.pop() || ''
      events.forEach(dispatchEvent)
      if (done) break
    }
    if (buffer.trim()) dispatchEvent(buffer)
  } finally {
    reader.releaseLock()
  }

  return newSessionId
}
