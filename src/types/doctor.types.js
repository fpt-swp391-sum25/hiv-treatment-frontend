// Doctor Specialties
export const DoctorSpecialty = {
    HIV_AIDS: 'HIV/AIDS',
    INFECTIOUS_DISEASES: 'INFECTIOUS_DISEASES',
    INTERNAL_MEDICINE: 'INTERNAL_MEDICINE'
};

// Doctor Status
export const DoctorStatus = {
    ACTIVE: 'ACTIVE',           // Đang hoạt động
    INACTIVE: 'INACTIVE',       // Tạm nghỉ
    ON_LEAVE: 'ON_LEAVE'       // Nghỉ phép
};

// Doctor type (JS Doc style for JS file)
/**
 * @typedef {Object} Doctor
 * @property {number} id
 * @property {string} fullName
 * @property {string} specialty
 * @property {string} email
 * @property {string} phone
 * @property {string} status
 * @property {number=} experienceYears
 * @property {string=} description
 * @property {string=} certificates
 * @property {string=} education
 * @property {string=} avatarUrl
 */
