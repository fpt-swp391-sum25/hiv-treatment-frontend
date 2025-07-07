// Định nghĩa kiểu dữ liệu cho Staff Report
export const STAFF_REPORT_TYPES = {
    DOCTOR: 'doctor',
    LAB_TECHNICIAN: 'lab_technician',
    MANAGER: 'manager'
};

// Định nghĩa kiểu dữ liệu cho Financial Report
export const FINANCIAL_REPORT_TYPES = {
    APPOINTMENT: 'appointment',
    TEST: 'test',
    MEDICINE: 'medicine'
};

// Định nghĩa các khoảng thời gian cho báo cáo
export const REPORT_TIME_RANGES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
    CUSTOM: 'custom'
};

// Định nghĩa trạng thái của báo cáo
export const REPORT_STATUS = {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
}; 