import axios from './axios.customize';

export const getAllTestTypes = async () => {
  const response = await axios.get('/api/test-type');
  return response.data;
};

