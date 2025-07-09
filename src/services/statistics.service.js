import {
  getAllSchedulesAPI,
  fetchUsersByRoleAPI,
  fetchUsersByRoleAndStatusAPI,
  fetchUsersByRoleAndVerificationAPI,
  getSchedulesWithFiltersAPI,
  fetchAllDoctorsAPI,
  getSchedulesByDateAPI,
  getSchedulesByStatusAPI,
  getSchedulesByTypeAPI,
  fetchAllRegimensAPI,
  fetchHealthRecordByScheduleIdAPI
} from './api.service';
import moment from 'moment';
import {
  SCHEDULE_STATUS,
  ACCOUNT_STATUS,
  isScheduleCompleted,
  isScheduleCancelled,
  isScheduleBooked,
  isScheduleActive,
  isAccountActive
} from '../constants/status.constants';

// Hàm xử lý thống kê tổng quan
export const getDashboardStatistics = async (filters = {}) => {
  try {
    // Gọi nhiều API song song
    const [schedulesRes, doctorsRes, patientsRes, labTechsRes] = await Promise.all([
      getAllSchedulesAPI(),
      fetchUsersByRoleAPI('DOCTOR'),
      fetchUsersByRoleAPI('PATIENT'),
      fetchUsersByRoleAPI('LAB_TECHNICIAN')
    ]);

    // Lấy dữ liệu từ response
    const schedules = schedulesRes.data || [];
    const doctors = doctorsRes.data || [];
    const patients = patientsRes.data || [];
    const labTechnicians = labTechsRes.data || [];

    // Xử lý và tính toán dữ liệu thống kê tổng quan
    return processOverviewStatistics(schedules, doctors, patients, labTechnicians, filters);
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};

// Hàm xử lý thống kê nhân viên
export const getStaffStatistics = async (filters = {}) => {
  try {
    // Gọi các API liên quan đến nhân viên
    const [doctorsRes, labTechsRes, schedulesRes] = await Promise.all([
      fetchUsersByRoleAPI('DOCTOR'),
      fetchUsersByRoleAPI('LAB_TECHNICIAN'),
      getAllSchedulesAPI()
    ]);

    const doctors = doctorsRes.data || [];
    const labTechnicians = labTechsRes.data || [];
    const schedules = schedulesRes.data || [];

    // Xử lý và tính toán thống kê nhân viên
    return processStaffStatistics(doctors, labTechnicians, schedules, filters);
  } catch (error) {
    console.error('Error fetching staff statistics:', error);
    throw error;
  }
};

// Hàm xử lý thống kê bệnh nhân
export const getPatientStatistics = async (filters = {}) => {
  try {
    // Gọi các API liên quan đến bệnh nhân
    const [patientsRes, schedulesRes] = await Promise.all([
      fetchUsersByRoleAPI('PATIENT'),
      getAllSchedulesAPI()
    ]);

    const patients = patientsRes.data || [];
    const schedules = schedulesRes.data || [];

    // Xử lý và tính toán thống kê bệnh nhân
    return processPatientStatistics(patients, schedules, filters);
  } catch (error) {
    console.error('Error fetching patient statistics:', error);
    throw error;
  }
};

// Hàm fetch tất cả schedules từ nhiều endpoints
const fetchAllSchedulesFromMultipleEndpoints = async () => {
  try {
    console.log('🔍 [MULTI-ENDPOINT] Trying multiple schedule endpoints...');

    // Thử endpoint chính trước
    try {
      const mainResponse = await getAllSchedulesAPI();
      if (mainResponse.data && mainResponse.data.length > 0) {
        console.log('✅ [MULTI-ENDPOINT] Main endpoint successful:', mainResponse.data.length, 'schedules');
        return mainResponse;
      }
    } catch (error) {
      console.log('⚠️ [MULTI-ENDPOINT] Main endpoint failed, trying alternatives...');
    }

    // Thử fetch theo status
    try {
      const [bookedRes, completedRes, cancelledRes] = await Promise.all([
        getSchedulesByStatusAPI('Đã đặt'),
        getSchedulesByStatusAPI('Hoàn thành'),
        getSchedulesByStatusAPI('Hủy')
      ]);

      const allSchedules = [
        ...(bookedRes.data || []),
        ...(completedRes.data || []),
        ...(cancelledRes.data || [])
      ];

      console.log('✅ [MULTI-ENDPOINT] Status-based fetch successful:', allSchedules.length, 'schedules');
      return { data: allSchedules };
    } catch (error) {
      console.log('⚠️ [MULTI-ENDPOINT] Status-based fetch failed');
    }

    // Fallback: return empty array
    console.log('❌ [MULTI-ENDPOINT] All endpoints failed, returning empty array');
    return { data: [] };
  } catch (error) {
    console.error('❌ [MULTI-ENDPOINT] Critical error:', error);
    return { data: [] };
  }
};

// Hàm xử lý thống kê lịch hẹn
export const getAppointmentStatistics = async (filters = {}) => {
  try {
    console.log('🔍 [APPOINTMENT STATS] Starting fetch with filters:', filters);

    // Gọi các API liên quan đến lịch hẹn
    const [schedulesRes, doctorsRes] = await Promise.all([
      fetchAllSchedulesFromMultipleEndpoints(),
      fetchUsersByRoleAPI('DOCTOR')
    ]);

    console.log('📊 [APPOINTMENT STATS] Raw API responses:');
    console.log('- Schedules response:', schedulesRes);
    console.log('- Doctors response:', doctorsRes);

    const schedules = schedulesRes.data || [];
    const doctors = doctorsRes.data || [];

    console.log('📋 [APPOINTMENT STATS] Processed data:');
    console.log('- Schedules count:', schedules.length);
    console.log('- Doctors count:', doctors.length);
    console.log('- Sample schedule:', schedules[0]);

    // Xử lý và tính toán thống kê lịch hẹn
    const result = processAppointmentStatistics(schedules, doctors, filters);
    console.log('✅ [APPOINTMENT STATS] Final result:', result);

    return result;
  } catch (error) {
    console.error('❌ [APPOINTMENT STATS] Error fetching appointment statistics:', error);
    throw error;
  }
};

// Hàm xử lý thống kê điều trị
export const getTreatmentStatistics = async (filters = {}) => {
  try {
    // Gọi các API liên quan đến điều trị
    const [schedulesRes, regimensRes] = await Promise.all([
      getAllSchedulesAPI(),
      fetchAllRegimensAPI()
    ]);

    const schedules = schedulesRes.data || [];
    const regimens = regimensRes.data || [];

    // Lấy danh sách ID lịch hẹn để fetch health records
    const completedSchedules = schedules.filter(s => 
      s.status === 'COMPLETED' || s.status === 'Hoàn thành' ||
      s.status === 'completed' || s.status === 'Đã hoàn thành'
    );
    
    // Xử lý và tính toán thống kê điều trị
    return processTreatmentStatistics(completedSchedules, regimens, filters);
  } catch (error) {
    console.error('Error fetching treatment statistics:', error);
    throw error;
  }
};

// Hàm xử lý thống kê tài chính
export const getFinancialStatistics = async (filters = {}) => {
  try {
    // Gọi các API liên quan đến tài chính
    const [schedulesRes, patientsRes] = await Promise.all([
      getAllSchedulesAPI(),
      fetchUsersByRoleAPI('PATIENT')
    ]);

    const schedules = schedulesRes.data || [];
    const patients = patientsRes.data || [];

    // Xử lý và tính toán thống kê tài chính
    return processFinancialStatistics(schedules, patients, filters);
  } catch (error) {
    console.error('Error fetching financial statistics:', error);
    throw error;
  }
};

// HÀM XỬ LÝ DỮ LIỆU THỐNG KÊ

// Xử lý thống kê tổng quan
const processOverviewStatistics = (schedules, doctors, patients, labTechnicians, filters) => {
  // Xử lý filter
  const filteredSchedules = filterDataByDateRange(schedules, filters);
  
  // Tính toán các chỉ số cơ bản
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);

  // Tính toán số lượng bệnh nhân mới
  const newPatients = patients.filter(patient => {
    if (!patient.createdAt) return false;
    const createdDate = new Date(patient.createdAt);
    return createdDate.getMonth() === currentMonth &&
           createdDate.getFullYear() === currentYear;
  });

  // Tính toán lịch hẹn hôm nay
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const todayAppointments = filteredSchedules.filter(schedule => {
    return schedule.date === today;
  });

  // Tính toán số lịch hẹn theo trạng thái (sử dụng đúng status từ Backend)
  const completedSchedules = filteredSchedules.filter(schedule =>
    isScheduleCompleted(schedule.status)
  );

  const cancelledSchedules = filteredSchedules.filter(schedule =>
    isScheduleCancelled(schedule.status)
  );

  const bookedSchedules = filteredSchedules.filter(schedule =>
    isScheduleBooked(schedule.status)
  );

  // Tính toán tỷ lệ hoàn thành và hủy
  const totalSchedulesWithStatus = completedSchedules.length + cancelledSchedules.length + bookedSchedules.length;
  const completionRate = totalSchedulesWithStatus > 0 ?
    (completedSchedules.length / totalSchedulesWithStatus) * 100 : 0;
  const cancellationRate = totalSchedulesWithStatus > 0 ?
    (cancelledSchedules.length / totalSchedulesWithStatus) * 100 : 0;

  // Tạo dữ liệu xu hướng theo tháng
  const appointmentTrendByMonth = calculateMonthlyTrend(schedules);

  return {
    staff: {
      totalDoctors: doctors.length,
      totalLabTechnicians: labTechnicians.length,
      activeStaff: doctors.filter(d => isAccountActive(d.accountStatus)).length +
                   labTechnicians.filter(l => isAccountActive(l.accountStatus)).length,
    },
    patients: {
      totalPatients: patients.length,
      newPatients: newPatients.length,
      activePatients: patients.filter(p => isAccountActive(p.accountStatus)).length,
      patientGenderDistribution: calculateGenderDistribution(patients)
    },
    appointments: {
      totalSchedules: totalSchedulesWithStatus,
      todayAppointments: todayAppointments.length,
      completedSchedules: completedSchedules.length,
      cancelledSchedules: cancelledSchedules.length,
      bookedSchedules: bookedSchedules.length,
      completionRate: Math.round(completionRate * 10) / 10,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      appointmentsByStatus: {
        completed: completedSchedules.length,
        cancelled: cancelledSchedules.length,
        active: bookedSchedules.length
      },
      monthlyTrend: appointmentTrendByMonth
    }
  };
};

// Xử lý thống kê nhân viên
const processStaffStatistics = (doctors, labTechnicians, schedules, filters) => {
  // Xử lý filter
  const filteredSchedules = filterDataByDateRange(schedules, filters);

  // Tính toán số lịch hẹn cho mỗi bác sĩ
  const schedulesPerDoctor = doctors.map(doctor => {
    const doctorId = doctor.id || doctor.userId;
    const doctorSchedules = filteredSchedules.filter(s => s.doctorId == doctorId);
    const completedSchedules = doctorSchedules.filter(s =>
      isScheduleCompleted(s.status)
    );

    return {
      id: doctorId,
      name: doctor.full_name || doctor.fullName || doctor.name || doctor.username,
      totalSchedules: doctorSchedules.length,
      completedSchedules: completedSchedules.length,
      performance: doctorSchedules.length > 0 ?
        Math.round((completedSchedules.length / doctorSchedules.length) * 100) : 0
    };
  });

  // Tính toán số lịch hẹn liên quan đến kỹ thuật viên (giả định là các lịch hẹn có xét nghiệm)
  // Trong thực tế, cần có logic xác định lịch hẹn nào liên quan đến kỹ thuật viên
  const labTechnicianSchedules = filteredSchedules.filter(s => 
    s.type === 'TEST' || s.type === 'Xét nghiệm' || s.type === 'test' ||
    s.serviceType === 'TEST' || s.serviceType === 'Xét nghiệm' || s.serviceType === 'test'
  );
  
  const completedLabTechnicianSchedules = labTechnicianSchedules.filter(s =>
    isScheduleCompleted(s.status)
  );

  // Tính tổng số lịch hẹn của bác sĩ
  const doctorAppointments = filteredSchedules.filter(s => s.doctorId).length;
  const doctorCompletedAppointments = filteredSchedules.filter(s =>
    s.doctorId && isScheduleCompleted(s.status)
  ).length;

  // Sắp xếp bác sĩ theo số lịch hẹn giảm dần
  const topDoctors = [...schedulesPerDoctor].sort((a, b) => b.totalSchedules - a.totalSchedules);

  return {
    doctors: {
      total: doctors.length,
      active: doctors.filter(d => isAccountActive(d.accountStatus)).length,
      inactive: doctors.filter(d => !isAccountActive(d.accountStatus)).length,
      schedulesPerDoctor,
      topDoctors: topDoctors.slice(0, 5) // Top 5 bác sĩ
    },
    labTechnicians: {
      total: labTechnicians.length,
      active: labTechnicians.filter(l => isAccountActive(l.accountStatus)).length,
      inactive: labTechnicians.filter(l => !isAccountActive(l.accountStatus)).length,
    },
    workloadDistribution: {
      doctorAppointments: doctorAppointments,
      doctorCompletedAppointments: doctorCompletedAppointments,
      labTechnicianAppointments: labTechnicianSchedules.length,
      labTechnicianCompletedAppointments: completedLabTechnicianSchedules.length
    }
  };
};

// Xử lý thống kê bệnh nhân
const processPatientStatistics = (patients, schedules, filters) => {
  // Xử lý filter
  const filteredSchedules = filterDataByDateRange(schedules, filters);
  
  // Đã xử lý vấn đề tính toán bệnh nhân có lịch hẹn
  
  // Tính toán phân bố bệnh nhân theo độ tuổi
  const ageGroups = calculateAgeDistribution(patients);
  
  // Tính toán bệnh nhân mới
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const newPatients = patients.filter(patient => {
    if (!patient.createdAt) return false;
    const createdDate = new Date(patient.createdAt);
    return createdDate.getMonth() === currentMonth && 
           createdDate.getFullYear() === currentYear;
  });

  // Tính toán bệnh nhân có lịch hẹn
  let schedulesWithPatients = 0;
  filteredSchedules.forEach(schedule => {
    // Kiểm tra nhiều trường hợp tên cột có thể có
    const patientId = schedule.patient_id || schedule.patientId || schedule.patient || schedule.userId;
    
    // Kiểm tra nhiều trường hợp giá trị không hợp lệ
    const isValidPatientId = patientId && 
                           patientId !== 'NULL' && 
                           patientId !== null && 
                           patientId !== undefined &&
                           patientId !== 'null' &&
                           patientId !== '';
    
    // Kiểm tra trạng thái lịch hẹn (chỉ tính các lịch hẹn không phải "Trống")
    const isNotEmptySchedule = schedule.status !== 'Trống' && 
                             schedule.status !== 'AVAILABLE' &&
                             schedule.status !== 'available';
    
    if (isValidPatientId && isNotEmptySchedule) {
      // Tăng số lượng lịch hẹn đã được đặt
      schedulesWithPatients++;
    }
  });
  
  // Đồng thời vẫn giữ cách tính số bệnh nhân riêng biệt (không trùng lặp) để tham khảo
  const patientsWithAppointments = new Set();
  filteredSchedules.forEach(schedule => {
    const patientId = schedule.patient_id || schedule.patientId || schedule.patient || schedule.userId;
    const isValidPatientId = patientId && 
                           patientId !== 'NULL' && 
                           patientId !== null && 
                           patientId !== undefined &&
                           patientId !== 'null' &&
                           patientId !== '';
    const isNotEmptySchedule = schedule.status !== 'Trống' && 
                             schedule.status !== 'AVAILABLE' &&
                             schedule.status !== 'available';
    
    if (isValidPatientId && isNotEmptySchedule) {
      patientsWithAppointments.add(patientId.toString());
    }
  });

  // Tính toán xu hướng đăng ký bệnh nhân mới
  const registrationTrend = calculatePatientRegistrationTrend(patients);

  return {
    totalPatients: patients.length,
    activePatients: patients.filter(p => isAccountActive(p.accountStatus)).length,
    newPatients: newPatients.length,
    patientsWithAppointments: schedulesWithPatients,
    genderDistribution: calculateGenderDistribution(patients),
    ageGroups,
    registrationTrend
  };
};

// Xử lý thống kê lịch hẹn
const processAppointmentStatistics = (schedules, doctors, filters) => {
  console.log('🔄 [PROCESS APPOINTMENT] Starting processing...');
  console.log('- Input schedules:', schedules.length);
  console.log('- Input doctors:', doctors.length);
  console.log('- Filters:', filters);



  // Xử lý filter
  const filteredSchedules = filterDataByDateRange(schedules, filters);
  console.log('📅 [PROCESS APPOINTMENT] After date filter:', filteredSchedules.length);

  // Log sample schedule statuses
  if (filteredSchedules.length > 0) {
    console.log('📋 [PROCESS APPOINTMENT] Sample schedule statuses:');
    filteredSchedules.slice(0, 5).forEach((schedule, index) => {
      console.log(`  ${index + 1}. Status: "${schedule.status}", Date: ${schedule.date}`);
    });
  }

  // Tính toán số lịch hẹn theo trạng thái (theo Database thực tế)
  const completedSchedules = filteredSchedules.filter(schedule =>
    isScheduleCompleted(schedule.status)
  );

  const cancelledSchedules = filteredSchedules.filter(schedule =>
    isScheduleCancelled(schedule.status)
  );

  const activeSchedules = filteredSchedules.filter(schedule =>
    isScheduleActive(schedule.status)
  );

  // Removed emptySchedules logic as it's no longer needed

  // Tính tổng lịch hẹn có status (không tính trống)
  const bookedSchedules = activeSchedules; // Alias cho compatibility

  // Tính toán tỷ lệ hoàn thành và hủy (dựa trên lịch có status thực tế)
  const totalSchedulesWithStatus = completedSchedules.length + cancelledSchedules.length + activeSchedules.length;



  const completionRate = totalSchedulesWithStatus > 0 ?
    (completedSchedules.length / totalSchedulesWithStatus) * 100 : 0;
  const cancellationRate = totalSchedulesWithStatus > 0 ?
    (cancelledSchedules.length / totalSchedulesWithStatus) * 100 : 0;
  const activeRate = totalSchedulesWithStatus > 0 ?
    (activeSchedules.length / totalSchedulesWithStatus) * 100 : 0;

  // Removed appointmentsByDayOfWeek calculation as it's no longer needed
  
  // Phân bố lịch hẹn theo khung giờ
  const appointmentsByTimeSlot = calculateAppointmentsByTimeSlot(filteredSchedules);

  // Tính toán lịch hẹn theo bác sĩ
  const appointmentsByDoctor = calculateAppointmentsByDoctor(filteredSchedules, doctors);

  // Tạo dữ liệu xu hướng theo tháng
  const monthlyTrend = calculateMonthlyTrend(schedules);





  return {
    // Tổng số lịch hẹn
    totalSchedules: totalSchedulesWithStatus,
    // Breakdown theo status
    completedSchedules: completedSchedules.length,
    cancelledSchedules: cancelledSchedules.length,
    bookedSchedules: activeSchedules.length, // Đang hoạt động
    activeSchedules: activeSchedules.length,
    // Tỷ lệ
    completionRate: Math.round(completionRate * 10) / 10,
    cancellationRate: Math.round(cancellationRate * 10) / 10,
    activeRate: Math.round(activeRate * 10) / 10,
    // Chi tiết theo status
    appointmentsByStatus: {
      completed: completedSchedules.length,
      cancelled: cancelledSchedules.length,
      active: activeSchedules.length
    },
    appointmentsByTimeSlot,
    appointmentsByDoctor,
    monthlyTrend
  };
};

// Xử lý thống kê điều trị
const processTreatmentStatistics = (completedSchedules, regimens, filters) => {
  // Giả định dữ liệu vì chúng ta không có thông tin chi tiết về kết quả điều trị
  const ongoingTreatments = Math.round(completedSchedules.length * 0.3); // Giả định 30% đang điều trị
  const successfulTreatments = Math.round(completedSchedules.length * 0.6); // Giả định 60% thành công
  
  // Phân tích phác đồ điều trị (regimens)
  const regimenCounts = {};
  regimens.forEach(regimen => {
    const name = regimen.name || regimen.regimenName || "Không xác định";
    regimenCounts[name] = (regimenCounts[name] || 0) + 1;
  });
  
  // Chuyển đổi thành mảng để dễ sắp xếp
  const regimenDistribution = Object.entries(regimenCounts).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);

  return {
    totalTreatments: completedSchedules.length,
    ongoingTreatments,
    successfulTreatments,
    successRate: completedSchedules.length > 0 ? 
      Math.round((successfulTreatments / completedSchedules.length) * 100) : 0,
    adherenceRate: 87, // Giả định
    totalRegimens: regimens.length,
    regimenDistribution
  };
};

// Xử lý thống kê tài chính
const processFinancialStatistics = (schedules, patients, filters) => {
  // Xử lý filter
  const filteredSchedules = filterDataByDateRange(schedules, filters);

  // Mô phỏng dữ liệu tài chính vì không có API Payment cụ thể
  const averageAppointmentCost = 350000; // Giả định mỗi lịch hẹn hoàn thành có giá trị 350,000 VND
  
  // Tính toán lịch hẹn hoàn thành
  const completedSchedules = filteredSchedules.filter(schedule =>
    isScheduleCompleted(schedule.status)
  );
  
  // Tính doanh thu
  const totalRevenue = completedSchedules.length * averageAppointmentCost;
  
  // Tính doanh thu theo tháng
  const revenueByMonth = calculateRevenueByMonth(schedules, averageAppointmentCost);

  // Tính toán chi phí (giả định)
  const totalExpenses = totalRevenue * 0.6; // Giả định chi phí chiếm 60% doanh thu
  
  // Tính toán lợi nhuận
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    profit,
    profitMargin: Math.round(profitMargin * 10) / 10,
    averageRevenuePerPatient: patients.length > 0 ? Math.round(totalRevenue / patients.length) : 0,
    averageRevenuePerAppointment: completedSchedules.length > 0 ? 
      Math.round(totalRevenue / completedSchedules.length) : averageAppointmentCost,
    revenueByMonth
  };
};

// CÁC HÀM HELPER

// Lọc dữ liệu theo khoảng thời gian
const filterDataByDateRange = (data, filters) => {
  if (!filters.dateRange || !filters.dateRange[0] || !filters.dateRange[1]) {
    return data;
  }

  const startDate = new Date(filters.dateRange[0]);
  const endDate = new Date(filters.dateRange[1]);

  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Tính toán phân bố giới tính
const calculateGenderDistribution = (users) => {
  const maleCount = users.filter(user => 
    user.gender === 'MALE' || 
    user.gender === 'Nam' || 
    user.gender === 'male'
  ).length;
  
  const femaleCount = users.filter(user => 
    user.gender === 'FEMALE' || 
    user.gender === 'Nữ' || 
    user.gender === 'female'
  ).length;
  
  const otherCount = users.length - maleCount - femaleCount;
  
  return {
    maleCount,
    femaleCount,
    otherCount,
    malePercentage: users.length > 0 ? Math.round((maleCount / users.length) * 100) : 0,
    femalePercentage: users.length > 0 ? Math.round((femaleCount / users.length) * 100) : 0,
    otherPercentage: users.length > 0 ? Math.round((otherCount / users.length) * 100) : 0,
  };
};

// Tính toán phân bố độ tuổi
const calculateAgeDistribution = (patients) => {
  const ageGroups = {
    'under18': 0,
    '18-30': 0,
    '31-45': 0,
    '46-60': 0,
    'over60': 0
  };
  
  patients.forEach(patient => {
    if (!patient.dateOfBirth) return;
    
    const birthDate = new Date(patient.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age < 18) ageGroups['under18']++;
    else if (age <= 30) ageGroups['18-30']++;
    else if (age <= 45) ageGroups['31-45']++;
    else if (age <= 60) ageGroups['46-60']++;
    else ageGroups['over60']++;
  });
  
  return ageGroups;
};

// Removed calculateAppointmentsByDayOfWeek function as it's no longer needed

// Tính toán lịch hẹn theo khung giờ
const calculateAppointmentsByTimeSlot = (schedules) => {
  const timeSlots = {};
  
  schedules.forEach(schedule => {
    const slot = schedule.slot || '00:00:00';
    timeSlots[slot] = (timeSlots[slot] || 0) + 1;
  });
  
  // Chuyển đổi thành mảng để dễ hiển thị
  return Object.entries(timeSlots).map(([slot, count]) => ({
    slot,
    displaySlot: slot.substring(0, 5),
    count
  })).sort((a, b) => a.slot.localeCompare(b.slot));
};

// Tính toán lịch hẹn theo bác sĩ
const calculateAppointmentsByDoctor = (schedules, doctors) => {
  const doctorMap = {};
  doctors.forEach(doctor => {
    const doctorId = doctor.id || doctor.userId;
    doctorMap[doctorId] = doctor.full_name || doctor.fullName || doctor.name || doctor.username;
  });
  
  const appointmentsByDoctor = {};
  schedules.forEach(schedule => {
    const doctorId = schedule.doctorId;
    if (doctorId) {
      const doctorName = doctorMap[doctorId] || `Bác sĩ #${doctorId}`;
      appointmentsByDoctor[doctorName] = (appointmentsByDoctor[doctorName] || 0) + 1;
    }
  });
  
  // Chuyển đổi thành mảng để dễ hiển thị
  return Object.entries(appointmentsByDoctor).map(([doctorName, count]) => ({
    doctorName,
    count
  })).sort((a, b) => b.count - a.count);
};

// Tính toán xu hướng theo tháng
const calculateMonthlyTrend = (schedules) => {
  const currentYear = new Date().getFullYear();
  const monthlyData = Array(12).fill().map(() => ({
    total: 0,
    completed: 0,
    cancelled: 0,
    pending: 0
  }));
  
  schedules.forEach(schedule => {
    const date = new Date(schedule.date);
    if (date.getFullYear() !== currentYear) return;
    
    const month = date.getMonth();
    
    // Tính tất cả lịch hẹn có status hợp lệ từ Backend
    if (isScheduleCompleted(schedule.status) ||
        isScheduleCancelled(schedule.status) ||
        isScheduleBooked(schedule.status)) {

      monthlyData[month].total++;

      if (isScheduleCompleted(schedule.status)) {
        monthlyData[month].completed++;
      } else if (isScheduleCancelled(schedule.status)) {
        monthlyData[month].cancelled++;
      } else if (isScheduleBooked(schedule.status)) {
        monthlyData[month].pending++;
      }
    }
  });
  
  return monthlyData;
};

// Tính toán doanh thu theo tháng
const calculateRevenueByMonth = (schedules, averageAppointmentCost) => {
  const currentYear = new Date().getFullYear();
  const revenueByMonth = Array(12).fill(0);
  
  schedules.forEach(schedule => {
    const date = new Date(schedule.date);
    if (date.getFullYear() !== currentYear) return;
    
    if (isScheduleCompleted(schedule.status)) {
      const month = date.getMonth();
      revenueByMonth[month] += averageAppointmentCost;
    }
  });
  
  return revenueByMonth;
};

// Tính toán xu hướng đăng ký bệnh nhân mới theo thời gian
const calculatePatientRegistrationTrend = (patients) => {
  // Tạo đối tượng để lưu trữ số lượng bệnh nhân đăng ký theo tháng
  const registrationByMonth = {};
  
  // Lấy 6 tháng gần nhất
  const currentDate = new Date();
  const months = [];
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
    const monthLabel = `${month.getMonth() + 1}/${month.getFullYear()}`;
    
    months.push({
      key: monthKey,
      label: monthLabel,
      count: 0
    });
    
    registrationByMonth[monthKey] = 0;
  }
  
  // Đếm số lượng bệnh nhân đăng ký theo tháng
  patients.forEach(patient => {
    if (!patient.createdAt) return;
    
    const createdDate = new Date(patient.createdAt);
    const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}`;
    
    if (registrationByMonth[monthKey] !== undefined) {
      registrationByMonth[monthKey]++;
    }
  });
  
  // Cập nhật số lượng vào mảng kết quả
  months.forEach(month => {
    month.count = registrationByMonth[month.key];
  });
  
  return months;
}; 