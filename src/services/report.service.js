import axios from './axios.customize';
import { STAFF_ROLES, PAYMENT_STATUS } from '../types/report.types';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(quarterOfYear);
dayjs.extend(isBetween);

// Hàm helper để validate response data
const validateResponse = (response) => {
    if (!response?.data?.data) throw new Error('Invalid response format');
    return response.data.data;
};

// Hàm helper để validate array
const validateArray = (data) => {
    if (!Array.isArray(data)) return [];
    return data;
};

// Helper function để lấy mảng từ response
const getArrayFromResponse = (response) => {
    if (!response || !response.data) return [];
    return Array.isArray(response.data) ? response.data : [];
};

// Helper function để lọc lịch hẹn theo khoảng thời gian
const filterSchedulesByDateRange = (schedules, fromDate, toDate) => {
    return schedules.filter(schedule => 
        schedule?.date && 
        dayjs(schedule.date).isValid() && 
        dayjs(schedule.date).isBetween(fromDate, toDate, 'day', '[]')
    );
};

// Helper function để tính toán thống kê lịch hẹn
const calculateScheduleStats = (schedules) => {
    return {
        total: schedules.length,
        completed: schedules.filter(s => s?.status === 'COMPLETED').length,
        cancelled: schedules.filter(s => s?.status === 'CANCELLED').length,
        pending: schedules.filter(s => s?.status === 'PENDING').length
    };
};

// Helper function để tính toán hiệu suất bác sĩ
const calculateDoctorPerformance = (doctor, schedules) => {
    if (!doctor?.id) return null;

    const doctorSchedules = schedules.filter(s => s?.doctorId === doctor.id);
    const total = doctorSchedules.length;
    const completed = doctorSchedules.filter(s => s?.status === 'COMPLETED').length;
    const cancelled = doctorSchedules.filter(s => s?.status === 'CANCELLED').length;

    return {
        id: doctor.id,
        name: doctor.fullName || 'Không có tên',
        totalAppointments: total,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        performance: total > 0 ? (completed / total * 100) : 0
    };
};

// Staff Statistics
export const getStaffData = async () => {
    try {
        // 1. Lấy danh sách nhân viên theo role
        const [doctorsResponse, labTechResponse, managersResponse] = await Promise.all([
            axios.get(`/api/user/DOCTOR`),
            axios.get(`/api/user/LAB_TECHNICIAN`),
            axios.get(`/api/user/MANAGER`)
        ]);

        // 2. Lấy danh sách lịch hẹn
        let scheduleData = [];
        try {
            const scheduleResponse = await axios.get('/api/schedule/list');
            scheduleData = scheduleResponse.data || [];
        } catch (scheduleError) {
            console.error('Error fetching schedule data:', scheduleError);
            scheduleData = [];
        }

        // 3. Lấy danh sách kết quả xét nghiệm theo từng health record
        let testResultData = [];
        try {
            // Lấy danh sách health records từ schedules
            const healthRecordIds = [...new Set(scheduleData.map(schedule => schedule.healthRecordId).filter(Boolean))];
            
            // Lấy test results cho từng health record
            const testResultPromises = healthRecordIds.map(healthRecordId =>
                axios.get(`/api/test-result/health-record-id/${healthRecordId}`)
                    .then(response => response.data || [])
                    .catch(error => {
                        console.error(`Error fetching test results for health record ${healthRecordId}:`, error);
                        return [];
                    })
            );

            const testResultResponses = await Promise.all(testResultPromises);
            testResultData = testResultResponses.flat();
        } catch (error) {
            console.error('Error processing test results:', error);
            testResultData = [];
        }

        // 4. Xử lý và tổng hợp dữ liệu
        const doctors = doctorsResponse.data || [];
        const labTechs = labTechResponse.data || [];
        const managers = managersResponse.data || [];

        // Tính toán thống kê cho bác sĩ
        const doctorStats = doctors.map(doctor => {
            const doctorSchedules = scheduleData.filter(s => s.doctorId === doctor.id);
            const completedSchedules = doctorSchedules.filter(s => s.status === 'COMPLETED');
            
            return {
                id: doctor.id,
                fullName: doctor.fullName || doctor.name,
                email: doctor.email,
                phoneNumber: doctor.phoneNumber,
                role: 'DOCTOR',
                status: doctor.status || 'ACTIVE',
                casesHandled: doctorSchedules.length,
                performance: calculatePerformance(doctorSchedules.length, completedSchedules.length)
            };
        });

        // Tính toán thống kê cho kỹ thuật viên
        const labTechStats = labTechs.map(tech => {
            const techTestResults = testResultData.filter(t => t.technicianId === tech.id);
            const completedTests = techTestResults.filter(t => t.status === 'COMPLETED');

            return {
                id: tech.id,
                fullName: tech.fullName || tech.name,
                email: tech.email,
                phoneNumber: tech.phoneNumber,
                role: 'LAB_TECHNICIAN',
                status: tech.status || 'ACTIVE',
                casesHandled: techTestResults.length,
                performance: calculatePerformance(techTestResults.length, completedTests.length)
            };
        });

        // Thống kê cho quản lý
        const managerStats = managers.map(manager => ({
            id: manager.id,
            fullName: manager.fullName || manager.name,
            email: manager.email,
            phoneNumber: manager.phoneNumber,
            role: 'MANAGER',
            status: manager.status || 'ACTIVE'
        }));

        // 5. Trả về kết quả với các chỉ số tổng hợp
        return {
            doctors: doctorStats,
            labTechnicians: labTechStats,
            managers: managerStats,
            totalStaff: doctors.length + labTechs.length + managers.length,
            totalAppointments: scheduleData.length,
            totalTests: testResultData.length,
            statistics: {
                completedAppointments: scheduleData.filter(s => s.status === 'COMPLETED').length,
                completedTests: testResultData.filter(t => t.status === 'COMPLETED').length,
                pendingAppointments: scheduleData.filter(s => s.status === 'PENDING').length,
                pendingTests: testResultData.filter(t => t.status === 'PENDING').length
            }
        };

    } catch (error) {
        console.error('Error in getStaffData:', error);
        // Trả về dữ liệu rỗng khi có lỗi để tránh crash ứng dụng
        return {
            doctors: [],
            labTechnicians: [],
            managers: [],
            totalStaff: 0,
            totalAppointments: 0,
            totalTests: 0,
            statistics: {
                completedAppointments: 0,
                completedTests: 0,
                pendingAppointments: 0,
                pendingTests: 0
            }
        };
    }
};

// Helper function to calculate performance percentage
const calculatePerformance = (total, completed) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
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

// Financial Statistics
export const getPaymentStats = async (status) => {
    try {
        let url = '/api/payment';
        if (status) {
            url = `/api/payment/status/${status}`;
        }
        const response = await axios.get(url);
        return response.data || [];
    } catch (error) {
        console.error('Error in getPaymentStats:', error);
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
        if (!healthRecordId) {
            throw new Error('Health record ID is required');
        }
        
        const response = await axios.get(`/api/test-results/${healthRecordId}`);
        
        if (!response.data) {
            throw new Error('No test result data received');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error fetching test results:', error.response?.data || error.message);
        throw error;
    }
};

// Helper function để tổng hợp dữ liệu theo ngày
export const aggregateDataByDate = (data, startDate, endDate) => {
    try {
        if (!Array.isArray(data) || !startDate || !endDate) {
            throw new Error('Invalid input parameters');
        }

        const start = dayjs(startDate).startOf('day');
        const end = dayjs(endDate).endOf('day');

        // Kiểm tra ngày hợp lệ
        if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
            throw new Error('Invalid date range');
        }

        // Lọc dữ liệu trong khoảng thời gian
        const filteredData = data.filter(item => {
            const itemDate = dayjs(item.createdAt || item.date);
            return itemDate.isValid() && 
                   itemDate.isSameOrAfter(start) && 
                   itemDate.isSameOrBefore(end);
        });

        // Tổng hợp dữ liệu theo ngày
        const aggregatedData = filteredData.reduce((acc, item) => {
            const dateKey = dayjs(item.createdAt || item.date).format('YYYY-MM-DD');
            
            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    count: 0,
                    totalAmount: 0,
                    items: []
                };
            }

            acc[dateKey].count += 1;
            acc[dateKey].totalAmount += Number(item.amount) || 0;
            acc[dateKey].items.push(item);

            return acc;
        }, {});

        // Chuyển đổi kết quả thành mảng và sắp xếp theo ngày
        return Object.values(aggregatedData).sort((a, b) => 
            dayjs(a.date).diff(dayjs(b.date))
        );
    } catch (error) {
        console.error('Error in aggregateDataByDate:', error);
        throw error;
    }
};

// Helper function để tính tổng doanh thu
export const calculateTotalRevenue = (payments) => {
    return payments.reduce((total, payment) => total + (Number(payment.amount) || 0), 0);
};

// Export functions
export const exportToExcel = async (data, fileName) => {
    try {
        if (!Array.isArray(data) || !fileName) {
            throw new Error('Invalid input parameters for Excel export');
        }

        // Kiểm tra dữ liệu không rỗng
        if (data.length === 0) {
            throw new Error('No data to export');
        }

        // Tạo một workbook mới
        const workbook = XLSX.utils.book_new();
        
        // Chuyển đổi dữ liệu thành worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

        // Tự động điều chỉnh độ rộng cột
        const maxWidth = Object.keys(data[0]).reduce((acc, key) => {
            const maxLength = Math.max(
                key.length,
                ...data.map(row => String(row[key] || '').length)
            );
            acc[key] = maxLength + 2; // Thêm padding
            return acc;
        }, {});

        worksheet['!cols'] = Object.values(maxWidth).map(width => ({ width }));
        
        // Định dạng header (đầu đề)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const headerRow = range.s.r; // Dòng đầu tiên
        
        // Tạo style cho header
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
            if (!worksheet[cellAddress]) continue;
            
            worksheet[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        // Tạo tên file với timestamp
        const timestamp = dayjs().format('YYYYMMDD_HHmmss');
        const fullFileName = `${fileName}_${timestamp}.xlsx`;

        // Xuất file
        XLSX.writeFile(workbook, fullFileName);

        return {
            success: true,
            fileName: fullFileName
        };
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw error;
    }
};

export const formatPaymentDataForExport = (payments) => {
    if (!Array.isArray(payments) || payments.length === 0) {
        return [];
    }
    
    return payments.map(payment => ({
        'Mã giao dịch': payment.id || 'N/A',
        'Thời gian': payment.createdAt ? dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm') : dayjs().format('DD/MM/YYYY HH:mm'),
        'Mã bệnh nhân': payment.patientId || 'N/A',
        'Phương thức': payment.account || 'Không xác định',
        'Tên dịch vụ': payment.name || 'Không xác định',
        'Mô tả': payment.description || '',
        'Số tiền': typeof payment.amount === 'number' 
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)
            : '0 VNĐ',
        'Trạng thái': payment.status || 'Không xác định'
    }));
};

export const formatStaffDataForExport = (staffData) => {
    if (!staffData || !staffData.doctors || !staffData.labTechnicians || !staffData.managers) {
        return [];
    }
    
    const doctors = Array.isArray(staffData.doctors) ? staffData.doctors : [];
    const labTechs = Array.isArray(staffData.labTechnicians) ? staffData.labTechnicians : [];
    const managers = Array.isArray(staffData.managers) ? staffData.managers : [];
    
    const allStaff = [
        ...doctors.map(doc => ({ ...doc, role: 'Bác sĩ' })),
        ...labTechs.map(tech => ({ ...tech, role: 'Kỹ thuật viên' })),
        ...managers.map(mgr => ({ ...mgr, role: 'Quản lý' }))
    ];

    return allStaff.map(staff => ({
        'Họ và tên': staff.fullName || 'Không có tên',
        'Vai trò': staff.role || 'Không xác định',
        'Email': staff.email || 'Không có email',
        'Số điện thoại': staff.phoneNumber || 'Không có SĐT',
        'Số ca xử lý': staff.casesHandled || 0,
        'Hiệu suất': staff.performance ? `${staff.performance}%` : 'N/A',
        'Trạng thái': staff.status || 'Không xác định',
        'ID': staff.id || 'N/A'
    }));
};

export const groupPaymentsByType = (payments, groupBy = 'account') => {
    if (!Array.isArray(payments)) {
        return {};
    }
    
    if (groupBy === 'day' || groupBy === 'week' || groupBy === 'month') {
        // Nhóm theo thời gian (ngày/tuần/tháng)
        const grouped = {};
        
        payments.forEach(payment => {
            if (!payment || !payment.createdAt) return;
            
            const date = dayjs(payment.createdAt);
            if (!date.isValid()) return;
            
            let key = '';
            
            switch (groupBy) {
                case 'day':
                    key = date.format('YYYY-MM-DD');
                    break;
                case 'week':
                    key = `${date.year()}-W${date.week()}`;
                    break;
                case 'month':
                    key = date.format('YYYY-MM');
                    break;
                default:
                    key = date.format('YYYY-MM-DD');
            }
            
            if (!grouped[key]) {
                grouped[key] = [];
            }
            
            grouped[key].push(payment);
        });
        
        return grouped;
    } else {
        // Nhóm theo loại giao dịch (mặc định)
        const grouped = payments.reduce((acc, payment) => {
            const type = payment.account || 'unknown';
            if (!acc[type]) {
                acc[type] = {
                    count: 0,
                    total: 0
                };
            }
            acc[type].count += 1;
            acc[type].total += Number(payment.amount) || 0;
            return acc;
        }, {});

        return Object.entries(grouped).map(([type, data]) => ({
            name: type,
            count: data.count,
            total: data.total
        }));
    }
};

// Staff Report Services
export const getStaffStatistics = async (fromDate, toDate) => {
    try {
        // Validate input
        if (!fromDate || !toDate) {
            throw new Error('Vui lòng chọn khoảng thời gian');
        }

        // Khởi tạo mảng chứa lỗi
        const errors = [];

        // 1. Lấy danh sách bác sĩ
        let doctors = [];
        try {
            const doctorsResponse = await axios.get('/api/user/DOCTOR');
            doctors = getArrayFromResponse(doctorsResponse);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            errors.push('Không thể tải danh sách bác sĩ');
        }

        // 2. Lấy danh sách nhân viên
        let staff = [];
        try {
            const staffResponse = await axios.get('/api/user/STAFF');
            staff = getArrayFromResponse(staffResponse);
        } catch (error) {
            console.error('Error fetching staff:', error);
            errors.push('Không thể tải danh sách nhân viên');
        }

        // 3. Lấy danh sách lịch hẹn
        let schedules = [];
        try {
            const schedulesResponse = await axios.get('/api/schedule/list');
            const allSchedules = getArrayFromResponse(schedulesResponse);
            schedules = filterSchedulesByDateRange(allSchedules, fromDate, toDate);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            errors.push('Không thể tải danh sách lịch hẹn');
        }

        // Nếu không có dữ liệu nào
        if (doctors.length === 0 && staff.length === 0 && schedules.length === 0) {
            throw new Error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        }

        // 4. Tính toán các thống kê
        const staffCounts = {
            doctors: doctors.length,
            staff: staff.length,
            total: doctors.length + staff.length
        };

        const scheduleStats = calculateScheduleStats(schedules);

        const staffPerformance = doctors
            .map(doctor => calculateDoctorPerformance(doctor, schedules))
            .filter(Boolean)
            .sort((a, b) => b.performance - a.performance);

        return {
            staffCounts,
            scheduleStats,
            staffPerformance,
            errors: errors.length > 0 ? errors : null
        };

    } catch (error) {
        console.error('Error in getStaffStatistics:', error);
        if (error.response) {
            // Xử lý lỗi HTTP
            switch (error.response.status) {
                case 401:
                    throw new Error('Vui lòng đăng nhập lại');
                case 403:
                    throw new Error('Bạn không có quyền truy cập');
                case 404:
                    throw new Error('Không tìm thấy dữ liệu');
                default:
                    throw new Error('Có lỗi xảy ra, vui lòng thử lại');
            }
        }
        throw error;
    }
};

// Financial Report Services
export const getFinancialStatistics = async (fromDate, toDate) => {
    try {
        const paymentsResponse = await axios.get('/api/payment/status/COMPLETED');
        const allPayments = validateArray(validateResponse(paymentsResponse));

        const payments = allPayments.filter(payment => 
            payment?.createdAt && // Kiểm tra createdAt tồn tại
            dayjs(payment.createdAt).isValid() && // Kiểm tra createdAt hợp lệ
            dayjs(payment.createdAt).isBetween(fromDate, toDate, 'day', '[]')
        );

        return {
            overview: calculateFinancialOverview(payments),
            revenueByPeriod: calculateRevenueByPeriod(payments),
            transactionDetails: formatTransactionDetails(payments)
        };
    } catch (error) {
        console.error('Error in getFinancialStatistics:', error);
        return {
            overview: { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 },
            revenueByPeriod: [],
            transactionDetails: []
        };
    }
};

const calculateFinancialOverview = (payments) => {
    if (!Array.isArray(payments)) return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0
    };

    const totalRevenue = payments.reduce((sum, p) => sum + (p?.amount || 0), 0);
    const totalTransactions = payments.length;

    return {
        totalRevenue,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    };
};

export const calculateRevenueByPeriod = (payments, periodType = 'daily') => {
    if (!Array.isArray(payments)) return [];

    const groupedData = {};

    payments.forEach(payment => {
        if (!payment?.createdAt || !payment?.amount) return;

        const date = dayjs(payment.createdAt);
        if (!date.isValid()) return;

        let period;
        switch (periodType) {
            case 'daily':
                period = date.format('YYYY-MM-DD');
                break;
            case 'weekly':
                period = `Tuần ${date.week()} - ${date.year()}`;
                break;
            case 'monthly':
                period = date.format('MM/YYYY');
                break;
            case 'quarterly':
                period = `Q${date.quarter()} ${date.year()}`;
                break;
            case 'yearly':
                period = date.format('YYYY');
                break;
            default:
                period = date.format('YYYY-MM-DD');
        }

        if (!groupedData[period]) {
            groupedData[period] = {
                period,
                revenue: 0,
                transactions: 0
            };
        }

        groupedData[period].revenue += payment.amount;
        groupedData[period].transactions += 1;
    });

    return Object.values(groupedData).sort((a, b) => 
        dayjs(a.period).isAfter(dayjs(b.period)) ? 1 : -1
    );
};

const formatTransactionDetails = (payments) => {
    if (!Array.isArray(payments)) return [];

    return payments.map(payment => {
        if (!payment) return null;

        return {
            id: payment.id || '',
            date: payment.createdAt ? dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm') : '',
            amount: payment.amount || 0,
            patientId: payment.patientId || '',
            description: payment.description || '',
            status: payment.status || ''
        };
    }).filter(Boolean); // Lọc bỏ các giá trị null
};

// Export helper functions for testing
export const helpers = {
    validateResponse,
    validateArray,
    calculateScheduleStats,
    calculateDoctorPerformance,
    calculateFinancialOverview,
    calculateRevenueByPeriod,
    formatTransactionDetails
}; 
