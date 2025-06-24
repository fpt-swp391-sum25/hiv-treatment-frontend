// Schedule Types
export const ScheduleType = {
    EXAMINATION: 'EXAMINATION',     // Khám thông thường
    EMERGENCY: 'EMERGENCY',         // Khám khẩn cấp
    FOLLOW_UP: 'FOLLOW_UP',        // Tái khám
    CONSULTATION: 'CONSULTATION'    // Tư vấn
};

// Schedule Status
export const ScheduleStatus = {
    PENDING: 'PENDING',         // Chờ xác nhận
    CONFIRMED: 'CONFIRMED',     // Đã xác nhận
    CANCELLED: 'CANCELLED',     // Đã hủy
    COMPLETED: 'COMPLETED',     // Đã hoàn thành
    NO_SHOW: 'NO_SHOW',         // Không đến khám
    
    // Trạng thái làm việc của bác sĩ
    AVAILABLE: 'available',     // Làm việc
    ON_LEAVE: 'on_leave',       // Nghỉ phép
    UNAVAILABLE: 'UNAVAILABLE'  // Không làm việc
};

// Time slots for schedule
export const SlotTimes = {
    MORNING: {
        label: 'Buổi sáng',
        startTime: '08:00',
        endTime: '11:00'
    },
    AFTERNOON: {
        label: 'Buổi chiều',
        startTime: '13:00',
        endTime: '16:00'
    }
};
