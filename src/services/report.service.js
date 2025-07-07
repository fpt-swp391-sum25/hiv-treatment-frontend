import axios from './axios.customize';
import { STAFF_REPORT_TYPES } from '../types/report.types';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone
const TIMEZONE = 'Asia/Ho_Chi_Minh';

// Constants
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache storage
const cache = new Map();

// Helper function to handle API calls with retry
const fetchWithRetry = async (apiCall, retries = MAX_RETRIES) => {
    try {
        const response = await Promise.race([
            apiCall(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT)
            )
        ]);
        return response;
    } catch (error) {
        if (retries > 0 && error.message === 'Request timeout') {
            console.log(`Retrying... ${retries} attempts left`);
            return fetchWithRetry(apiCall, retries - 1);
        }
        throw error;
    }
};

// Helper function for caching
const withCache = async (key, fetchFn, duration = CACHE_DURATION) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < duration) {
        return cached.data;
    }
    
    const data = await fetchFn();
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
    return data;
};

// Validate date range
const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
        throw new Error('Vui lòng cung cấp khoảng thời gian');
    }
    
    const start = dayjs(startDate).tz(TIMEZONE);
    const end = dayjs(endDate).tz(TIMEZONE);
    
    if (!start.isValid() || !end.isValid()) {
        throw new Error('Định dạng ngày không hợp lệ');
    }
    
    if (end.isBefore(start)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
    }
    
    if (end.diff(start, 'days') > 365) {
        throw new Error('Khoảng thời gian không được vượt quá 1 năm');
    }
    
    return { start, end };
};

// Staff Report Services
export const getStaffData = async () => {
    const cacheKey = 'staffData';
    
    return withCache(cacheKey, async () => {
        try {
            const [doctorsResponse, labTechResponse, managersResponse] = await Promise.all([
                fetchWithRetry(() => axios.get(`/api/user/DOCTOR`)),
                fetchWithRetry(() => axios.get(`/api/user/LAB_TECHNICIAN`)),
                fetchWithRetry(() => axios.get(`/api/user/MANAGER`))
            ]);
            
            return {
                doctors: doctorsResponse.data,
                labTechnicians: labTechResponse.data,
                managers: managersResponse.data
            };
        } catch (error) {
            console.error('Error fetching staff data:', error);
            throw new Error('Không thể lấy dữ liệu nhân sự: ' + error.message);
        }
    });
};

export const getStaffStatistics = async (startDate, endDate) => {
    try {
        // Validate date range
        const { start, end } = validateDateRange(startDate, endDate);
        
        // Get staff data with caching
        const staffData = await getStaffData();
        
        // Get schedule data
        const scheduleResponse = await fetchWithRetry(() => 
            axios.get('/api/schedule/list')
        );
        
        // Filter schedules by date range
        const scheduleData = scheduleResponse.data.filter(schedule => {
            const scheduleDate = dayjs(schedule.date).tz(TIMEZONE);
            return scheduleDate.isAfter(start) && scheduleDate.isBefore(end);
        });

        // Calculate doctor statistics with optimized Promise.all
        const doctorStats = await Promise.all(
            staffData.doctors.map(async (doctor) => {
                const doctorSchedules = await fetchWithRetry(() =>
                    axios.get(`/api/schedule/doctor-id/${doctor.id}`)
                );
                
                const schedules = doctorSchedules.data.filter(schedule => {
                    const scheduleDate = dayjs(schedule.date).tz(TIMEZONE);
                    return scheduleDate.isAfter(start) && scheduleDate.isBefore(end);
                });

                const completedAppointments = schedules.filter(s => s.status === 'COMPLETED').length;
                const cancelledAppointments = schedules.filter(s => s.status === 'CANCELLED').length;
                
                return {
                    ...doctor,
                    totalAppointments: schedules.length,
                    completedAppointments,
                    cancelledAppointments,
                    completionRate: schedules.length ? (completedAppointments / schedules.length) * 100 : 0
                };
            })
        );

        // Calculate lab technician statistics
        const labTechStats = await Promise.all(
            staffData.labTechnicians.map(async (tech) => {
                const testResults = await fetchWithRetry(() =>
                    axios.get(`/api/test-result/health-record-id/${tech.id}`)
                );
                
                return {
                    ...tech,
                    totalTests: testResults.data.length,
                    completedTests: testResults.data.filter(t => t.status === 'COMPLETED').length
                };
            })
        );

        return {
            totalStaff: staffData.doctors.length + staffData.labTechnicians.length + staffData.managers.length,
            doctorStats,
            labTechStats,
            managerCount: staffData.managers.length,
            staffDistribution: {
                doctors: staffData.doctors.length,
                labTechnicians: staffData.labTechnicians.length,
                managers: staffData.managers.length
            },
            scheduleStats: {
                total: scheduleData.length,
                completed: scheduleData.filter(s => s.status === 'COMPLETED').length,
                cancelled: scheduleData.filter(s => s.status === 'CANCELLED').length,
                pending: scheduleData.filter(s => s.status === 'PENDING').length
            }
        };
    } catch (error) {
        console.error('Error in getStaffStatistics:', error);
        throw new Error('Không thể tạo báo cáo nhân sự: ' + error.message);
    }
};

export const getFinancialStatistics = async (startDate, endDate) => {
    try {
        // Validate date range
        const { start, end } = validateDateRange(startDate, endDate);
        
        // Get all payments with caching
        const cacheKey = `payments_${start.format('YYYY-MM-DD')}_${end.format('YYYY-MM-DD')}`;
        
        const allPayments = await withCache(cacheKey, async () => {
            const response = await fetchWithRetry(() => axios.get('/api/payment'));
            return response.data;
        });
        
        // Filter by date range
        const filteredPayments = allPayments.filter(payment => {
            const paymentDate = dayjs(payment.createdAt).tz(TIMEZONE);
            return paymentDate.isAfter(start) && paymentDate.isBefore(end);
        });

        // Get completed payments
        const completedPayments = await fetchWithRetry(() =>
            axios.get('/api/payment/status/COMPLETED')
        );
        
        const filteredCompletedPayments = completedPayments.data.filter(payment => {
            const paymentDate = dayjs(payment.createdAt).tz(TIMEZONE);
            return paymentDate.isAfter(start) && paymentDate.isBefore(end);
        });

        // Calculate statistics
        const statistics = {
            totalRevenue: calculateTotalRevenue(filteredCompletedPayments),
            paymentsByType: groupPaymentsByType(filteredPayments),
            paymentsByStatus: groupPaymentsByStatus(filteredPayments),
            dailyRevenue: calculateDailyRevenue(filteredCompletedPayments),
            averageTransactionValue: calculateAverageTransactionValue(filteredCompletedPayments),
            paymentTrends: {
                daily: aggregateDataByDate(filteredPayments, start, end)
            }
        };

        return statistics;
    } catch (error) {
        console.error('Error in getFinancialStatistics:', error);
        throw new Error('Không thể tạo báo cáo tài chính: ' + error.message);
    }
};

// Helper Functions
export const groupPaymentsByType = (payments) => {
    return payments.reduce((acc, payment) => {
        const type = payment.type;
        if (!acc[type]) {
            acc[type] = {
                count: 0,
                totalAmount: 0
            };
        }
        acc[type].count += 1;
        acc[type].totalAmount += payment.amount;
        return acc;
    }, {});
};

export const groupPaymentsByStatus = (payments) => {
    return payments.reduce((acc, payment) => {
        const status = payment.status;
        if (!acc[status]) {
            acc[status] = {
                count: 0,
                totalAmount: 0
            };
        }
        acc[status].count += 1;
        acc[status].totalAmount += payment.amount;
        return acc;
    }, {});
};

export const calculateDailyRevenue = (payments) => {
    return payments.reduce((acc, payment) => {
        const date = dayjs(payment.createdAt).format('YYYY-MM-DD');
        if (!acc[date]) {
            acc[date] = 0;
        }
        if (payment.status === 'COMPLETED') {
            acc[date] += payment.amount;
        }
        return acc;
    }, {});
};

export const calculateAverageTransactionValue = (payments) => {
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    if (completedPayments.length === 0) return 0;
    const total = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    return total / completedPayments.length;
};

// Helper function để tổng hợp dữ liệu theo ngày
export const aggregateDataByDate = (data, startDate, endDate) => {
    const filteredData = data.filter(item => {
        const itemDate = dayjs(item.createdAt);
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
    });

    return filteredData.reduce((acc, item) => {
        const date = dayjs(item.createdAt).format('YYYY-MM-DD');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});
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

export const getDoctorScheduleStats = async (doctorId, dateRange) => {
    try {
        const response = await axios.get(`/api/schedule/doctor-id/${doctorId}`);
        // Lọc và tổng hợp theo dateRange ở FE
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Helper function để tính hiệu suất theo thời gian
export const calculatePerformanceByDate = (schedules, startDate, endDate) => {
    const performanceByDate = {};
    const start = dayjs(startDate).tz(TIMEZONE).startOf('day');
    const end = dayjs(endDate).tz(TIMEZONE).endOf('day');
    let current = start;

    // Khởi tạo object với tất cả các ngày trong khoảng
    while (current.isBefore(end)) {
        const dateStr = current.format('YYYY-MM-DD');
        performanceByDate[dateStr] = {
            total: 0,
            completed: 0,
            cancelled: 0,
            rate: 0
        };
        current = current.add(1, 'day');
    }

    // Tính toán hiệu suất cho mỗi ngày
    schedules.forEach(schedule => {
        const scheduleDate = dayjs(schedule.date).tz(TIMEZONE).format('YYYY-MM-DD');
        if (performanceByDate[scheduleDate]) {
            performanceByDate[scheduleDate].total += 1;
            if (schedule.status === 'COMPLETED') {
                performanceByDate[scheduleDate].completed += 1;
            } else if (schedule.status === 'CANCELLED') {
                performanceByDate[scheduleDate].cancelled += 1;
            }
        }
    });

    // Tính tỷ lệ hoàn thành
    Object.keys(performanceByDate).forEach(date => {
        const { total, completed } = performanceByDate[date];
        performanceByDate[date].rate = total > 0 ? (completed / total) * 100 : 0;
    });

    return performanceByDate;
};

// Helper function để tính toán chi tiết công việc của nhân viên
export const calculateStaffWorkload = async (staffId, role, startDate, endDate) => {
    try {
        let workload = {
            totalTasks: 0,
            completedTasks: 0,
            cancelledTasks: 0,
            performanceByDate: {},
            averagePerformance: 0
        };

        if (role === 'DOCTOR') {
            const schedules = await fetchWithRetry(() =>
                axios.get(`/api/schedule/doctor-id/${staffId}`)
            );
            
            const filteredSchedules = schedules.data.filter(schedule => {
                const scheduleDate = dayjs(schedule.date).tz(TIMEZONE);
                return scheduleDate.isAfter(startDate) && scheduleDate.isBefore(endDate);
            });

            workload = {
                ...workload,
                totalTasks: filteredSchedules.length,
                completedTasks: filteredSchedules.filter(s => s.status === 'COMPLETED').length,
                cancelledTasks: filteredSchedules.filter(s => s.status === 'CANCELLED').length,
                performanceByDate: calculatePerformanceByDate(filteredSchedules, startDate, endDate)
            };
        } else if (role === 'LAB_TECHNICIAN') {
            const testResults = await fetchWithRetry(() =>
                axios.get(`/api/test-result/health-record-id/${staffId}`)
            );
            
            const filteredResults = testResults.data.filter(result => {
                const resultDate = dayjs(result.date).tz(TIMEZONE);
                return resultDate.isAfter(startDate) && resultDate.isBefore(endDate);
            });

            workload = {
                ...workload,
                totalTasks: filteredResults.length,
                completedTasks: filteredResults.filter(r => r.status === 'COMPLETED').length,
                cancelledTasks: filteredResults.filter(r => r.status === 'CANCELLED').length
            };
        }

        // Tính hiệu suất trung bình
        workload.averagePerformance = workload.totalTasks > 0 
            ? (workload.completedTasks / workload.totalTasks) * 100 
            : 0;

        return workload;
    } catch (error) {
        console.error('Error calculating staff workload:', error);
        throw new Error('Không thể tính toán khối lượng công việc: ' + error.message);
    }
}; 