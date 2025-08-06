import axios from './axios.customize';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import { 
  fetchAllRegimensAPI 
} from './regimen.service';
import { 
  getAllSchedulesAPI 
} from './schedule.service';
import { 
  fetchUsersByRoleAPI 
} from './user.service';
import { 
  fetchHealthRecordByScheduleIdAPI,
  fetchTestOrderByHealthRecordIdAPI
 } from './health-record.service';

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
    const [doctorsResponse, labTechResponse, managersResponse, cashiersResponse] = await Promise.all([
      axios.get(`/api/user/DOCTOR`),
      axios.get(`/api/user/LAB_TECHNICIAN`),
      axios.get(`/api/user/MANAGER`),
      axios.get(`/api/user/CASHIER`)
    ]);

    let scheduleData = [];
    try {
      const scheduleResponse = await axios.get('/api/schedule/list');
      scheduleData = scheduleResponse.data || [];
    } catch (scheduleError) {
      console.error('Error fetching schedule data:', scheduleError);
      scheduleData = [];
    }

    let testOrderData = [];
    try {
      const healthRecordIds = [...new Set(scheduleData.map(schedule => schedule.healthRecordId).filter(Boolean))];

      const testOrderPromises = healthRecordIds.map(healthRecordId =>
        axios.get(`/api/test-order/health-record-id/${healthRecordId}`)
          .then(response => response.data || [])
          .catch(error => {
            console.error(`Error fetching test results for health record ${healthRecordId}:`, error);
            return [];
          })
      );

      const testOrderResponses = await Promise.all(testOrderPromises);
      testOrderData = testOrderResponses.flat();
    } catch (error) {
      console.error('Error processing test results:', error);
      testOrderData = [];
    }

    const doctors = doctorsResponse.data || [];
    const labTechs = labTechResponse.data || [];
    const managers = managersResponse.data || [];
    const cashiers = cashiersResponse.data || [];

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
        performance: calculatePerformance(doctorSchedules.length, completedSchedules.length),
        created_at: doctor.created_at || doctor.createdAt
      };
    });

    const labTechStats = labTechs.map(tech => {
      const techTestOrders = testOrderData.filter(t => t.technicianId === tech.id);
      const completedTests = techTestOrders.filter(t => t.status === 'COMPLETED');

      return {
        id: tech.id,
        fullName: tech.fullName || tech.name,
        email: tech.email,
        phoneNumber: tech.phoneNumber,
        role: 'LAB_TECHNICIAN',
        status: tech.status || 'ACTIVE',
        casesHandled: techTestOrders.length,
        performance: calculatePerformance(techTestOrders.length, completedTests.length),
        created_at: tech.created_at || tech.createdAt
      };
    });

    const managerStats = managers.map(manager => ({
      id: manager.id,
      fullName: manager.fullName || manager.name,
      email: manager.email,
      phoneNumber: manager.phoneNumber,
      role: 'MANAGER',
      status: manager.status || 'ACTIVE',
      created_at: manager.created_at || manager.createdAt
    }));

    const cashierStats = cashiers.map(cashier => ({
      id: cashier.id,
      fullName: cashier.fullName || cashier.name,
      email: cashier.email,
      phoneNumber: cashier.phoneNumber,
      role: 'CASHIER',
      status: cashier.status || 'ACTIVE',
      created_at: cashier.created_at || cashier.createdAt
    }));

    return {
      doctors: doctorStats,
      labTechnicians: labTechStats,
      managers: managerStats,
      cashiers: cashierStats,
      totalStaff: doctors.length + labTechs.length + managers.length + cashiers.length,
      totalAppointments: scheduleData.length,
      totalTests: testOrderData.length,
      statistics: {
        completedAppointments: scheduleData.filter(s => s.status === 'COMPLETED').length,
        completedTests: testOrderData.filter(t => t.status === 'COMPLETED').length,
        pendingAppointments: scheduleData.filter(s => s.status === 'PENDING').length,
        pendingTests: testOrderData.filter(t => t.status === 'PENDING').length
      }
    };

  } catch (error) {
    console.error('Error in getStaffData:', error);
    return {
      doctors: [],
      labTechnicians: [],
      managers: [],
      cashiers: [],
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

export const getDoctorScheduleStats = async (doctorId) => {
    const response = await axios.get(`/api/schedule/doctor-id/${doctorId}`);
    return response.data;
};

// Financial Statistics
export const getPaymentStats = async (startDate, endDate) => {
    const res = await axios.get(`/api/payment/statistics`, {
        params: {
            startDate,
            endDate,
        },
    });
    return res.data;
};



export const getScheduleStats = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`/api/schedule?${queryParams}`);
    return response.data;
};

// Test Results Stats
export const getTestOrderStats = async (healthRecordId) => {
  try {
    if (!healthRecordId) {
      throw new Error('Health record ID is required');
    }

    const response = await axios.get(`/api/test-orders/${healthRecordId}`);

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
  if (!Array.isArray(payments)) return 0;
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

// Format dữ liệu thanh toán cho xuất Excel
export const formatPaymentDataForExport = (payments) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return [];
  }

  return payments.map(payment => ({
    'Mã giao dịch': payment.id || 'N/A',
    'Mã tham chiếu': payment.paymentRef || 'N/A',
    'Thời gian': payment.time ? dayjs(payment.time).format('DD/MM/YYYY HH:mm') : 'N/A',
    'Mô tả': payment.description || '',
    'Số tiền': typeof payment.amount === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)
      : '0 VNĐ',
    'Trạng thái': payment.status || 'Không xác định',
    'Bệnh nhân': payment.schedule?.patient?.fullName || 'N/A',
    'Số điện thoại': payment.schedule?.patient?.phoneNumber || 'N/A',
    'Bác sĩ': payment.schedule?.doctor?.fullName || 'N/A',
    'Loại lịch hẹn': payment.schedule?.type || 'N/A',
    'Phòng': payment.schedule?.roomCode || 'N/A'
  }));
};

// Nhóm thanh toán theo loại
export const groupPaymentsByType = (payments) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return [];
  }

  // Nhóm theo loại giao dịch (mặc định)
  const grouped = payments.reduce((acc, payment) => {
    // Sử dụng schedule.type từ cấu trúc mới
    const type = payment.schedule?.type || 'Không xác định';
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

export const getMedicalReportData = async (filters = {}) => {
  try {
    // 1. Lấy tất cả phác đồ điều trị - Endpoint chính xác: /api/regimen
    const regimensResponse = await fetchAllRegimensAPI();
    const regimens = regimensResponse?.data || [];

    // 2. Lấy danh sách lịch hẹn - Endpoint chính xác: /api/schedule/list
    let schedules = [];

    try {
      // Lấy tất cả lịch hẹn một lần duy nhất
      const schedulesResponse = await getAllSchedulesAPI();
      schedules = schedulesResponse?.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy lịch hẹn:', error);
      schedules = [];
    }

    // 2.1 Lấy danh sách bệnh nhân từ API
    let patients = [];
    try {
      const patientsResponse = await fetchUsersByRoleAPI('PATIENT');
      patients = patientsResponse?.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bệnh nhân:', error);
      patients = [];
    }

    // 3. Lấy health records cho tất cả lịch hẹn
    // Chỉ lấy health records cho các lịch hẹn đã được tạo
    const validScheduleIds = schedules.filter(s => s && s.id).map(s => s.id);

    // Lấy tất cả lịch hẹn
    const recentScheduleIds = validScheduleIds;

    // Sử dụng Promise.allSettled thay vì Promise.all để tránh lỗi nếu một promise bị reject
    const healthRecordsPromises = recentScheduleIds.map(scheduleId => {
      return fetchHealthRecordByScheduleIdAPI(scheduleId)
        .then(response => response?.data)
        .catch(() => null);
    });

    const healthRecordsResults = await Promise.allSettled(healthRecordsPromises);
    const healthRecords = healthRecordsResults
      .filter(result => result.status === 'fulfilled' && result.value && typeof result.value === 'object')
      .map(result => result.value);

    // 4. Lấy test results cho các health records
    const validHealthRecordIds = healthRecords.filter(hr => hr && hr.id).map(hr => hr.id);

    const testOrdersPromises = validHealthRecordIds.map(healthRecordId => {
      return fetchTestOrderByHealthRecordIdAPI(healthRecordId)
        .then(response => response?.data || [])
        .catch(() => []);
    });

    const testOrdersArrays = await Promise.allSettled(testOrdersPromises);
    const allTestOrders = testOrdersArrays
      .filter(order => order.status === 'fulfilled')
      .flatMap(order => order.value);

    // 5. Tính toán các số liệu thống kê
    // Đếm số lịch hẹn có treatmentStatus = "Đã khám"
    const completedAppointments = healthRecords
    .filter(record => record && (record.treatmentStatus || record.treatment_status))
    .filter(record => {
      const status = record.treatmentStatus || record.treatment_status;
      return status === "Đã khám";
    }).length;


    // Đếm số xét nghiệm đã thực hiện từ bảng test_result
    const testsPerformed = allTestOrders.length;

    // Tổng số phác đồ điều trị
    const totalRegimens = regimens.length;

    // 6. Tính toán số lượng bệnh nhân và ca dương/âm tính HIV
    const patientIds = new Set();
    let totalPositiveHIV = 0;
    let totalNegativeHIV = 0;

    // 6.1 Thu thập ID bệnh nhân từ health records
    healthRecords.forEach(record => {
      // Đếm số bệnh nhân duy nhất
      const patientId =
        record?.patient?.id ||
        record?.schedule?.patientId ||
        null;

      if (patientId) {
        patientIds.add(patientId);
      }

      // Đếm ca dương tính/âm tính HIV
      const hivStatus = record?.hivStatus || record?.hiv_status;
      if (hivStatus === "Dương tính" || hivStatus === "Positive") {
        totalPositiveHIV++;
      } else if (hivStatus === "Âm tính" || hivStatus === "Negative") {
        totalNegativeHIV++;
      }
    });

    // 6.2 Thu thập ID bệnh nhân từ schedules
    schedules.forEach(schedule => {
      if (schedule.patientId) {
        patientIds.add(schedule.patientId);
      } else if (schedule.patient && schedule.patient.id) {
        patientIds.add(schedule.patient.id);
      }
    });

    // 6.3 Sử dụng danh sách bệnh nhân từ API nếu patientIds vẫn trống
    const totalPatients = patientIds.size > 0 ? patientIds.size : patients.length;

    // 7. Chuẩn bị dữ liệu báo cáo
    const reports = healthRecords.map(healthRecord => {
      // Tìm lịch hẹn tương ứng
      if (!healthRecord || typeof healthRecord !== 'object') return null;
      const scheduleId = healthRecord?.scheduleId ||
        healthRecord?.schedule?.id || null;
      ;
      const schedule = schedules.find(s => s.id === scheduleId) || {};

      // Tìm các test orders tương ứng
      const testOrders = allTestOrders.filter(test =>
        test.healthRecordId === healthRecord.id ||
        test.health_record_id === healthRecord.id
      );

      return {
        schedule,
        healthRecord,
        testOrders
      };
    });

    // 8. Lọc dữ liệu theo các bộ lọc (nếu có)
    const filteredReports = filterMedicalReports(reports, filters);

    // 9. Tổng hợp thống kê về test type distribution
    const testTypeDistribution = calculateTestTypeDistributionFromTestOrders(allTestOrders);

    // 10. Tính toán xu hướng HIV theo thời gian
    const hivTrends = calculateHIVTrends(healthRecords);

    return {
      reports: filteredReports,
      statistics: {
        totalAppointments: completedAppointments, // Số lịch hẹn đã khám
        totalTestOrders: testsPerformed, // Tổng số xét nghiệm đã thực hiện
        testTypeDistribution: testTypeDistribution, // Phân bố theo loại xét nghiệm
        totalRegimens: totalRegimens, // Tổng số phác đồ điều trị
        totalPatients: totalPatients, // Tổng số bệnh nhân
        totalPositiveHIV: totalPositiveHIV, // Số ca dương tính HIV
        totalNegativeHIV: totalNegativeHIV, // Số ca âm tính HIV
        hivTrends: hivTrends // Xu hướng HIV theo thời gian
      }
    };
  } catch (error) {
    console.error('Lỗi khi tạo báo cáo y tế:', error);
    return {
      reports: [],
      statistics: {
        totalAppointments: 0,
        totalTestOrders: 0,
        testTypeDistribution: [],
        totalRegimens: 0,
        totalPatients: 0,
        totalPositiveHIV: 0,
        totalNegativeHIV: 0,
        hivTrends: []
      }
    };
  }
};

// Tính toán xu hướng HIV theo thời gian
const calculateHIVTrends = (healthRecords) => {
  // Nhóm theo tháng
  const monthlyData = {};

  healthRecords.forEach(record => {
    // Lấy thời gian từ lịch hẹn hoặc health record
    let recordDate;
    if (record.schedule && record.schedule.date) {
      recordDate = dayjs(record.schedule.date);
    } else if (record.createdAt) {
      recordDate = dayjs(record.createdAt);
    } else {
      return; // Bỏ qua nếu không có ngày
    }

    if (!recordDate.isValid()) return;

    const monthKey = recordDate.format('YYYY-MM');

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        positive: 0,
        negative: 0,
        unknown: 0,
        total: 0
      };
    }

    // Đếm theo trạng thái HIV
    const hivStatus = record.hivStatus || record.hiv_status;
    if (hivStatus === "Dương tính" || hivStatus === "Positive") {
      monthlyData[monthKey].positive++;
    } else if (hivStatus === "Âm tính" || hivStatus === "Negative") {
      monthlyData[monthKey].negative++;
    } else {
      monthlyData[monthKey].unknown++;
    }

    monthlyData[monthKey].total++;
  });

  // Chuyển đổi thành mảng và sắp xếp theo thời gian
  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

// Hàm lọc báo cáo y tế theo bộ lọc
const filterMedicalReports = (reports, filters) => {
  return reports.filter(report => {
    const { startDate, endDate, doctorId, patientId, testType } = filters;

    // Lọc theo khoảng thời gian
    if (startDate && endDate) {
      const appointmentDate = dayjs(report.schedule?.date);
      if (!appointmentDate.isBetween(startDate, endDate, 'day', '[]')) {
        return false;
      }
    }

    // Lọc theo bác sĩ
    if (doctorId && report.schedule?.doctorId !== doctorId) {
      return false;
    }

    // Lọc theo bệnh nhân
    if (patientId && report.schedule?.patientId !== patientId) {
      return false;
    }

    // Lọc theo loại xét nghiệm
    if (testType && report.testOrders) {
      const hasTestType = report.testOrders.some(test => test.type === testType);
      if (!hasTestType) {
        return false;
      }
    }

    return true;
  });
};

// Tính toán thống kê y tế
const calculateMedicalStatistics = (reports) => {
  // Số lượng lịch hẹn
  const totalAppointments = reports.length;

  // Tổng số kết quả xét nghiệm
  let totalTestOrders = 0;
  let testTypeCount = {};

  // Biến cho thống kê mới
  const uniquePatientIds = new Set();
  let totalPositiveHIV = 0;
  let totalNegativeHIV = 0;

  reports.forEach(report => {
    // Đếm số bệnh nhân duy nhất
    if (report.schedule?.patientId) {
      uniquePatientIds.add(report.schedule.patientId);
    }

    if (report.testOrders) {
      totalTestOrders += report.testOrders.length;

      // Đếm theo loại xét nghiệm
      report.testOrders.forEach(test => {
        const type = test.type || 'Không xác định';
        testTypeCount[type] = (testTypeCount[type] || 0) + 1;

        // Đếm kết quả HIV
        if (type.toLowerCase().includes('hiv') || type.toLowerCase().includes('kháng thể hiv')) {
          if (test.result && (
            test.result.toLowerCase().includes('dương tính') ||
            test.result.toLowerCase().includes('positive') ||
            test.result === '+'
          )) {
            totalPositiveHIV++;
          } else if (test.result && (
            test.result.toLowerCase().includes('âm tính') ||
            test.result.toLowerCase().includes('negative') ||
            test.result === '-'
          )) {
            totalNegativeHIV++;
          }
        }
      });
    }
  });

  // Chuyển đổi testTypeCount thành mảng để dễ sử dụng
  const testTypeDistribution = Object.entries(testTypeCount).map(([type, count]) => ({
    type,
    count,
    percentage: totalTestOrders > 0 ? Math.round((count / totalTestOrders) * 100) : 0
  }));

  return {
    totalAppointments,
    totalTestOrders,
    testTypeDistribution,
    totalPatients: uniquePatientIds.size,
    totalPositiveHIV,
    totalNegativeHIV
  };
};

// Helper function để tính phân bố theo loại xét nghiệm
const calculateTestTypeDistribution = (reports) => {
  let testTypeCount = {};
  let totalTestOrders = 0;

  reports.forEach(report => {
    if (report.testOrders && Array.isArray(report.testOrders)) {
      totalTestOrders += report.testOrders.length;

      // Đếm theo loại xét nghiệm
      report.testOrders.forEach(test => {
        const type = test.type || 'Không xác định';
        testTypeCount[type] = (testTypeCount[type] || 0) + 1;
      });
    }
  });

  // Chuyển đổi testTypeCount thành mảng để dễ sử dụng
  return Object.entries(testTypeCount).map(([type, count]) => ({
    type,
    count,
    percentage: totalTestOrders > 0 ? Math.round((count / totalTestOrders) * 100) : 0
  }));
};

// Format dữ liệu báo cáo y tế cho xuất Excel
export const formatMedicalDataForExport = (reports) => {
  const exportData = [];

  reports.forEach(report => {
    const { schedule, healthRecord, testOrders } = report;

    if (testOrders && testOrders.length > 0) {
      testOrders.forEach(test => {
        exportData.push({
          'ID Lịch hẹn': schedule?.id || '',
          'Bệnh nhân': schedule?.patientName || '',
          'Bác sĩ': schedule?.doctorName || '',
          'Ngày khám': dayjs(schedule?.date).format('DD/MM/YYYY') || '',
          'Loại xét nghiệm': test.type || '',
          'Kết quả': test.result || '',
          'Đơn vị': test.unit || '',
          'Thời gian có kết quả': test.actualResultTime ? dayjs(test.actualResultTime).format('DD/MM/YYYY HH:mm') : '',
          'Ghi chú': test.note || ''
        });
      });
    } else {
      // Trường hợp không có kết quả xét nghiệm
      exportData.push({
        'ID Lịch hẹn': schedule?.id || '',
        'Bệnh nhân': schedule?.patientName || '',
        'Bác sĩ': schedule?.doctorName || '',
        'Ngày khám': dayjs(schedule?.date).format('DD/MM/YYYY') || '',
        'Loại xét nghiệm': '',
        'Kết quả': '',
        'Đơn vị': '',
        'Thời gian có kết quả': '',
        'Ghi chú': 'Không có kết quả xét nghiệm'
      });
    }
  });

  return exportData;
};

// Hàm xuất báo cáo y tế ra Excel
export const exportMedicalReportToExcel = async (startDate, endDate) => {
  try {
    // Lấy dữ liệu báo cáo y tế
    const reportData = await getMedicalReportData({
      startDate,
      endDate
    });

    // Format dữ liệu cho Excel
    const formattedData = formatMedicalDataForExport(reportData.reports);

    // Tạo tên file với timestamp
    const timestamp = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `BaoCaoYTe_${timestamp}`;

    // Xuất file Excel
    return exportToExcel(formattedData, fileName);
  } catch (error) {
    console.error('Lỗi khi xuất báo cáo y tế ra Excel:', error);
    throw new Error('Không thể xuất báo cáo. Vui lòng thử lại sau.');
  }
};

// Helper function để tính phân bố theo loại xét nghiệm từ test results
const calculateTestTypeDistributionFromTestOrders = (testOrders) => {
  if (!Array.isArray(testOrders) || testOrders.length === 0) {
    return [];
  }

  // Đếm số lượng mỗi loại xét nghiệm
  const typeCounts = {};
  testOrders.forEach(test => {
    const type = test.type || 'Không xác định';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  // Chuyển đổi thành mảng và tính phần trăm
  const totalTests = testOrders.length;
  return Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / totalTests) * 100)
  }));
};

// Format dữ liệu nhân viên cho xuất Excel
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
