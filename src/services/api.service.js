import axios from './axios.customize'








































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



// Thêm API mới để lấy users theo role

// Thêm API mới để lấy danh sách nhân viên xét nghiệm


// Lấy thông tin doctor_profile theo doctorId


// Tạo mới doctor_profile




// ✅ Advanced API functions theo BE Documentation






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










// Fetch all health records




// services/api.service.js



// Export tất cả các hàm API
export {

}