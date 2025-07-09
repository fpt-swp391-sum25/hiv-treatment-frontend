import axios from './axios.customize';

// Tạo notification mới
export const createNotification = (data) => {
    console.log("DEBUG | data:", data);
  return axios.post('/api/notification', data);
};

// Lấy tất cả notification
export const getNotifications = () => {
  return axios.get('/api/notification');
};

// Lấy notification theo id
export const getNotificationById = (id) => {
  return axios.get(`/api/notification/${id}`);
};

// Cập nhật notification
export const updateNotification = (id, data) => {
  return axios.put(`/api/notification/${id}`, data);
};

// Xóa notification
export const deleteNotification = (id) => {
  return axios.delete(`/api/notification/${id}`);
};

// Lấy notification theo userId
export const getNotificationsByUserId = (userId) => {
  return axios.get(`/api/notification/user-id/${userId}`);
};

// Tìm kiếm notification theo title
export const searchNotifications = (searchString) => {
  return axios.get(`/api/notification/search`, { params: { searchString } });
}; 