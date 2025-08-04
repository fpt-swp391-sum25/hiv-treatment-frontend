import axios from './axios.customize'

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

const fetchAllPatientScheduleAPI = (id) => {
    const URL_BACKEND = `/api/schedule/patient-id/${id}`
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

const fetchScheduleByDoctorIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/schedule/doctor-id/${doctorId}`
    return axios.get(URL_BACKEND)
}

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

    // Xác định số lượng bệnh nhân tối đa
    const maxPatients = Math.min(Math.max(parseInt(scheduleData.maxPatients) || 1, 1), 5);
    console.log(`🔢 [API] Creating schedule with maxPatients = ${maxPatients}`);

    // Đảm bảo scheduleData có định dạng đúng theo yêu cầu của BE
    const baseFormattedData = {
        type: null, // Manager tạo lịch trống với type=null
        roomCode: scheduleData.roomCode || '100', // Mặc định phòng 100 nếu không có
        date: scheduleData.date, // Giữ nguyên định dạng YYYY-MM-DD
        slot: scheduleData.slot, // Định dạng HH:mm:ss
        doctorId: parseInt(scheduleData.doctorId), // Đảm bảo là số
        status: 'Trống', // Đặt trạng thái là "Trống" theo yêu cầu của BE
        patient_id: null // Thêm patient_id: null để phù hợp với schema DB
    };

    // Loại bỏ các trường không cần thiết và kiểm tra giá trị
    if (!baseFormattedData.date || !baseFormattedData.slot || !baseFormattedData.doctorId) {
        console.error('❌ [API] Missing required fields for schedule creation:', baseFormattedData);
        return Promise.reject(new Error('Thiếu thông tin cần thiết để tạo lịch'));
    }

    console.log('📝 [API] Base formatted data:', baseFormattedData);

    // Thêm một số giá trị để debug
    console.log('🔍 [API] Debug values:', {
        'doctorId type': typeof baseFormattedData.doctorId,
        'doctorId value': baseFormattedData.doctorId,
        'slot format': baseFormattedData.slot.match(/^\d{2}:\d{2}:\d{2}$/) ? 'valid' : 'invalid',
        'date format': baseFormattedData.date.match(/^\d{4}-\d{2}-\d{2}$/) ? 'valid' : 'invalid',
        'patient_id': baseFormattedData.patient_id === null ? 'explicitly null' : baseFormattedData.patient_id,
        'maxPatients': maxPatients
    });

    // Tạo mảng promises để lưu các lời hứa tạo lịch
    const createPromises = [];

    // Tạo nhiều lịch theo số lượng maxPatients
    for (let i = 0; i < maxPatients; i++) {
        console.log(`🔄 [API] Creating schedule ${i + 1}/${maxPatients}`);
        const promise = axios.post(URL_BACKEND, baseFormattedData)
            .then(response => {
                console.log(`✅ [API] Created schedule ${i + 1}/${maxPatients}:`, response.data);
                return response;
            })
            .catch(error => {
                console.error(`❌ [API] Failed to create schedule ${i + 1}/${maxPatients}:`, error);
                if (error.response) {
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                }
                return Promise.reject(error);
            });

        createPromises.push(promise);
    }

    // Trả về promise tổng hợp từ tất cả các lời hứa
    return Promise.all(createPromises)
        .then(responses => {
            console.log(`✅ [API] Successfully created ${responses.length} schedules`);
            // Trả về response đầu tiên để tương thích với code hiện tại
            return responses[0];
        })
        .catch(error => {
            console.error('❌ [API] Create schedule failed:', error);
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

const deleteScheduleAPI = (scheduleId) => {
    const URL_BACKEND = `/api/schedule/${scheduleId}`;
    return axios.delete(URL_BACKEND);
}

// API mới để kiểm tra các slot khả dụng của bác sĩ trong ngày
const checkAvailableSlotsAPI = (doctorId, date) => {
    const URL_BACKEND = `/api/schedule/available-slots?doctorId=${doctorId}&date=${date}`;
    console.log(`Checking available slots for doctor ${doctorId} on date ${date}`);
    return axios.get(URL_BACKEND);
};

// Thêm hàm kiểm tra kết nối đến backend
const checkBackendConnection = () => {
    // Thay đổi endpoint từ /api/health sang /api/schedule/list
    const URL_BACKEND = '/api/schedule/list';
    console.log('Checking backend connection...');

    return axios.get(URL_BACKEND, { timeout: 5000 }) // Thêm timeout 5 giây
        .then(response => {
            console.log('Backend connection successful');
            return { success: true, data: response.data };
        })
        .catch(error => {
            console.error('Backend connection failed:', error);
            // Trả về success=true để không chặn quá trình chính của người dùng
            // Đánh dấu là fallback để UI có thể hiển thị thông báo phù hợp
            return { success: true, error, fallback: true };
        });
};

// Hàm để lấy số lượng bệnh nhân trong mỗi slot
const getSlotCountsAPI = (doctorId, date) => {
    const URL_BACKEND = `/api/schedule/slot-counts?doctorId=${doctorId}&date=${date}`;
    console.log(`🔍 [API] Fetching slot counts for doctor ${doctorId} on date ${date}`);

    return axios.get(URL_BACKEND)
        .then(response => {
            console.log('✅ [API] Slot counts response:', response);
            return response;
        })
        .catch(error => {
            console.error('❌ [API] Error fetching slot counts:', error);
            // Nếu API không tồn tại, tạo một cách thủ công từ danh sách lịch
            console.log('🔄 [API] Trying to calculate slot counts from schedules...');

            // Lấy tất cả lịch của bác sĩ trong ngày
            return getSchedulesByDoctorAPI(doctorId)
                .then(response => {
                    const schedules = response.data || [];
                    // Lọc theo ngày
                    const filteredSchedules = schedules.filter(s => s.date === date);

                    // Nhóm theo slot và đếm
                    const slotCounts = {};
                    filteredSchedules.forEach(schedule => {
                        const slot = schedule.slot;
                        if (!slotCounts[slot]) {
                            slotCounts[slot] = { total: 0, booked: 0 };
                        }
                        slotCounts[slot].total++;
                        if (schedule.patient_id || schedule.patient) {
                            slotCounts[slot].booked++;
                        }
                    });

                    console.log('✅ [API] Calculated slot counts:', slotCounts);
                    return { data: slotCounts };
                })
                .catch(fallbackError => {
                    console.error('❌ [API] Fallback calculation also failed:', fallbackError);
                    return { data: {} };
                });
        });
};

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

const searchSchedulesByNameAPI = (name) => {
  return axios.get('/api/schedule/search', {
    params: { name },
  })
}
  
const bulkUpdateScheduleByDoctorAndDateAPI = async (doctorId, date, updatedFields) => {
    return axios.put(`/api/schedule/bulk-update`, {
        doctorId,
        date,
        ...updatedFields
    });
};

const bulkDeleteSchedulesByDoctorAndDateAPI = async (doctorId, date) => {
    return axios.delete(`/api/schedule/bulk-delete`, {
        params: {
            doctorId,
            date
        }
    });
};

const updateScheduleStatusAPI = (scheduleId, newStatus) => {
    const URL_BACKEND = `/api/schedule/${scheduleId}/status`;
    const requestBody = { status: newStatus };
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    
    return axios.put(URL_BACKEND, requestBody, config);
};

export const getPatientsByScheduleAPI = async (scheduleId) => {
    try {
                                                                                                                                                                                                                                                                                                                                                                                                    const                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        response = await axios.get(`/api/schedule/${scheduleId}/patients`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patients by schedule:', error);
        throw error;
    }
};

export const getSchedulesByDoctorDateAndSlotAPI = async (doctorId, date, slot) => {
    try {
        const response = await axios.get('/api/schedule', {
            params: {                                                                                                                           
                doctorId,
                date,
                slot
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching schedules:', error);
        throw error;
    }
};

export {
    fetchAllPatientScheduleAPI,
    fetchAllScheduleAPI,
    fetchAvailableSlotAPI,
    fetchScheduleAPI,
    fetchScheduleByDateAPI,
    fetchScheduleByDoctorIdAPI,
    getAllSchedulesAPI,
    getSchedulesByDateAPI,
    getSchedulesByDoctorAPI,
    getSchedulesByPatientAPI,
    getSchedulesByStatusAPI,
    registerScheduleAPI,
    createScheduleAPI,
    getSchedulesByTypeAPI,
    checkAvailableSlotsAPI,
    deleteScheduleAPI,
    getSlotCountsAPI,
    checkBackendConnection,
    updateScheduleAPI,
    searchSchedulesByNameAPI,
    bulkUpdateScheduleByDoctorAndDateAPI,
    bulkDeleteSchedulesByDoctorAndDateAPI,
    updateScheduleStatusAPI,
}