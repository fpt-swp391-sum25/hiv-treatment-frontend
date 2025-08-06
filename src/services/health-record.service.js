import axios from './axios.customize';

export const healthRecordService = {
    // Lấy hồ sơ sức khỏe theo Schedule ID
    getHealthRecordByScheduleId: async (scheduleId) => {
        try {
            const response = await axios.get(`/api/health-record/schedule-id/${scheduleId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting health record by schedule ID:', error);
            return null;
        }
    }
};

const fetchHealthRecordsAPI = () => {
    const URL_BACKEND = '/api/health-record';
    return axios.get(URL_BACKEND);
};

const getHealthRecordByDoctorIdAPI = async (doctorId, filterType, selectedDate) => {
    const params = {};

    if (filterType) params.filterType = filterType;
    if (selectedDate) params.selectedDate = selectedDate;

    try {
        const response = await axios.get(`/api/health-record/doctor-id/${doctorId}`, {
            params
        });
        return response;
    } catch (error) {
        console.error('Lỗi gọi API getHealthRecordByDoctorIdAPI:', error);
        throw error;
    }
};

const fetchHealthRecordByScheduleIdAPI = (scheduleId) => {
    const URL_BACKEND = `/api/health-record/schedule-id/${scheduleId}`
    return axios.get(URL_BACKEND)
}

const createHealthRecordAPI = (paymentRef) => {
    const URL_BACKEND = '/api/health-record'
    const data = {
        paymentRef: paymentRef
    }
    return axios.post(URL_BACKEND, data)
}

const createHealthRecordByPaymentIdAPI = (paymentId) => {
    const URL_BACKEND = '/api/health-record/schedule-id'
    const data = {
        paymentId: paymentId
    }
    return axios.post(URL_BACKEND, data)
}

const fetchTestOrderByHealthRecordIdAPI = (healthRecordId) => {
    const URL_BACKEND = `/api/test-order/health-record-id/${healthRecordId}`
    return axios.get(URL_BACKEND)
}

const updateHealthRecordAPI = (healthRecordId, healthRecordData) => {
    const URL_BACKEND = `/api/health-record/${healthRecordId}`
    return axios.put(URL_BACKEND, healthRecordData)
}
export {
    fetchHealthRecordByScheduleIdAPI,
    createHealthRecordAPI,
    fetchHealthRecordsAPI,
    fetchTestOrderByHealthRecordIdAPI,
    updateHealthRecordAPI,
    getHealthRecordByDoctorIdAPI,
    createHealthRecordByPaymentIdAPI
}