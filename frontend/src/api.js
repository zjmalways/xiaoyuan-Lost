const upload = async (path, files, fieldName = "files") => {
  const data = new FormData();
  const list = Array.isArray(files) ? files : [files];
  list.forEach((file) => data.append(fieldName, file));
  const token = localStorage.getItem("token");
  const response = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: data,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.code >= 400) throw new Error(result.message || "上传失败");
  return result.data;
};

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.code >= 400)
    throw new Error(result.message || "请求失败");
  return result.data;
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
  // chat: (question) =>
  //   request("/chat", { method: "POST", body: JSON.stringify({ question }) }),
  chat: (question) =>
    request("/chat/stream", { method: "POST", body: JSON.stringify({ question }) }),


};

