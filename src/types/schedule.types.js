// Schedule Status
export const ScheduleStatus = {
    PENDING: 'PENDING',         // Chờ xác nhận
    CONFIRMED: 'CONFIRMED',     // Đã xác nhận
    CANCELLED: 'CANCELLED',     // Đã hủy
    COMPLETED: 'COMPLETED',     // Đã hoàn thành
    NO_SHOW: 'NO_SHOW',         // Không đến khám
    
    // Trạng thái làm việc của bác sĩ (do Manager quản lý)
    AVAILABLE: 'available',     // Có thể đặt lịch
    UNAVAILABLE: 'unavailable'  // Không thể đặt lịch (ví dụ: nghỉ)
};

// Mapping giữa Status FE và BE
export const StatusMapping = {
    'available': 'Trống',
    'UNAVAILABLE': 'Đã hủy',
    'active': 'Đang hoạt động',
    
    'Trống': 'available',
    'Đã hủy': 'cancelled',
    'Đang hoạt động': 'active',
    'Đang chờ': 'booked',
    'Đang chờ thanh toán': 'pending_payment',
    'Đã thanh toán': 'confirmed',
    'Hoàn thành': 'completed'
};

export const SlotTimes = [
    { value: '08:00:00', label: '08:00' },
    { value: '09:00:00', label: '09:00' },
    { value: '10:00:00', label: '10:00' },
    { value: '11:00:00', label: '11:00' },
    { value: '13:00:00', label: '13:00' },
    { value: '14:00:00', label: '14:00' },
    { value: '15:00:00', label: '15:00' },
    { value: '16:00:00', label: '16:00' }
];
