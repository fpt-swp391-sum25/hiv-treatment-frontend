// Định nghĩa kiểu dữ liệu cho Staff Report
export const STAFF_REPORT_TYPES = {
    OVERVIEW: 'OVERVIEW',
    PERFORMANCE: 'PERFORMANCE',
    DISTRIBUTION: 'DISTRIBUTION'
};

// Định nghĩa kiểu dữ liệu cho Financial Report
export const FINANCIAL_REPORT_TYPES = {
    REVENUE: 'REVENUE',
    TRANSACTIONS: 'TRANSACTIONS',
    SERVICES: 'SERVICES'
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

// Payment Status
export const PAYMENT_STATUS = {
    COMPLETED: 'Đã thanh toán',
    PENDING: 'Chờ thanh toán',
    FAILED: 'Thất bại'
};

// Payment Account Types
export const PAYMENT_ACCOUNT = {
    COUNTER: 'Thanh toán tại quầy',
    ONLINE: 'Thanh toán online',
    INSURANCE: 'Bảo hiểm y tế'
};

// Staff Roles
export const STAFF_ROLES = {
    DOCTOR: 'DOCTOR',
    LAB_TECHNICIAN: 'LAB_TECHNICIAN',
    MANAGER: 'MANAGER'
};

// Report Export Types
export const EXPORT_TYPES = {
    PDF: 'PDF',
    EXCEL: 'EXCEL'
};

// Chart Types
export const CHART_TYPES = {
    BAR: 'BAR',
    LINE: 'LINE',
    PIE: 'PIE',
    AREA: 'AREA'
};

// Payment Type
export const PAYMENT_TYPE = {
    APPOINTMENT: 'APPOINTMENT',
    TEST: 'TEST',
    MEDICINE: 'MEDICINE'
};

// Medical Report Types
export const MEDICAL_REPORT_TYPES = {
    OVERVIEW: 'OVERVIEW',
    TEST_RESULTS: 'TEST_RESULTS',
    PATIENT_HISTORY: 'PATIENT_HISTORY'
};

// Test Result Status
export const TEST_RESULT_STATUS = {
    COMPLETED: 'Đã có kết quả',
    PENDING: 'Chờ kết quả',
    CANCELLED: 'Đã hủy'
};

// Test Types (Các loại xét nghiệm phổ biến)
export const TEST_TYPES = {
    HIV_ANTIBODY: 'Kháng thể HIV',
    CD4_COUNT: 'Đếm tế bào CD4',
    VIRAL_LOAD: 'Tải lượng virus',
    LIVER_FUNCTION: 'Chức năng gan',
    KIDNEY_FUNCTION: 'Chức năng thận',
    BLOOD_COUNT: 'Công thức máu',
    BIOCHEMISTRY: 'Sinh hóa máu',
    OTHER: 'Khác'
}; 