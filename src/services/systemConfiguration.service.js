import axios from './axios.customize';

export async function fetchServicePrices() {
  try {
    const response = await axios.get('/api/system-configuration');
    const configs = response.data || [];
    const prices = {};
    configs.forEach(cfg => {
      prices[cfg.name] = cfg.value;
    });
    return prices;
  } catch (error) {
    throw error;
  }
}

const fetchSystemConfigurationsAPI = () => {
  const URL_BACKEND = '/api/system-configuration'
  return axios.get(URL_BACKEND)
};
{ }
const updateSystemConfigurationAPI = (id, dataUpdate) => {
  axios.put(`/api/system-configuration/${id}`, dataUpdate);
}

const createSystemConfigurationAPI = (createData) => {
  axios.post("/api/system-configurations", createData);
}


const deleteSystemConfigurationAPI = (id) => {
  axios.delete(`/api/system-configuration/${id}`);
}

export {
  fetchSystemConfigurationsAPI,
  updateSystemConfigurationAPI,
  createSystemConfigurationAPI,
  deleteSystemConfigurationAPI,
}