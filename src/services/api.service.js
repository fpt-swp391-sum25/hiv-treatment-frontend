import axios from './axios.customize'

const loginAPI = (username, password) => {
    const URL_BACKEND = '/api/auth/login'
    const data = {
        username: username,
        password: password,
    }
    return axios.post(URL_BACKEND, data)
}

const registerAPI = (values) => {
    const URL_BACKEND = '/api/auth/register'
    const data = {
        fullName: values.fullname,
        gender: values.gender,
        dateOfBirth: values.dob.format('DD-MM-YYYY'),
        email: values.email,
        phone: values.phone,
        address: values.address,
        username: values.username,
        password: values.password
    }
    return axios.post(URL_BACKEND, data)
}

const bookingAPI = (values) => {
    const URL_BACKEND = `/api/schedule/`
    const data = {
        name: values.name,
        phone: values.phone,
        service: values.type,
        doctor: values.doctor,
        date: values.date.format('DD-MM-YYYY'),
        slot: values.time,
    }
    return axios.post(URL_BACKEND, data)
}

const cancelBookingAPI = (scheduleId, patientId) => {
    const URL_BACKEND = `/api/schedule/${scheduleId}/cancel`

    return axios.delete(URL_BACKEND, {
        params: { patientId: patientId.toString() },
    })
}

const fetchAllScheduleAPI = (doctorId, date) => {
    const URL_BACKEND = '/api/schedule'
    return axios.get(URL_BACKEND, {
        params: {
            doctorId,
            date: date.format('YYYY-MM-DD'),
            status: 'Trống',
        },
    })
}

const fetchScheduleByDateAPI = (date) => {
    const URL_BACKEND = `/api/schedule/available-slots/${date}`
    return axios.get(URL_BACKEND)
}

const registerScheduleAPI = (registerData) => {
    const URL_BACKEND = `/api/schedule/register/schedule-id/${registerData.scheduleId}?patientId=${registerData.patientId}&type=${registerData.type}`
    return axios.put(URL_BACKEND)
}

const initiatePaymentAPI = (params) => {
    const URL_BACKEND = '/api/payment'
    return axios.post(URL_BACKEND, params)
}


const createAccountAPI = (username, password, email, role) => {
    const URL_BACKEND = '/api/user/create'
    const data = {
        username,
        password,
        email,
        role
    }
    return axios.post(URL_BACKEND, data)
}

const handlePaymentCallbackAPI = (params) => {
    const URL_BACKEND = '/api/payment/callback'
    return axios.get(URL_BACKEND, { params })
}

const fetchAllPatientScheduleAPI = (id) => {
    const URL_BACKEND = `/api/schedule/patient-id/${id}`
    return axios.get(URL_BACKEND)
}

const fetchAccountByRoleAPI = (role) => {
    // Đảm bảo role được viết hoa theo yêu cầu của BE
    const uppercaseRole = role.toUpperCase();
    const URL_BACKEND = `/api/user/${uppercaseRole}`;
    console.log(`Fetching accounts with role ${uppercaseRole} from: ${URL_BACKEND}`);
    return axios.get(URL_BACKEND);
}

const updateAccountAPI = (id, username, email) => {
    const URL_BACKEND = `/api/user/${id}`
    const data = {
        username,
        email
    }

    return axios.put(URL_BACKEND, data)
}

const deleteAccountAPI = (id) => {
    const URL_BACKEND = `/api/user/${id}`
    return axios.delete(URL_BACKEND)
}

const fetchDoctorProfileAPI = () => {
    const URL_BACKEND = '/api/doctor-profile'
    return axios.get(URL_BACKEND)
}

const fetchScheduleAPI = () => {
    const URL_BACKEND = '/api/schedule/list'
    return axios.get(URL_BACKEND)
}

const fetchAvailableSlotAPI = (doctorId, date) => {
    const URL_BACKEND = `/api/schedule/available-slots?doctorId=${doctorId}&date=${date}`
    return axios.get(URL_BACKEND)
}

const fetchAccountAPI = () => {
    const URL_BACKEND = '/api/auth/account'
    return axios.get(URL_BACKEND)
}

const logoutAPI = () => {
    const URL_BACKEND = '/api/auth/logout'
    return axios.post(URL_BACKEND)
}

const fetchAllDoctorsAPI = () => {
    // Sử dụng đúng endpoint và format theo BE
    const URL_BACKEND = '/api/user/DOCTOR'; // Role phải viết IN HOA: "DOCTOR"
    console.log('Calling API to fetch doctors from:', URL_BACKEND);
    return axios.get(URL_BACKEND);
}

// Lấy thông tin chi tiết của một bác sĩ
const fetchDoctorByIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/doctor-profile/doctor-id/${doctorId}`;
    return axios.get(URL_BACKEND);
}

// Cập nhật thông tin bác sĩ
const updateDoctorProfileAPI = (id, profileData) => {
    const URL_BACKEND = `/api/doctor-profile/${id}`;
    return axios.put(URL_BACKEND, profileData);
}

// Lấy thống kê công việc của bác sĩ
const fetchDoctorStatisticsAPI = (doctorId) => {
    const URL_BACKEND = `/api/doctors/${doctorId}/statistics`;
    return axios.get(URL_BACKEND);
}

const fetchAllDocumentsAPI = () => {
    const URL_BACKEND = '/api/document'
    return axios.get(URL_BACKEND)
}

const fetchUsersAPI = () => {
    const URL_BACKEND = '/api/user/patient'
    return axios.get(URL_BACKEND)
}

const fetchHealthRecordByScheduleIdAPI = (scheduleId) => {
    const URL_BACKEND = `/api/health-record/schedule-id/${scheduleId}`
    return axios.get(URL_BACKEND)
}

const createHealthRecordAPI = (scheduleId) => {
    const URL_BACKEND = '/api/health-record'
    const data = {
        scheduleId: scheduleId
    }
    return axios.post(URL_BACKEND, data)
}

const fetchTestResultByHealthRecordIdAPI = (healthRecordId) => {
    const URL_BACKEND = `/api/test-result/health-record-id/${healthRecordId}`
    return axios.get(URL_BACKEND)
}

const updateHealthRecordAPI = (healthRecordId, healthRecordData) => {
    const URL_BACKEND = `/api/health-record/${healthRecordId}`
    return axios.put(URL_BACKEND, healthRecordData)
}

const deleteTestResultAPI = (testResultId) => {
    const URL_BACKEND = `/api/test-result/${testResultId}`
    return axios.delete(URL_BACKEND)
}

const createTestResultAPI = (type, note, expectedResultTime, healthRecordId) => {
    const testResultData = {
        type,
        note,
        expectedResultTime,
        healthRecordId,
    }
    const URL_BACKEND = 'api/test-result'
    return axios.post(URL_BACKEND, testResultData)
}

const updateTestResultAPI = (testResultId, type, result, unit, note, expectedResultTime, actualResultTime) => {
    const testResultData = {
        type,
        result,
        unit,
        note,
        expectedResultTime,
        actualResultTime
    }
    const URL_BACKEND = `api/test-result/${testResultId}`
    return axios.put(URL_BACKEND, testResultData)
}

const fetchUserInfoAPI = (id) => {
    const URL_BACKEND = `/api/user/user-id/${id}`
    return axios.get(URL_BACKEND)
}

const updateProfileAPI = (values) => {
    const URL_BACKEND = `/api/user/${values.id}`
    return axios.put(URL_BACKEND, values)
}
const fetchScheduleByDoctorIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/schedule/doctor-id/${doctorId}`
    return axios.get(URL_BACKEND)
}

const fetchRegimensByDoctorIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/regimen/doctor-id/${doctorId}`
    return axios.get(URL_BACKEND)
}

const fetchAllRegimensAPI = () => {
    const URL_BACKEND = '/api/regimen'
    return axios.get(URL_BACKEND)
}

const createRegimenAPI = (components, regimenName,
    description, indications, contraindications) => {
    const createData = {
        components,
        regimenName,
        description,
        indications,
        contraindications
    }
    const URL_BACKEND = '/api/regimen';
    return axios.post(URL_BACKEND, createData)
}

const updateRegimenAPI = (id, components, regimenName,
    description, indications, contraindications) => {
    const createData = {
        components,
        regimenName,
        description,
        indications,
        contraindications
    }
    const URL_BACKEND = `/api/regimen/${id}`;
    return axios.put(URL_BACKEND, createData)
}

const deleteRegimenAPI = (id) => {
    const URL_BACKEND = `/api/regimen/${id}`;
    return axios.delete(URL_BACKEND)
}

const updateUserAPI = (id, updateData) => {
    const URL_BACKEND = `/api/user/${id}`;
    return axios.put(URL_BACKEND, updateData)
}
// Thêm các API từ schedule.service.js
const createScheduleAPI = (scheduleData) => {
    const URL_BACKEND = '/api/schedule';
    console.log('Sending schedule data to API:', scheduleData);

    // Đảm bảo scheduleData có định dạng đúng theo yêu cầu của BE
    const formattedData = {
        type: scheduleData.type || 'Khám',
        roomCode: scheduleData.roomCode || '100', // Mặc định phòng 100 nếu không có
        date: scheduleData.date, // Giữ nguyên định dạng YYYY-MM-DD
        slot: scheduleData.slot, // Định dạng HH:mm:ss
        doctorId: parseInt(scheduleData.doctorId), // Đảm bảo là số
        status: 'available' // Luôn đặt trạng thái là available (làm việc)
    };

    console.log('Formatted data for API:', formattedData);
    return axios.post(URL_BACKEND, formattedData);
}

const getAllSchedulesAPI = () => {
    // Try the new endpoint first, with fallback to the old one if needed
    const URL_BACKEND = '/api/schedule/list';
    console.log('Fetching schedules from:', URL_BACKEND);
    
    return axios.get(URL_BACKEND)
        .catch(error => {
            console.error('Error fetching from /api/schedule/list:', error);
            console.log('Trying fallback endpoint /api/schedule...');
            
            // If the first endpoint fails, try the fallback
            return axios.get('/api/schedule');
        });
}

const getSchedulesByDoctorAPI = (doctorId) => {
    const URL_BACKEND = `/api/schedule/doctor-id/${doctorId}`;
    return axios.get(URL_BACKEND);
}

const getSchedulesByDateAPI = (date) => {
    const URL_BACKEND = `/api/schedule/date/${date}`;
    return axios.get(URL_BACKEND);
}

const getSchedulesByTypeAPI = (type) => {
    const URL_BACKEND = `/api/schedule/type/${type}`;
    return axios.get(URL_BACKEND);
}

const getSchedulesByStatusAPI = (status) => {
    const URL_BACKEND = `/api/schedule/status/${status}`;
    return axios.get(URL_BACKEND);
}

const updateScheduleAPI = (scheduleId, scheduleData) => {
    const URL_BACKEND = `/api/schedule/${scheduleId}`;
    return axios.put(URL_BACKEND, scheduleData);
}

const deleteScheduleAPI = (scheduleId) => {
    const URL_BACKEND = `/api/schedule/${scheduleId}`;
    return axios.delete(URL_BACKEND);
}

const getSchedulesByPatientAPI = (patientId) => {
    const URL_BACKEND = `/api/schedule/patient-id/${patientId}`;
    return axios.get(URL_BACKEND);
}

// Thêm API mới để lấy users theo role
const fetchUsersByRoleAPI = (role) => {
    // Đảm bảo role được viết hoa theo yêu cầu của BE
    const uppercaseRole = role.toUpperCase();
    // Endpoint sử dụng đúng với backend API
    const URL_BACKEND = `/api/user/${uppercaseRole}`;

    console.log(`Fetching users with role ${uppercaseRole} from: ${URL_BACKEND}`);
    return axios.get(URL_BACKEND);
}

// Thêm API mới để lấy danh sách nhân viên xét nghiệm
const fetchAllLabTechniciansAPI = () => {
    const URL_BACKEND = '/api/user/LAB_TECHNICIAN';
    console.log('Calling API to fetch lab technicians from:', URL_BACKEND);
    return axios.get(URL_BACKEND);
}

export {
    loginAPI,
    registerAPI,
    bookingAPI,
    cancelBookingAPI,
    createAccountAPI,
    fetchAccountByRoleAPI,
    deleteAccountAPI,
    updateAccountAPI,
    fetchDoctorProfileAPI,
    fetchScheduleAPI,
    fetchAccountAPI,
    fetchAllPatientScheduleAPI,
    fetchAvailableSlotAPI,
    fetchAllScheduleAPI,
    fetchScheduleByDateAPI,
    initiatePaymentAPI,
    registerScheduleAPI,
    handlePaymentCallbackAPI,
    logoutAPI,
    fetchUserInfoAPI,
    fetchAllDoctorsAPI,
    fetchDoctorByIdAPI,
    updateDoctorProfileAPI,
    fetchDoctorStatisticsAPI,
    fetchAllDocumentsAPI,
    fetchUsersAPI,
    updateProfileAPI,
    fetchHealthRecordByScheduleIdAPI,
    createHealthRecordAPI,
    fetchTestResultByHealthRecordIdAPI,
    updateHealthRecordAPI,
    deleteTestResultAPI,
    createTestResultAPI,
    updateTestResultAPI,

    fetchScheduleByDoctorIdAPI,
    fetchRegimensByDoctorIdAPI,
    fetchAllRegimensAPI,
    createRegimenAPI,
    updateRegimenAPI,
    deleteRegimenAPI,

    updateUserAPI,


    // Thêm các API mới
    createScheduleAPI,
    getAllSchedulesAPI,
    getSchedulesByDoctorAPI,
    getSchedulesByDateAPI,
    getSchedulesByTypeAPI,
    getSchedulesByStatusAPI,
    updateScheduleAPI,
    deleteScheduleAPI,
    getSchedulesByPatientAPI,
    fetchUsersByRoleAPI,
    fetchAllLabTechniciansAPI
}