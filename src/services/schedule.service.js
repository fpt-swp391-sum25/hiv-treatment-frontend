import axios from './axios.customize';

export const scheduleService = {
    // Lịch hẹn
    createSchedule: async (scheduleData) => {
        try {
            const response = await axios.post('/api/schedule', scheduleData);
            return response.data;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    },

    getAllSchedules: async () => {
        try {
            const response = await axios.get('/api/schedule');
            return response.data;
        } catch (error) {
            console.error('Error getting all schedules:', error);
            return [];
        }
    },

    getSchedulesByDoctor: async (doctorId) => {
        try {
            const response = await axios.get(`/api/schedule/doctor-id/${doctorId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting doctor schedules:', error);
            return [];
        }
    },

    getAllDoctors: async () => {
        try {
            const response = await axios.get('/api/doctor-profile');
            return response.data;
        } catch (error) {
            console.error('Error getting doctors:', error);
            return [];
        }
    },

    // Các hàm phụ trợ
    getSchedulesByDate: async (date) => {
        try {
            const response = await axios.get(`/api/schedule/date/${date}`);
            return response.data;
        } catch (error) {
            console.error('Error getting schedules by date:', error);
            return [];
        }
    },

    getSchedulesByType: async (type) => {
        try {
            const response = await axios.get(`/api/schedule/type/${type}`);
            return response.data;
        } catch (error) {
            console.error('Error getting schedules by type:', error);
            return [];
        }
    },
    
    getSchedulesByStatus: async (status) => {
        try {
            const response = await axios.get(`/api/schedule/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Error getting schedules by status:', error);
            return [];
        }
    },

    getSchedulesByPatient: async (patientId) => {
        try {
            const response = await axios.get(`/api/schedule/patient-id/${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting schedules by patient:', error);
            return [];
        }
    }
};
