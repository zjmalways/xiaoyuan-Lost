const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const readResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok || (typeof result.code === "number" && result.code >= 400)) {
    throw new Error(result.message || `请求失败（${response.status}）`);
  }
  return result.data;
};

const upload = async (path, files, fieldName = "files") => {
  const data = new FormData();
  const list = Array.isArray(files) ? files : [files];
  list.forEach((file) => data.append(fieldName, file));
  const response = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: data,
  });
  return readResponse(response);
};

const request = async (path, options = {}) => {
  const { headers = {}, ...requestOptions } = options;
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...headers,
    },
    ...requestOptions,
  });
  return readResponse(response);
};

export const api = {
  listItems: (params) => request(`/items/list?${new URLSearchParams(params)}`),
  getItem: (id) => request(`/items/detail/${id}`),
  login: (data) =>
    request("/user/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) =>
    request("/user/register", { method: "POST", body: JSON.stringify(data) }),
  userInfo: () => request("/user/info"),
  updateUser: (data) =>
    request("/user/update", { method: "PUT", body: JSON.stringify(data) }),
  updatePassword: (data) =>
    request("/user/password", { method: "PUT", body: JSON.stringify(data) }),
  logout: () => request("/logout", { method: "POST" }),
  createItem: (data) =>
    request("/items/create", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (data) =>
    request("/items/update", { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/items/delete/${id}`, { method: "DELETE" }),
  updateItemStatus: (data) =>
    request("/items/status", { method: "PUT", body: JSON.stringify(data) }),
  listItemTypes: () => request("/items/types"),
  updateItemImages: (id, images) =>
    request(`/items/images/${id}`, { method: "PUT", body: JSON.stringify({ imageUrls: Array.isArray(images) ? images : [images] }) }),
  uploadItemImage: (file) => upload("/items/upload/image", file, "file"),
  uploadItemImages: (files) => upload("/items/upload/images", files),
  deleteItemImage: (url) =>
    request("/items/upload/image", { method: "DELETE", body: JSON.stringify({ imageUrl: url }) }),
  listComments: (itemId) => request(`/comments/item/${itemId}`),
  createComment: (data) =>
    request("/comments/create", { method: "POST", body: JSON.stringify(data) }),
  deleteComment: (id) => request(`/comments/delete/${id}`, { method: "DELETE" }),
  listAnnouncements: () => request("/announcements/list"),
  getAnnouncement: (id) => request(`/announcements/detail/${id}`),
  createAnnouncement: (data) =>
    request("/announcements/create", { method: "POST", body: JSON.stringify(data) }),
  updateAnnouncement: (data) =>
    request("/announcements/update", { method: "PUT", body: JSON.stringify(data) }),
  deleteAnnouncement: (id) => request(`/announcements/delete/${id}`, { method: "DELETE" }),
  uploadAvatar: (file) => upload("/user/avatar", file, "file"),
  createChatSession: (data = {}) =>
    request("/chat/sessions", { method: "POST", body: JSON.stringify(data) }),
  listChatSessions: () => request("/chat/sessions"),
  listChatMessages: (sessionId) =>
    request(`/chat/sessions/${sessionId}/messages`),
  streamChat: (question, sessionId) =>
    fetch("/api/chat/stream", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "text/plain;charset=UTF-8",
        ...authHeaders(),
        ...(sessionId ? { "X-Chat-Session-Id": sessionId } : {}),
      },
      body: question,
    }),
};
