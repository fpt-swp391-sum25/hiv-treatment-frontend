import axios from './axios.customize'

const deleteTestOrderAPI = (testOrderId) => {
  const URL_BACKEND = `/api/test-order/${testOrderId}`
  return axios.delete(URL_BACKEND)
}

const createTestOrderAPI = (name, note, expectedResultTime, healthRecordId, testTypeId) => {
  const testOrderData = {
    name,
    note,
    expectedResultTime,
    healthRecordId,
    testTypeId
  }
  const URL_BACKEND = '/api/test-order'
  return axios.post(URL_BACKEND, testOrderData)
}

const updateTestOrderAPI = (testOrderId, type, result, unit, note, expectedResultTime, actualResultTime) => {
  const testOrderData = {
    testTypeId: type.id,
    result,
    unit,
    note,
    expectedResultTime,
    actualResultTime
  }
  const URL_BACKEND = `/api/test-order/${testOrderId}`
  return axios.put(URL_BACKEND, testOrderData)
}

const getTestOrdersByHealthRecordIdAPI = (healthRecordId) => {
  return axios.get(`/api/test-order/health-record-id/${healthRecordId}`);
}

const confirmTestOrderPaymentAPI = (healthRecordId, totalPrice) => {
  return axios.put(`/api/test-order/success/${healthRecordId}`, { totalPrice });
}

const undoTestOrderPaymentAPI = (healthRecordId) => {
  return axios.put(`/api/test-order/undo/${healthRecordId}`);
}

export {
  deleteTestOrderAPI,
  createTestOrderAPI,
  updateTestOrderAPI,
  getTestOrdersByHealthRecordIdAPI,
  confirmTestOrderPaymentAPI,
  undoTestOrderPaymentAPI
}