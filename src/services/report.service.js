import axios from './axios.customize';
import { STAFF_REPORT_TYPES } from '../types/report.types';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

// Staff Report Services
export const getStaffData = async () => {
    try {
        const doctorsResponse = await axios.get(`/api/user/DOCTOR`);
        const labTechResponse = await axios.get(`/api/user/LAB_TECHNICIAN`);
        const managersResponse = await axios.get(`/api/user/MANAGER`);
        
        return {
            doctors: doctorsResponse.data,
            labTechnicians: labTechResponse.data,
            managers: managersResponse.data
        };
    } catch (error) {
        throw error;
    }
};

export const getDoctorScheduleStats = async (doctorId, dateRange) => {
    try {
        const response = await axios.get(`/api/schedule/doctor-id/${doctorId}`);
        // Lọc và tổng hợp theo dateRange ở FE
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Financial Report Services
export const getPaymentStats = async (status) => {
    try {
        const response = status 
            ? await axios.get(`/api/payment/status/${status}`)
            : await axios.get('/api/payment');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getScheduleStats = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams(params).toString();
        const response = await axios.get(`/api/schedule?${queryParams}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Test Results Stats
export const getTestResultStats = async (healthRecordId) => {
    try {
        const response = await axios.get(`/api/test-result/health-record-id/${healthRecordId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Helper function để tổng hợp dữ liệu theo ngày
export const aggregateDataByDate = (data, startDate, endDate) => {
    // TODO: Implement date filtering and aggregation logic
    return data;
};

// Helper function để tính tổng doanh thu
export const calculateTotalRevenue = (payments) => {
    return payments
        .filter(payment => payment.status === 'COMPLETED')
        .reduce((total, payment) => total + payment.amount, 0);
};

// Export functions
export const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}_${dayjs().format('DDMMYYYY')}.xlsx`);
};

export const formatPaymentDataForExport = (payments) => {
    return payments.map(payment => ({
        'Mã giao dịch': payment.id,
        'Ngày': dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm'),
        'Loại': payment.type === 'APPOINTMENT' ? 'Khám bệnh' :
                payment.type === 'TEST' ? 'Xét nghiệm' : 'Thuốc',
        'Số tiền': payment.amount,
        'Trạng thái': payment.status === 'COMPLETED' ? 'Đã thanh toán' :
                      payment.status === 'PENDING' ? 'Chờ thanh toán' : 'Thất bại'
    }));
};

export const formatStaffDataForExport = (staffData) => {
    const allStaff = [
        ...staffData.doctors.map(doc => ({ ...doc, role: 'Bác sĩ' })),
        ...staffData.labTechnicians.map(tech => ({ ...tech, role: 'Kỹ thuật viên' })),
        ...staffData.managers.map(mgr => ({ ...mgr, role: 'Quản lý' }))
    ];

    return allStaff.map(staff => ({
        'Họ và tên': staff.fullName,
        'Vai trò': staff.role,
        'Email': staff.email,
        'Số điện thoại': staff.phone,
        'Trạng thái': staff.status
    }));
}; 