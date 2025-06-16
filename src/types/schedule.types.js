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
    NO_SHOW: 'NO_SHOW'         // Không đến khám
};

// Doctor Status
export const DoctorStatus = {
    AVAILABLE: 'AVAILABLE',       // Đang làm việc
    ON_LEAVE: 'ON_LEAVE',        // Nghỉ phép
    IN_MEETING: 'IN_MEETING',    // Đang họp
    UNAVAILABLE: 'UNAVAILABLE'   // Không làm việc
};

// Slot Times
export const SlotTimes = {
    MORNING_1: 'MORNING_1',     // 8:00 - 9:00
    MORNING_2: 'MORNING_2',     // 9:00 - 10:00
    MORNING_3: 'MORNING_3',     // 10:00 - 11:00
    AFTERNOON_1: 'AFTERNOON_1', // 13:00 - 14:00
    AFTERNOON_2: 'AFTERNOON_2', // 14:00 - 15:00
    AFTERNOON_3: 'AFTERNOON_3'  // 15:00 - 16:00
};
