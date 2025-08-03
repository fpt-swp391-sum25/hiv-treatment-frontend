import axios from './axios.customize'

// Lấy danh sách tất cả loại xét nghiệm
export const fetchTestTypesAPI = () => {
  return axios.get('/api/test-type')
}

export const getAllTestTypes = async () => {
  const response = await axios.get('/api/test-type')
  return response.data
}

// Lấy loại xét nghiệm theo ID
export const fetchTestTypeByIdAPI = (id) => {
  return axios.get(`/api/test-type/${id}`)
}

// Tạo loại xét nghiệm mới
export const createTestTypeAPI = (data) => {
  return axios.post('/api/test-type', data)
}

// Cập nhật loại xét nghiệm
export const updateTestTypeAPI = (id, data) => {
  return axios.put(`/api/test-type/${id}`, data)
}

// Xóa loại xét nghiệm
export const deleteTestTypeAPI = (id) => {
  return axios.delete(`/api/test-type/${id}`)
}

// Kiểm tra xem loại xét nghiệm có thể xóa không
export const checkTestTypeDeletableAPI = (id) => {
  return axios.post(`/api/test-type/${id}`)
}

