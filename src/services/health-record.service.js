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