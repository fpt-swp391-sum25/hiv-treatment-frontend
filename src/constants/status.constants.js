/**
 * Status constants để đảm bảo consistency với Backend APIs
 * Dựa trên thông tin từ Backend Documentation
 */

// Schedule Status Values (theo BE Documentation chính thức)
export const SCHEDULE_STATUS = {
  BOOKED: 'Đã đặt',           // ✅ Theo BE: "Đã đặt"
  COMPLETED: 'Hoàn thành',    // ✅ Theo BE: "Hoàn thành"
  CANCELLED: 'Hủy',           // ✅ Theo BE: "Hủy"
  // Legacy support (để backward compatibility)
  ACTIVE: 'Đã đặt'           // Map to BOOKED
};

// Account Status Values (từ Backend)
export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',         // Tài khoản đang hoạt động
  INACTIVE: 'INACTIVE'      // Tài khoản không hoạt động
};

// Schedule Types (từ Backend)
export const SCHEDULE_TYPES = {
  REGULAR: 'Khám định kỳ',    // Khám định kỳ
  EMERGENCY: 'Khám cấp cứu',  // Khám cấp cứu
  FOLLOW_UP: 'Tái khám'       // Tái khám
};

// User Roles (từ Backend)
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  DOCTOR: 'DOCTOR',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  PATIENT: 'PATIENT'
};

// Mail Verification Status
export const MAIL_VERIFICATION = {
  VERIFIED: true,
  NOT_VERIFIED: false
};

// Helper functions để check status (theo Database thực tế)
export const isScheduleCompleted = (status) => status === SCHEDULE_STATUS.COMPLETED || status === 'Hoàn thành';
export const isScheduleCancelled = (status) => status === SCHEDULE_STATUS.CANCELLED || status === 'Hủy' || status === 'Đã hủy';
export const isScheduleBooked = (status) => status === 'Đang hoạt động' || status === SCHEDULE_STATUS.BOOKED || status === 'Đã đặt';
export const isScheduleActive = (status) => status === 'Đang hoạt động' || status === SCHEDULE_STATUS.BOOKED || status === 'Đã đặt';
export const isAccountActive = (status) => status === ACCOUNT_STATUS.ACTIVE;
export const isAccountInactive = (status) => status === ACCOUNT_STATUS.INACTIVE;

// Mapping functions cho backward compatibility (cập nhật theo DB)
export const mapLegacyStatus = (legacyStatus) => {
  const mapping = {
    'COMPLETED': SCHEDULE_STATUS.COMPLETED,
    'CANCELLED': SCHEDULE_STATUS.CANCELLED,
    'PENDING': SCHEDULE_STATUS.ACTIVE,
    'ACTIVE': SCHEDULE_STATUS.ACTIVE,
    'BOOKED': SCHEDULE_STATUS.ACTIVE,
    'completed': SCHEDULE_STATUS.COMPLETED,
    'cancelled': SCHEDULE_STATUS.CANCELLED,
    'pending': SCHEDULE_STATUS.ACTIVE,
    'active': SCHEDULE_STATUS.ACTIVE,
    'booked': SCHEDULE_STATUS.ACTIVE,
    // Mapping từ DB thực tế
    'Đang hoạt động': SCHEDULE_STATUS.ACTIVE,
    'Đã hủy': SCHEDULE_STATUS.CANCELLED,
    'Hoàn thành': SCHEDULE_STATUS.COMPLETED
  };

  return mapping[legacyStatus] || legacyStatus;
};

// Status colors cho UI
export const STATUS_COLORS = {
  [SCHEDULE_STATUS.COMPLETED]: '#52c41a',   // Green
  [SCHEDULE_STATUS.CANCELLED]: '#f5222d',   // Red
  [SCHEDULE_STATUS.ACTIVE]: '#faad14',      // Orange
  [ACCOUNT_STATUS.ACTIVE]: '#52c41a',       // Green
  [ACCOUNT_STATUS.INACTIVE]: '#d9d9d9'      // Gray
};

// Status labels cho display
export const STATUS_LABELS = {
  [SCHEDULE_STATUS.COMPLETED]: 'Hoàn thành',
  [SCHEDULE_STATUS.CANCELLED]: 'Đã hủy',
  [SCHEDULE_STATUS.ACTIVE]: 'Đang hoạt động',
  [ACCOUNT_STATUS.ACTIVE]: 'Hoạt động',
  [ACCOUNT_STATUS.INACTIVE]: 'Không hoạt động'
};
