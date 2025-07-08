import axios from './axios.customize';

// ===================== DOCUMENT API =====================

// Tạo mới document
export const createDocument = async (data, doctorId) => {
  // data: { title, content }
  // doctorId: id của bác sĩ hiện tại
  const payload = {
    ...data,
    createdAt: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    doctorId: doctorId,
  };
  return axios.post('/api/document', payload);
};

// Lấy danh sách tất cả document
export const getAllDocuments = async () => {
  return axios.get('/api/document');
};

// Lấy chi tiết document theo id
export const getDocumentById = async (id) => {
  return axios.get(`/api/document/${id}`);
};

// Cập nhật document theo id
export const updateDocument = async (id, data) => {
  return axios.put(`/api/document/${id}`, data);
};

// Xóa document theo id
export const deleteDocument = async (id) => {
  return axios.delete(`/api/document/${id}`);
};

// Tìm kiếm document
export const searchDocuments = async (searchString) => {
  return axios.get('/api/document/search', { params: { searchString } });
};

// ===================== DOCUMENT IMAGE API =====================

/**
 * Tạo mới ảnh cho document
 * @param {Object} data - { image, documentId }
 * @returns {Promise}
 */
export const createDocumentImage = async (data) => {
  return axios.post('/api/document-image', data);
};

/**
 * Lấy chi tiết ảnh theo id
 * @param {number} id
 * @returns {Promise}
 */
export const getDocumentImageById = async (id) => {
  return axios.get(`/api/document-image/${id}`);
};

/**
 * Cập nhật ảnh theo id
 * @param {number} id
 * @param {Object} data - { image, documentId }
 * @returns {Promise}
 */
export const updateDocumentImage = async (id, data) => {
  return axios.put(`/api/document-image/${id}`, data);
};

/**
 * Xóa ảnh theo id
 * @param {number} id
 * @returns {Promise}
 */
export const deleteDocumentImage = async (id) => {
  return axios.delete(`/api/document-image/${id}`);
};

/**
 * Lấy danh sách ảnh theo documentId
 * @param {number} documentId
 * @returns {Promise}
 */
export const getDocumentImagesByDocumentId = async (documentId) => {
  return axios.get(`/api/document-image/document-id/${documentId}`);
}; 