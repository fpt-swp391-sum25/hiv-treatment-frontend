import axios from './axios.customize';

export async function getPaymentsByFilter(status, name, description) {
  const res = await axios.post('/api/payment/search', { status, name, description });
  return res.data;
}

export const togglePaymentStatus = async (paymentId) => {
  return axios.put(`/api/payment/${paymentId}/toggle-status`);
};

export const getPaymentByScheduleIdAPI = (scheduleId) => {
  return axios.get(`/api/payment/schedule/${scheduleId}`);
};

export const createCashPaymentAPI = (data) => {
    return axios.post('/api/payment/cash', data);
}
