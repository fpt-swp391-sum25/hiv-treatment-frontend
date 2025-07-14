import axios from './axios.customize'

const loginAPI = (username, password) => {
    const URL_BACKEND = '/api/auth/login'
    const data = {
        username: username,
        password: password,
    }
    return axios.post(URL_BACKEND, data)
}

const googleLoginAPI = (data) => {
    const URL_BACKEND = '/api/auth/google'
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
            date: date,
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

const retryPaymentAPI = (params) => {
    const URL_BACKEND = '/api/payment/retry'
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
const updateDoctorProfileAPI = (doctorProfileId, profileData) => {
    // Đảm bảo startYear là chuỗi
    if (profileData.startYear !== null && profileData.startYear !== undefined) {
        profileData.startYear = String(profileData.startYear);
    }

    console.log(`Updating doctor profile ID ${doctorProfileId} with data:`, profileData);
    const URL_BACKEND = `/api/doctor-profile/${doctorProfileId}`;
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

const createHealthRecordAPI = (paymentRef) => {
    const URL_BACKEND = '/api/health-record'
    const data = {
        paymentRef: paymentRef
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
    description, indications, contraindications, doctorId) => {
    const createData = {
        components,
        regimenName,
        description,
        indications,
        contraindications,
        doctorId
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
    console.log(">>>>>>>>>>>>>>" + updateData.avatar)
    const URL_BACKEND = `/api/user/${id}`;
    return axios.put(URL_BACKEND, updateData)
}

// Thêm helper function để debug
const debugRequest = (endpoint, method, data) => {
    const debugInfo = {
        endpoint,
        method,
        data: data ? JSON.stringify(data) : null,
        timestamp: new Date().toISOString()
    };

    console.log(`%c🔍 API Request: ${method} ${endpoint}`, 'color: blue; font-weight: bold');
    console.table(debugInfo);
    if (data) console.log('Request Payload:', data);

    return debugInfo;
};

const createScheduleAPI = (scheduleData) => {
    const URL_BACKEND = '/api/schedule';

    // Log chi tiết thông tin request
    debugRequest(URL_BACKEND, 'POST', scheduleData);

    // Đảm bảo scheduleData có định dạng đúng theo yêu cầu của BE
    const formattedData = {
        type: null, // Manager tạo lịch trống với type=null
        roomCode: scheduleData.roomCode || '100', // Mặc định phòng 100 nếu không có
        date: scheduleData.date, // Giữ nguyên định dạng YYYY-MM-DD
        slot: scheduleData.slot, // Định dạng HH:mm:ss
        doctorId: parseInt(scheduleData.doctorId), // Đảm bảo là số
        status: 'Trống', // Đặt trạng thái là "Trống" theo yêu cầu của BE
        patient_id: null // Thêm patient_id: null để phù hợp với schema DB
    };

    // Loại bỏ các trường không cần thiết và kiểm tra giá trị
    if (!formattedData.date || !formattedData.slot || !formattedData.doctorId) {
        console.error('Missing required fields for schedule creation:', formattedData);
        return Promise.reject(new Error('Thiếu thông tin cần thiết để tạo lịch'));
    }

    console.log('Formatted data for API:', formattedData);

    // Thêm một số giá trị để debug
    console.log('Debug values:', {
        'doctorId type': typeof formattedData.doctorId,
        'doctorId value': formattedData.doctorId,
        'slot format': formattedData.slot.match(/^\d{2}:\d{2}:\d{2}$/) ? 'valid' : 'invalid',
        'date format': formattedData.date.match(/^\d{4}-\d{2}-\d{2}$/) ? 'valid' : 'invalid',
        'patient_id': formattedData.patient_id === null ? 'explicitly null' : formattedData.patient_id
    });

    return axios.post(URL_BACKEND, formattedData)
        .then(response => {
            console.log('Create schedule successful:', response);
            return response;
        })
        .catch(error => {
            console.error('Create schedule failed:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            return Promise.reject(error);
        });
}

const getAllSchedulesAPI = () => {
    // Sử dụng endpoint chính thức từ API documentation
    const URL_BACKEND = '/api/schedule/list';
    console.log('🔗 [API] Fetching schedules from:', URL_BACKEND);

    return axios.get(URL_BACKEND)
        .then(response => {
            console.log('✅ [API] Schedule list response:', response);
            return response;
        })
        .catch(error => {
            console.error('❌ [API] Error fetching from /api/schedule/list:', error);
            console.log('🔄 [API] Trying fallback endpoint /api/schedule...');

            // If the first endpoint fails, try the fallback
            return axios.get('/api/schedule')
                .then(response => {
                    console.log('✅ [API] Fallback schedule response:', response);
                    return response;
                })
                .catch(fallbackError => {
                    console.error('❌ [API] Fallback also failed:', fallbackError);
                    throw fallbackError;
                });
        });
}

const getSchedulesByDoctorAPI = (doctorId) => {
    const URL_BACKEND = `/api/schedule/doctor-id/${doctorId}`;
    return axios.get(URL_BACKEND);
}

// API functions sử dụng endpoints từ documentation
const getSchedulesByStatusAPI = (status) => {
    const URL_BACKEND = `/api/schedule/status/${status}`;
    console.log('🔗 [API] Fetching schedules by status:', status, 'from:', URL_BACKEND);
    return axios.get(URL_BACKEND);
}

const getSchedulesByTypeAPI = (type) => {
    const URL_BACKEND = `/api/schedule/type/${type}`;
    console.log('🔗 [API] Fetching schedules by type:', type, 'from:', URL_BACKEND);
    return axios.get(URL_BACKEND);
}

const getSchedulesByDateAPI = (date) => {
    const URL_BACKEND = `/api/schedule/date/${date}`;
    console.log('🔗 [API] Fetching schedules by date:', date, 'from:', URL_BACKEND);
    return axios.get(URL_BACKEND);
}

const getSchedulesByPatientAPI = (patientId) => {
    const URL_BACKEND = `/api/schedule/patient-id/${patientId}`;
    console.log('🔗 [API] Fetching schedules by patient:', patientId, 'from:', URL_BACKEND);
    return axios.get(URL_BACKEND);
}

// Đã xóa tất cả duplicate functions


const updateScheduleAPI = async (scheduleId, scheduleData) => {
    console.log('=== BẮT ĐẦU QUY TRÌNH CẬP NHẬT LỊCH ===');
    console.log('1. Thông tin cập nhật:', { scheduleId, ...scheduleData });

    try {
        // 1. Xóa lịch cũ
        console.log('2. Tiến hành xóa lịch cũ:', scheduleId);
        await deleteScheduleAPI(scheduleId);
        console.log('3. Đã xóa lịch cũ thành công');

        // 2. Tạo lịch mới với thông tin đã cập nhật
        const createData = {
            date: scheduleData.date,
            slot: scheduleData.slot,
            roomCode: scheduleData.roomCode || '101',
            status: scheduleData.status === 'available' ? 'Trống' : scheduleData.status,
            doctorId: parseInt(scheduleData.doctorId),
            type: null
        };

        console.log('4. Tạo lịch mới với dữ liệu:', createData);
        const createResponse = await createScheduleAPI(createData);
        console.log('5. Tạo lịch mới thành công:', createResponse.data);

        // 3. Refresh danh sách lịch
        console.log('6. Lấy danh sách lịch mới nhất');
        const updatedList = await getAllSchedulesAPI();
        console.log('7. Hoàn tất cập nhật');

        return updatedList;
    } catch (error) {
        console.error('=== LỖI TRONG QUÁ TRÌNH CẬP NHẬT ===');
        if (error.response) {
            console.error('Mã lỗi:', error.response.status);
            console.error('Thông báo từ server:', error.response.data);
        } else if (error.request) {
            console.error('Không nhận được phản hồi từ server');
        } else {
            console.error('Lỗi:', error.message);
        }
        throw error;
    }
};

const deleteScheduleAPI = (scheduleId) => {
    const URL_BACKEND = `/api/schedule/${scheduleId}`;
    return axios.delete(URL_BACKEND);
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

// Lấy thông tin doctor_profile theo doctorId
const fetchDoctorProfileByDoctorIdAPI = (doctorId) => {
    console.log(`Fetching doctor profile for doctor ID: ${doctorId}`);
    const URL_BACKEND = `/api/doctor-profile/doctor-id/${doctorId}`;
    return axios.get(URL_BACKEND);
};

// Tạo mới doctor_profile
const createDoctorProfileAPI = (profileData) => {
    console.log(`Creating new doctor profile with data:`, profileData);
    // Đảm bảo startYear là chuỗi
    if (profileData.startYear !== null && profileData.startYear !== undefined) {
        profileData.startYear = String(profileData.startYear);
    }
    const URL_BACKEND = `/api/doctor-profile`;
    return axios.post(URL_BACKEND, profileData);
};

// API mới để kiểm tra các slot khả dụng của bác sĩ trong ngày
const checkAvailableSlotsAPI = (doctorId, date) => {
    const URL_BACKEND = `/api/schedule/available-slots?doctorId=${doctorId}&date=${date}`;
    console.log(`Checking available slots for doctor ${doctorId} on date ${date}`);
    return axios.get(URL_BACKEND);
};

// ✅ Advanced API functions theo BE Documentation
const fetchUsersByRoleAndStatusAPI = (role, status) => {
    const URL_BACKEND = `/api/user/${role.toUpperCase()}/account-status/${status}`;
    console.log(`Fetching ${role} users with status ${status} from:`, URL_BACKEND);
    return axios.get(URL_BACKEND);
};

const fetchUsersByRoleAndVerificationAPI = (role, isVerified) => {
    const URL_BACKEND = `/api/user/${role.toUpperCase()}/mail-verification-status/${isVerified}`;
    console.log(`Fetching ${role} users with verification ${isVerified} from:`, URL_BACKEND);
    return axios.get(URL_BACKEND);
};

const getSchedulesWithFiltersAPI = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.date) params.append('date', filters.date); // Format: YYYY-MM-DD
    if (filters.status) params.append('status', filters.status);

    const URL_BACKEND = `/api/schedule?${params.toString()}`;
    console.log('Fetching schedules with filters from:', URL_BACKEND);
    return axios.get(URL_BACKEND);
};

// API mới để lấy dữ liệu thống kê cho Dashboard
const fetchDashboardStatisticsAPI = (filters = {}) => {
    console.log('Fetching dashboard statistics with filters:', filters);

    // Sử dụng Promise.all để gọi nhiều API song song
    return Promise.all([
        getAllSchedulesAPI(),
        fetchAllDoctorsAPI(),
        fetchUsersByRoleAPI('LAB_TECHNICIAN'),
        fetchUsersByRoleAPI('PATIENT')
    ])
        .then(([schedulesRes, doctorsRes, labTechsRes, patientsRes]) => {
            // Lấy dữ liệu từ các API
            const schedules = schedulesRes.data || [];
            const doctors = doctorsRes.data || [];
            const labTechnicians = labTechsRes.data || [];
            const patients = patientsRes.data || [];

            // Tính toán các chỉ số thống kê
            const currentDate = new Date();
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

            // Lọc dữ liệu theo filters nếu có
            let filteredSchedules = schedules;
            if (filters.startDate && filters.endDate) {
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                filteredSchedules = schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    return scheduleDate >= startDate && scheduleDate <= endDate;
                });
            }

            if (filters.doctorId) {
                filteredSchedules = filteredSchedules.filter(schedule =>
                    schedule.doctorId === parseInt(filters.doctorId));
            }

            // Tính toán các chỉ số cho tháng hiện tại và tháng trước
            const currentMonthSchedules = schedules.filter(schedule => {
                const scheduleDate = new Date(schedule.date);
                return scheduleDate.getMonth() === currentDate.getMonth() &&
                    scheduleDate.getFullYear() === currentDate.getFullYear();
            });

            const lastMonthSchedules = schedules.filter(schedule => {
                const scheduleDate = new Date(schedule.date);
                return scheduleDate.getMonth() === lastMonthDate.getMonth() &&
                    scheduleDate.getFullYear() === lastMonthDate.getFullYear();
            });

            // Đếm các lịch hẹn theo trạng thái
            const completedSchedules = currentMonthSchedules.filter(schedule =>
                schedule.status === 'Hoàn thành' || schedule.status === 'COMPLETED');

            const cancelledSchedules = currentMonthSchedules.filter(schedule =>
                schedule.status === 'Đã hủy' || schedule.status === 'CANCELLED');

            const pendingSchedules = currentMonthSchedules.filter(schedule =>
                schedule.status === 'Đang hoạt động' || schedule.status === 'ACTIVE');

            const lastMonthCompletedSchedules = lastMonthSchedules.filter(schedule =>
                schedule.status === 'Hoàn thành' || schedule.status === 'COMPLETED');

            const lastMonthCancelledSchedules = lastMonthSchedules.filter(schedule =>
                schedule.status === 'Đã hủy' || schedule.status === 'CANCELLED');

            // Tính toán tỷ lệ và sự thay đổi
            const completionRate = currentMonthSchedules.length > 0 ?
                (completedSchedules.length / currentMonthSchedules.length) * 100 : 0;

            const lastMonthCompletionRate = lastMonthSchedules.length > 0 ?
                (lastMonthCompletedSchedules.length / lastMonthSchedules.length) * 100 : 0;

            const completionRateChange = completionRate - lastMonthCompletionRate;

            const cancellationRate = currentMonthSchedules.length > 0 ?
                (cancelledSchedules.length / currentMonthSchedules.length) * 100 : 0;

            const lastMonthCancellationRate = lastMonthSchedules.length > 0 ?
                (lastMonthCancelledSchedules.length / lastMonthSchedules.length) * 100 : 0;

            const cancellationRateChange = cancellationRate - lastMonthCancellationRate;

            // Tính toán số bệnh nhân mới trong tháng hiện tại
            const newPatients = patients.filter(patient => {
                if (!patient.createdAt) return false;
                const createdDate = new Date(patient.createdAt);
                return createdDate.getMonth() === currentDate.getMonth() &&
                    createdDate.getFullYear() === currentDate.getFullYear();
            });

            // Tính toán số bệnh nhân mới trong tháng trước
            const lastMonthNewPatients = patients.filter(patient => {
                if (!patient.createdAt) return false;
                const createdDate = new Date(patient.createdAt);
                return createdDate.getMonth() === lastMonthDate.getMonth() &&
                    createdDate.getFullYear() === lastMonthDate.getFullYear();
            });

            // Tính toán tỷ lệ tăng trưởng bệnh nhân
            const patientGrowthRate = lastMonthNewPatients.length > 0 ?
                ((newPatients.length - lastMonthNewPatients.length) / lastMonthNewPatients.length) * 100 :
                (newPatients.length > 0 ? 100 : 0);

            // Tính toán doanh thu từ bảng payment
            // Giả định mỗi lịch hẹn hoàn thành có giá trị trung bình 350,000 VND
            const averageAppointmentCost = 350000;
            const monthlyRevenue = completedSchedules.length * averageAppointmentCost;
            const lastMonthRevenue = lastMonthCompletedSchedules.length * averageAppointmentCost;
            const revenueGrowth = lastMonthRevenue > 0 ?
                ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 :
                (monthlyRevenue > 0 ? 100 : 0);

            // Tổng hợp dữ liệu thống kê
            return {
                data: {
                    staff: {
                        totalDoctors: doctors.length,
                        totalLabTechnicians: labTechnicians.length,
                        activeStaff: doctors.filter(d => d.accountStatus === 'ACTIVE').length +
                            labTechnicians.filter(l => l.accountStatus === 'ACTIVE').length,
                        doctorUtilization: doctors.length > 0 ?
                            Math.round((schedules.filter(s => doctors.some(d => d.id === s.doctorId)).length / doctors.length) * 100) : 0,
                        labTechnicianUtilization: 75 // Giả định
                    },
                    patients: {
                        totalPatients: patients.length,
                        newPatients: newPatients.length,
                        returningPatients: patients.length - newPatients.length,
                        activePatients: patients.filter(p => p.accountStatus === 'ACTIVE').length,
                        inactivePatients: patients.filter(p => p.accountStatus !== 'ACTIVE').length,
                        growthRate: Math.round(patientGrowthRate * 10) / 10,
                        newPatientGrowth: lastMonthNewPatients.length > 0 ?
                            Math.round(((newPatients.length - lastMonthNewPatients.length) / lastMonthNewPatients.length) * 100) :
                            (newPatients.length > 0 ? 100 : 0)
                    },
                    appointments: {
                        totalAppointments: currentMonthSchedules.length,
                        completedAppointments: completedSchedules.length,
                        cancelledAppointments: cancelledSchedules.length,
                        pendingAppointments: pendingSchedules.length,
                        completionRate: Math.round(completionRate),
                        cancellationRate: Math.round(cancellationRate),
                        completionRateChange: Math.round(completionRateChange * 10) / 10,
                        cancellationRateChange: Math.round(cancellationRateChange * 10) / 10,
                        averageWaitTime: 12, // Giả định
                        appointmentGrowth: lastMonthSchedules.length > 0 ?
                            Math.round(((currentMonthSchedules.length - lastMonthSchedules.length) / lastMonthSchedules.length) * 100) :
                            (currentMonthSchedules.length > 0 ? 100 : 0)
                    },
                    treatments: {
                        ongoingTreatments: pendingSchedules.length,
                        successfulTreatments: completedSchedules.length,
                        averageTreatmentDuration: 6, // Giả định
                        successRate: completedSchedules.length > 0 && (completedSchedules.length + cancelledSchedules.length) > 0 ?
                            Math.round((completedSchedules.length / (completedSchedules.length + cancelledSchedules.length)) * 100) : 0,
                        adherenceRate: 87, // Giả định
                        successRateChange: 4.7 // Giả định
                    },
                    finances: {
                        monthlyRevenue: monthlyRevenue,
                        averageCostPerPatient: patients.length > 0 ?
                            Math.round(monthlyRevenue / patients.length) : averageAppointmentCost,
                        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                        costReduction: 3.2 // Giả định
                    }
                }
            };
        })
        .catch(error => {
            console.error('Error fetching dashboard statistics:', error);
            return { data: {} };
        });
};

// API để lấy thống kê nhân sự
const fetchStaffStatisticsAPI = (filters = {}) => {
    console.log('Fetching staff statistics with filters:', filters);

    return Promise.all([
        fetchAllDoctorsAPI(),
        fetchUsersByRoleAPI('LAB_TECHNICIAN'),
        getAllSchedulesAPI()
    ])
        .then(([doctorsRes, labTechsRes, schedulesRes]) => {
            const doctors = doctorsRes.data || [];
            const labTechnicians = labTechsRes.data || [];
            const schedules = schedulesRes.data || [];

            const currentDate = new Date();
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

            // Lọc dữ liệu theo filters nếu có
            let filteredSchedules = schedules;
            if (filters.startDate && filters.endDate) {
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                filteredSchedules = schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    return scheduleDate >= startDate && scheduleDate <= endDate;
                });
            }

            // Tính toán các chỉ số thống kê nhân sự
            const doctorSchedules = filteredSchedules.filter(schedule =>
                doctors.some(d => d.id === schedule.doctorId)
            );

            // Tính toán số lịch hẹn hoàn thành cho mỗi bác sĩ
            const doctorDetails = doctors.map(doctor => {
                const doctorAppointments = filteredSchedules.filter(s => s.doctorId === doctor.id);
                const completedAppointments = doctorAppointments.filter(s =>
                    s.status === 'Hoàn thành' || s.status === 'COMPLETED'
                );
                const cancelledAppointments = doctorAppointments.filter(s =>
                    s.status === 'Đã hủy' || s.status === 'CANCELLED'
                );

                // Tính tỷ lệ hoàn thành
                const completionRate = doctorAppointments.length > 0 ?
                    (completedAppointments.length / doctorAppointments.length) * 100 : 0;

                return {
                    id: doctor.id,
                    name: doctor.fullName || doctor.username,
                    scheduleCount: doctorAppointments.length,
                    completedSchedules: completedAppointments.length,
                    cancelledSchedules: cancelledAppointments.length,
                    completionRate: Math.round(completionRate)
                };
            });

            // Tính toán tỷ lệ sử dụng bác sĩ
            const doctorUtilization = doctors.length > 0 ?
                (doctors.filter(d => filteredSchedules.some(s => s.doctorId === d.id)).length / doctors.length) * 100 : 0;

            // Tính toán tỷ lệ sử dụng kỹ thuật viên xét nghiệm (giả định)
            const labTechnicianUtilization = 75; // Giả định vì không có dữ liệu trực tiếp

            // Tổng hợp dữ liệu thống kê nhân sự
            return {
                data: {
                    totalDoctors: doctors.length,
                    totalLabTechnicians: labTechnicians.length,
                    activeStaff: doctors.filter(d => d.accountStatus === 'ACTIVE').length +
                        labTechnicians.filter(l => l.accountStatus === 'ACTIVE').length,
                    doctorUtilization: Math.round(doctorUtilization),
                    labTechnicianUtilization: labTechnicianUtilization,
                    doctorScheduleCount: doctorSchedules.length,
                    doctorDetails: doctorDetails,
                    staffByGender: {
                        male: doctors.filter(d => d.gender === 'MALE').length +
                            labTechnicians.filter(l => l.gender === 'MALE').length,
                        female: doctors.filter(d => d.gender === 'FEMALE').length +
                            labTechnicians.filter(l => l.gender === 'FEMALE').length,
                        other: doctors.filter(d => d.gender !== 'MALE' && d.gender !== 'FEMALE').length +
                            labTechnicians.filter(l => l.gender !== 'MALE' && l.gender !== 'FEMALE').length
                    }
                }
            };
        })
        .catch(error => {
            console.error('Error fetching staff statistics:', error);
            return { data: {} };
        });
};

// API để lấy thống kê bệnh nhân
const fetchPatientStatisticsAPI = (filters = {}) => {
    console.log('Fetching patient statistics with filters:', filters);

    return Promise.all([
        fetchUsersByRoleAPI('PATIENT'),
        getAllSchedulesAPI(),
        fetchAllRegimensAPI()
    ])
        .then(([patientsRes, schedulesRes, regimensRes]) => {
            const patients = patientsRes.data || [];
            const schedules = schedulesRes.data || [];
            const regimens = regimensRes.data || [];

            const currentDate = new Date();
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

            // Lọc dữ liệu theo filters nếu có
            let filteredSchedules = schedules;
            if (filters.startDate && filters.endDate) {
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                filteredSchedules = schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    return scheduleDate >= startDate && scheduleDate <= endDate;
                });
            }

            // Tính toán số bệnh nhân mới trong tháng hiện tại
            const newPatients = patients.filter(patient => {
                if (!patient.createdAt) return false;
                const createdDate = new Date(patient.createdAt);
                return createdDate.getMonth() === currentDate.getMonth() &&
                    createdDate.getFullYear() === currentDate.getFullYear();
            });

            // Tính toán số bệnh nhân mới trong tháng trước
            const lastMonthNewPatients = patients.filter(patient => {
                if (!patient.createdAt) return false;
                const createdDate = new Date(patient.createdAt);
                return createdDate.getMonth() === lastMonthDate.getMonth() &&
                    createdDate.getFullYear() === lastMonthDate.getFullYear();
            });

            // Tính toán tỷ lệ tăng trưởng bệnh nhân mới
            const newPatientGrowthRate = lastMonthNewPatients.length > 0 ?
                ((newPatients.length - lastMonthNewPatients.length) / lastMonthNewPatients.length) * 100 :
                (newPatients.length > 0 ? 100 : 0);

            // Tính toán số bệnh nhân có lịch hẹn trong tháng hiện tại
            const activePatientIds = new Set(
                filteredSchedules
                    .filter(schedule => schedule.patientId)
                    .map(schedule => schedule.patientId)
            );

            const activePatients = patients.filter(patient =>
                patient.accountStatus === 'ACTIVE' || activePatientIds.has(patient.id)
            );

            // Phân loại bệnh nhân theo giới tính
            const malePatients = patients.filter(p => p.gender === 'MALE').length;
            const femalePatients = patients.filter(p => p.gender === 'FEMALE').length;
            const otherGenderPatients = patients.filter(p => p.gender !== 'MALE' && p.gender !== 'FEMALE').length;

            // Tổng hợp dữ liệu thống kê bệnh nhân
            return {
                data: {
                    totalPatients: patients.length,
                    newPatients: newPatients.length,
                    returningPatients: patients.length - newPatients.length,
                    activePatients: activePatients.length,
                    inactivePatients: patients.length - activePatients.length,
                    growthRate: Math.round(newPatientGrowthRate * 10) / 10,
                    newPatientGrowth: Math.round(newPatientGrowthRate * 10) / 10,
                    patientsByGender: {
                        male: malePatients,
                        female: femalePatients,
                        other: otherGenderPatients
                    },
                    patientsByStatus: {
                        active: patients.filter(p => p.accountStatus === 'ACTIVE').length,
                        inactive: patients.filter(p => p.accountStatus !== 'ACTIVE').length
                    },
                    patientAppointments: {
                        withAppointments: activePatientIds.size,
                        withoutAppointments: patients.length - activePatientIds.size
                    }
                }
            };
        })
        .catch(error => {
            console.error('Error fetching patient statistics:', error);
            return { data: {} };
        });
};

// API để lấy thống kê lịch hẹn
const fetchAppointmentStatisticsAPI = (filters = {}) => {
    console.log('Fetching appointment statistics with filters:', filters);

    return Promise.all([
        getAllSchedulesAPI(),
        fetchAllDoctorsAPI()
    ])
        .then(([schedulesRes, doctorsRes]) => {
            const schedules = schedulesRes.data || [];
            const doctors = doctorsRes.data || [];

            const currentDate = new Date();
            const lastMonthDate = new Date();
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

            // Lọc dữ liệu theo filters nếu có
            let filteredSchedules = schedules;
            if (filters.startDate && filters.endDate) {
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                filteredSchedules = schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.date);
                    return scheduleDate >= startDate && scheduleDate <= endDate;
                });
            }

            if (filters.doctorId) {
                filteredSchedules = filteredSchedules.filter(schedule =>
                    schedule.doctorId === parseInt(filters.doctorId));
            }

            // Lọc lịch hẹn theo thời gian
            const currentMonthSchedules = schedules.filter(schedule => {
                const scheduleDate = new Date(schedule.date);
                return scheduleDate.getMonth() === currentDate.getMonth() &&
                    scheduleDate.getFullYear() === currentDate.getFullYear();
            });

            const lastMonthSchedules = schedules.filter(schedule => {
                const scheduleDate = new Date(schedule.date);
                return scheduleDate.getMonth() === lastMonthDate.getMonth() &&
                    scheduleDate.getFullYear() === lastMonthDate.getFullYear();
            });

            // Phân loại lịch hẹn theo trạng thái
            const completedSchedules = currentMonthSchedules.filter(schedule =>
                schedule.status === 'Hoàn thành' || schedule.status === 'COMPLETED');

            const cancelledSchedules = currentMonthSchedules.filter(schedule =>
                schedule.status === 'Đã hủy' || schedule.status === 'CANCELLED');

            const pendingSchedules = currentMonthSchedules.filter(schedule =>
                schedule.status === 'Đang hoạt động' || schedule.status === 'ACTIVE');

            const emptySchedules = currentMonthSchedules.filter(schedule =>
                schedule.status === 'Trống' || schedule.status === 'EMPTY');

            const lastMonthCompletedSchedules = lastMonthSchedules.filter(schedule =>
                schedule.status === 'Hoàn thành' || schedule.status === 'COMPLETED');

            const lastMonthCancelledSchedules = lastMonthSchedules.filter(schedule =>
                schedule.status === 'Đã hủy' || schedule.status === 'CANCELLED');

            // Tính toán tỷ lệ và sự thay đổi
            const completionRate = currentMonthSchedules.length > 0 ?
                (completedSchedules.length / currentMonthSchedules.length) * 100 : 0;

            const lastMonthCompletionRate = lastMonthSchedules.length > 0 ?
                (lastMonthCompletedSchedules.length / lastMonthSchedules.length) * 100 : 0;

            const completionRateChange = completionRate - lastMonthCompletionRate;

            const cancellationRate = currentMonthSchedules.length > 0 ?
                (cancelledSchedules.length / currentMonthSchedules.length) * 100 : 0;

            const lastMonthCancellationRate = lastMonthSchedules.length > 0 ?
                (lastMonthCancelledSchedules.length / lastMonthSchedules.length) * 100 : 0;

            const cancellationRateChange = cancellationRate - lastMonthCancellationRate;

            // Tính toán số lịch hẹn theo loại
            const appointmentTypes = {};
            currentMonthSchedules.forEach(schedule => {
                if (schedule.type) {
                    appointmentTypes[schedule.type] = (appointmentTypes[schedule.type] || 0) + 1;
                }
            });

            // Tính toán số lịch hẹn theo bác sĩ
            const appointmentsByDoctor = {};
            doctors.forEach(doctor => {
                const doctorId = doctor.id;
                const doctorName = doctor.fullName || doctor.username;
                const doctorAppointments = currentMonthSchedules.filter(s => s.doctorId === doctorId);

                appointmentsByDoctor[doctorId] = {
                    name: doctorName,
                    total: doctorAppointments.length,
                    completed: doctorAppointments.filter(s =>
                        s.status === 'Hoàn thành' || s.status === 'COMPLETED'
                    ).length,
                    cancelled: doctorAppointments.filter(s =>
                        s.status === 'Đã hủy' || s.status === 'CANCELLED'
                    ).length,
                    pending: doctorAppointments.filter(s =>
                        s.status === 'Đang hoạt động' || s.status === 'ACTIVE'
                    ).length
                };
            });

            // Tổng hợp dữ liệu thống kê lịch hẹn
            return {
                data: {
                    totalAppointments: currentMonthSchedules.length,
                    completedAppointments: completedSchedules.length,
                    cancelledAppointments: cancelledSchedules.length,
                    pendingAppointments: pendingSchedules.length,
                    emptyAppointments: emptySchedules.length,
                    completionRate: Math.round(completionRate),
                    cancellationRate: Math.round(cancellationRate),
                    completionRateChange: Math.round(completionRateChange * 10) / 10,
                    cancellationRateChange: Math.round(cancellationRateChange * 10) / 10,
                    averageWaitTime: 12, // Giả định
                    appointmentGrowth: lastMonthSchedules.length > 0 ?
                        Math.round(((currentMonthSchedules.length - lastMonthSchedules.length) / lastMonthSchedules.length) * 100) :
                        (currentMonthSchedules.length > 0 ? 100 : 0),
                    appointmentsByStatus: {
                        completed: completedSchedules.length,
                        cancelled: cancelledSchedules.length,
                        pending: pendingSchedules.length,
                        empty: emptySchedules.length
                    },
                    appointmentsByType: appointmentTypes,
                    appointmentsByDoctor: appointmentsByDoctor,
                    appointmentTrends: {
                        currentMonth: currentMonthSchedules.length,
                        lastMonth: lastMonthSchedules.length,
                        growth: lastMonthSchedules.length > 0 ?
                            ((currentMonthSchedules.length - lastMonthSchedules.length) / lastMonthSchedules.length) * 100 : 0
                    }
                }
            };
        })
        .catch(error => {
            console.error('Error fetching appointment statistics:', error);
            return { data: {} };
        });
};

// Thêm hàm kiểm tra kết nối đến backend
const checkBackendConnection = () => {
    const URL_BACKEND = '/api/health';
    console.log('Checking backend connection...');

    return axios.get(URL_BACKEND)
        .then(response => {
            console.log('Backend connection successful:', response.data);
            return { success: true, data: response.data };
        })
        .catch(error => {
            console.error('Backend connection failed:', error);
            return { success: false, error };
        });
};

const fetchSystemConfigurationsAPI = () => {
    const URL_BACKEND = '/api/system-configuration'
    return axios.get(URL_BACKEND)
};

const updateSystemConfigurationAPI = (id, dataUpdate) =>
    axios.put(`/api/system-configuration/${id}`, dataUpdate);

const createSystemConfigurationAPI = (createData) =>
    axios.post("/api/system-configurations", createData);

const deleteSystemConfigurationAPI = (id) =>
    axios.delete(`/api/system-configuration/${id}`);

// Export tất cả các hàm API
export {
    loginAPI,
    googleLoginAPI,
    registerAPI,
    bookingAPI,
    cancelBookingAPI,
    fetchAllScheduleAPI,
    fetchScheduleByDateAPI,
    registerScheduleAPI,
    initiatePaymentAPI,
    retryPaymentAPI,
    createAccountAPI,
    handlePaymentCallbackAPI,
    fetchAllPatientScheduleAPI,
    fetchAccountByRoleAPI,
    updateAccountAPI,
    deleteAccountAPI,
    fetchDoctorProfileAPI,
    fetchScheduleAPI,
    fetchAvailableSlotAPI,
    fetchAccountAPI,
    logoutAPI,
    fetchAllDoctorsAPI,
    fetchDoctorByIdAPI,
    updateDoctorProfileAPI,
    fetchDoctorStatisticsAPI,
    fetchAllDocumentsAPI,
    fetchUsersAPI,
    fetchHealthRecordByScheduleIdAPI,
    createHealthRecordAPI,
    fetchTestResultByHealthRecordIdAPI,
    updateHealthRecordAPI,
    deleteTestResultAPI,
    createTestResultAPI,
    updateTestResultAPI,
    fetchUserInfoAPI,
    updateProfileAPI,
    fetchScheduleByDoctorIdAPI,
    fetchRegimensByDoctorIdAPI,
    fetchAllRegimensAPI,
    createRegimenAPI,
    updateRegimenAPI,
    deleteRegimenAPI,
    updateUserAPI,
    createScheduleAPI,
    getAllSchedulesAPI,
    getSchedulesByDoctorAPI,
    getSchedulesByDateAPI,
    getSchedulesByTypeAPI,
    getSchedulesByStatusAPI,
    getSchedulesByPatientAPI,
    updateScheduleAPI,
    deleteScheduleAPI,
    fetchUsersByRoleAPI,
    fetchUsersByRoleAndStatusAPI,
    fetchUsersByRoleAndVerificationAPI,
    getSchedulesWithFiltersAPI,
    fetchAllLabTechniciansAPI,
    fetchDoctorProfileByDoctorIdAPI,
    createDoctorProfileAPI,
    checkAvailableSlotsAPI,
    fetchDashboardStatisticsAPI,
    fetchStaffStatisticsAPI,
    fetchPatientStatisticsAPI,
    fetchAppointmentStatisticsAPI,
    checkBackendConnection,
    fetchSystemConfigurationsAPI,
    updateSystemConfigurationAPI,
    createSystemConfigurationAPI,
    deleteSystemConfigurationAPI
}