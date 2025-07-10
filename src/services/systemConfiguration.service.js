import axios from 'axios';

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