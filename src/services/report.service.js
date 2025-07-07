import axios from './axios.customize';
import { STAFF_ROLES, PAYMENT_STATUS } from '../types/report.types';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(quarterOfYear);
dayjs.extend(isBetween);

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
    return payments.map(payment => ({
        'Mã giao dịch': payment.id,
        'Thời gian': dayjs().format('DD/MM/YYYY HH:mm'),
        'Phương thức': payment.account,
        'Tên dịch vụ': payment.name,
        'Mô tả': payment.description,
        'Số tiền': payment.amount?.toLocaleString('vi-VN') + ' VNĐ',
        'Trạng thái': payment.status
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
        'Số điện thoại': staff.phoneNumber,
        'Trạng thái': staff.status
    }));
};

export const groupPaymentsByType = (payments) => {
    const grouped = payments.reduce((acc, payment) => {
        const type = payment.account;
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
};

// Staff Report Services
export const getStaffStatistics = async (fromDate, toDate) => {
    try {
        // Lấy danh sách nhân viên theo role
        const [doctors, staff] = await Promise.all([
            axios.get('/api/user/DOCTOR'),
            axios.get('/api/user/STAFF')
        ]);

        // Lấy lịch làm việc trong khoảng thời gian
        const schedules = await axios.get('/api/schedule/list');
        
        // Lọc schedule theo khoảng thời gian
        const filteredSchedules = schedules.data.filter(schedule => 
            dayjs(schedule.date).isBetween(fromDate, toDate, 'day', '[]')
        );

        return {
            staffCounts: {
                doctors: doctors.data.length,
                staff: staff.data.length
            },
            scheduleStats: calculateScheduleStats(filteredSchedules),
            staffPerformance: calculateStaffPerformance(doctors.data, filteredSchedules)
        };
    } catch (error) {
        console.error('Error fetching staff statistics:', error);
        throw error;
    }
};

const calculateScheduleStats = (schedules) => {
    return {
        total: schedules.length,
        completed: schedules.filter(s => s.status === 'COMPLETED').length,
        cancelled: schedules.filter(s => s.status === 'CANCELLED').length,
        pending: schedules.filter(s => s.status === 'PENDING').length
    };
};

const calculateStaffPerformance = (doctors, schedules) => {
    return doctors.map(doctor => {
        const doctorSchedules = schedules.filter(s => s.doctorId === doctor.id);
        return {
            id: doctor.id,
            name: doctor.fullName,
            totalAppointments: doctorSchedules.length,
            completedAppointments: doctorSchedules.filter(s => s.status === 'COMPLETED').length,
            cancelledAppointments: doctorSchedules.filter(s => s.status === 'CANCELLED').length,
            performance: calculatePerformanceScore(doctorSchedules)
        };
    });
};

const calculatePerformanceScore = (schedules) => {
    if (schedules.length === 0) return 0;
    const completed = schedules.filter(s => s.status === 'COMPLETED').length;
    return (completed / schedules.length) * 100;
};

// Financial Report Services
export const getFinancialStatistics = async (fromDate, toDate) => {
    try {
        // Lấy danh sách payment đã hoàn thành
        const payments = await axios.get('/api/payment/status/COMPLETED');
        
        // Lọc payment theo khoảng thời gian
        const filteredPayments = payments.data.filter(payment => 
            dayjs(payment.createdAt).isBetween(fromDate, toDate, 'day', '[]')
        );

        return {
            overview: calculateFinancialOverview(filteredPayments),
            revenueByPeriod: calculateRevenueByPeriod(filteredPayments),
            transactionDetails: formatTransactionDetails(filteredPayments)
        };
    } catch (error) {
        console.error('Error fetching financial statistics:', error);
        throw error;
    }
};

const calculateFinancialOverview = (payments) => {
    return {
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        totalTransactions: payments.length,
        averageTransaction: payments.length > 0 
            ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length 
            : 0
    };
};

export const calculateRevenueByPeriod = (payments, periodType = 'daily') => {
    const groupedData = {};

    payments.forEach(payment => {
        const date = dayjs(payment.createdAt);
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
    return payments.map(payment => ({
        id: payment.id,
        date: dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm'),
        amount: payment.amount,
        patientId: payment.patientId,
        description: payment.description,
        status: payment.status
    }));
};

// Export helper functions for testing and reuse
export const helpers = {
    calculateScheduleStats,
    calculateStaffPerformance,
    calculateFinancialOverview,
    calculateRevenueByPeriod,
    formatTransactionDetails
}; 