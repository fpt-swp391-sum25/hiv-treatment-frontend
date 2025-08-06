
import moment from 'moment';
import {
  SCHEDULE_STATUS,
  ACCOUNT_STATUS,
  isScheduleCompleted,
  isScheduleCancelled,
  isScheduleBooked,
  isScheduleActive,
  isScheduleWaiting,
  isScheduleAbsent,
  isScheduleConsultation,
  isAccountActive
} from '../constants/status.constants';
import { fetchUsersByRoleAPI } from './user.service';
import { getAllSchedulesAPI } from './schedule.service';

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

// Hàm fetch tất cả schedules từ nhiều endpoints
const fetchAllSchedulesFromMultipleEndpoints = async () => {
  try {

    // Thử endpoint chính trước
    try {
      const mainResponse = await getAllSchedulesAPI();
      if (mainResponse.data && mainResponse.data.length > 0) {
        return mainResponse;
      }
    } catch (error) {
      console.error(error);
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

      return { data: allSchedules };
    } catch (error) {
      console.error(error)
    }

    // Fallback: return empty array
    return { data: [] };
  } catch (error) {
    console.error('❌ [MULTI-ENDPOINT] Critical error:', error);
    return { data: [] };
  }
};

// Hàm xử lý thống kê lịch hẹn
export const getAppointmentStatistics = async (filters = {}) => {
  try {
    // Gọi các API liên quan đến lịch hẹn
    const [schedulesRes, doctorsRes] = await Promise.all([
      fetchAllSchedulesFromMultipleEndpoints(),
      fetchUsersByRoleAPI('DOCTOR')
    ]);
    const schedules = schedulesRes.data || [];
    const doctors = doctorsRes.data || [];
    // Xử lý và tính toán thống kê lịch hẹn
    const result = processAppointmentStatistics(schedules, doctors, filters);
    return result;
  } catch (error) {
    console.error('❌ [APPOINTMENT STATS] Error fetching appointment statistics:', error);
    throw error;
  }
};

// HÀM XỬ LÝ DỮ LIỆU THỐNG KÊ

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

    // Sử dụng helper functions để lọc trạng thái
    const waitingSchedules = doctorSchedules.filter(s => isScheduleWaiting(s.status));
    const absentSchedules = doctorSchedules.filter(s => isScheduleAbsent(s.status));
    const consultationSchedules = doctorSchedules.filter(s => isScheduleConsultation(s.status));

    return {
      id: doctorId,
      name: doctor.full_name || doctor.fullName || doctor.name || doctor.username,
      totalSchedules: doctorSchedules.length,
      completedSchedules: completedSchedules.length,
      waitingSchedules: waitingSchedules.length,
      absentSchedules: absentSchedules.length,
      consultationSchedules: consultationSchedules.length,
      performance: doctorSchedules.length > 0 ?
        Math.round((completedSchedules.length / doctorSchedules.length) * 100) : 0
    };
  });

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
    }
  };
};

// Xử lý thống kê lịch hẹn
const processAppointmentStatistics = (schedules, doctors, filters) => {
  // Xử lý filter
  const filteredSchedules = filterDataByDateRange(schedules, filters);
  // Log sample schedule statuses
  if (filteredSchedules.length > 0) {
    filteredSchedules.slice(0, 5).forEach((schedule, index) => {
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

export const fetchStaffStatisticsAPI = (filters = {}) => {
  return Promise.all([
    fetchAllDoctorsAPI(),
    fetchUsersByRoleAPI('LAB_TECHNICIAN'),
    getAllSchedulesAPI()
  ])
    .then(([doctorsRes, labTechsRes, schedulesRes]) => {
      const doctors = doctorsRes.data || [];
      const labTechnicians = labTechsRes.data || [];
      const schedules = schedulesRes.data || [];

      const currentDate = new Date();
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      // Lọc dữ liệu theo filters nếu có
      let filteredSchedules = schedules;
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        filteredSchedules = schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          return scheduleDate >= startDate && scheduleDate <= endDate;
        });
      }

      // Tính toán các chỉ số thống kê nhân sự
      const doctorSchedules = filteredSchedules.filter(schedule =>
        doctors.some(d => d.id === schedule.doctorId)
      );

      // Tính toán số lịch hẹn hoàn thành cho mỗi bác sĩ
      const doctorDetails = doctors.map(doctor => {
        const doctorAppointments = filteredSchedules.filter(s => s.doctorId === doctor.id);
        const completedAppointments = doctorAppointments.filter(s =>
          s.status === 'Hoàn thành' || s.status === 'COMPLETED'
        );
        const cancelledAppointments = doctorAppointments.filter(s =>
          s.status === 'Đã hủy' || s.status === 'CANCELLED'
        );

        // Tính tỷ lệ hoàn thành
        const completionRate = doctorAppointments.length > 0 ?
          (completedAppointments.length / doctorAppointments.length) * 100 : 0;

        return {
          id: doctor.id,
          name: doctor.fullName || doctor.username,
          scheduleCount: doctorAppointments.length,
          completedSchedules: completedAppointments.length,
          cancelledSchedules: cancelledAppointments.length,
          completionRate: Math.round(completionRate)
        };
      });

      // Tính toán tỷ lệ sử dụng bác sĩ
      const doctorUtilization = doctors.length > 0 ?
        (doctors.filter(d => filteredSchedules.some(s => s.doctorId === d.id)).length / doctors.length) * 100 : 0;

      // Tính toán tỷ lệ sử dụng kỹ thuật viên xét nghiệm (giả định)
      const labTechnicianUtilization = 75; // Giả định vì không có dữ liệu trực tiếp

      // Tổng hợp dữ liệu thống kê nhân sự
      return {
        data: {
          totalDoctors: doctors.length,
          totalLabTechnicians: labTechnicians.length,
          activeStaff: doctors.filter(d => d.accountStatus === 'ACTIVE').length +
            labTechnicians.filter(l => l.accountStatus === 'ACTIVE').length,
          doctorUtilization: Math.round(doctorUtilization),
          labTechnicianUtilization: labTechnicianUtilization,
          doctorScheduleCount: doctorSchedules.length,
          doctorDetails: doctorDetails,
          staffByGender: {
            male: doctors.filter(d => d.gender === 'MALE').length +
              labTechnicians.filter(l => l.gender === 'MALE').length,
            female: doctors.filter(d => d.gender === 'FEMALE').length +
              labTechnicians.filter(l => l.gender === 'FEMALE').length,
            other: doctors.filter(d => d.gender !== 'MALE' && d.gender !== 'FEMALE').length +
              labTechnicians.filter(l => l.gender !== 'MALE' && l.gender !== 'FEMALE').length
          }
        }
      };
    })
    .catch(error => {
      console.error('Error fetching staff statistics:', error);
      return { data: {} };
    });
};

export const fetchAppointmentStatisticsAPI = (filters = {}) => {

  return Promise.all([
    getAllSchedulesAPI(),
    fetchAllDoctorsAPI()
  ])
    .then(([schedulesRes, doctorsRes]) => {
      const schedules = schedulesRes.data || [];
      const doctors = doctorsRes.data || [];

      const currentDate = new Date();
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      // Lọc dữ liệu theo filters nếu có
      let filteredSchedules = schedules;
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        filteredSchedules = schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          return scheduleDate >= startDate && scheduleDate <= endDate;
        });
      }

      if (filters.doctorId) {
        filteredSchedules = filteredSchedules.filter(schedule =>
          schedule.doctorId === parseInt(filters.doctorId));
      }

      // Lọc lịch hẹn theo thời gian
      const currentMonthSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate.getMonth() === currentDate.getMonth() &&
          scheduleDate.getFullYear() === currentDate.getFullYear();
      });

      const lastMonthSchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate.getMonth() === lastMonthDate.getMonth() &&
          scheduleDate.getFullYear() === lastMonthDate.getFullYear();
      });

      // Phân loại lịch hẹn theo trạng thái
      const completedSchedules = currentMonthSchedules.filter(schedule =>
        schedule.status === 'Hoàn thành' || schedule.status === 'COMPLETED');

      const cancelledSchedules = currentMonthSchedules.filter(schedule =>
        schedule.status === 'Đã hủy' || schedule.status === 'CANCELLED');

      const pendingSchedules = currentMonthSchedules.filter(schedule =>
        schedule.status === 'Đang hoạt động' || schedule.status === 'ACTIVE');

      const emptySchedules = currentMonthSchedules.filter(schedule =>
        schedule.status === 'Trống' || schedule.status === 'EMPTY');

      const lastMonthCompletedSchedules = lastMonthSchedules.filter(schedule =>
        schedule.status === 'Hoàn thành' || schedule.status === 'COMPLETED');

      const lastMonthCancelledSchedules = lastMonthSchedules.filter(schedule =>
        schedule.status === 'Đã hủy' || schedule.status === 'CANCELLED');

      // Tính toán tỷ lệ và sự thay đổi
      const completionRate = currentMonthSchedules.length > 0 ?
        (completedSchedules.length / currentMonthSchedules.length) * 100 : 0;

      const lastMonthCompletionRate = lastMonthSchedules.length > 0 ?
        (lastMonthCompletedSchedules.length / lastMonthSchedules.length) * 100 : 0;

      const completionRateChange = completionRate - lastMonthCompletionRate;

      const cancellationRate = currentMonthSchedules.length > 0 ?
        (cancelledSchedules.length / currentMonthSchedules.length) * 100 : 0;

      const lastMonthCancellationRate = lastMonthSchedules.length > 0 ?
        (lastMonthCancelledSchedules.length / lastMonthSchedules.length) * 100 : 0;

      const cancellationRateChange = cancellationRate - lastMonthCancellationRate;

      // Tính toán số lịch hẹn theo loại
      const appointmentTypes = {};
      currentMonthSchedules.forEach(schedule => {
        if (schedule.type) {
          appointmentTypes[schedule.type] = (appointmentTypes[schedule.type] || 0) + 1;
        }
      });

      // Tính toán số lịch hẹn theo bác sĩ
      const appointmentsByDoctor = {};
      doctors.forEach(doctor => {
        const doctorId = doctor.id;
        const doctorName = doctor.fullName || doctor.username;
        const doctorAppointments = currentMonthSchedules.filter(s => s.doctorId === doctorId);

        appointmentsByDoctor[doctorId] = {
          name: doctorName,
          total: doctorAppointments.length,
          completed: doctorAppointments.filter(s =>
            s.status === 'Hoàn thành' || s.status === 'COMPLETED'
          ).length,
          cancelled: doctorAppointments.filter(s =>
            s.status === 'Đã hủy' || s.status === 'CANCELLED'
          ).length,
          pending: doctorAppointments.filter(s =>
            s.status === 'Đang hoạt động' || s.status === 'ACTIVE'
          ).length
        };
      });

      // Tổng hợp dữ liệu thống kê lịch hẹn
      return {
        data: {
          totalAppointments: currentMonthSchedules.length,
          completedAppointments: completedSchedules.length,
          cancelledAppointments: cancelledSchedules.length,
          pendingAppointments: pendingSchedules.length,
          emptyAppointments: emptySchedules.length,
          completionRate: Math.round(completionRate),
          cancellationRate: Math.round(cancellationRate),
          completionRateChange: Math.round(completionRateChange * 10) / 10,
          cancellationRateChange: Math.round(cancellationRateChange * 10) / 10,
          averageWaitTime: 12, // Giả định
          appointmentGrowth: lastMonthSchedules.length > 0 ?
            Math.round(((currentMonthSchedules.length - lastMonthSchedules.length) / lastMonthSchedules.length) * 100) :
            (currentMonthSchedules.length > 0 ? 100 : 0),
          appointmentsByStatus: {
            completed: completedSchedules.length,
            cancelled: cancelledSchedules.length,
            pending: pendingSchedules.length,
            empty: emptySchedules.length
          },
          appointmentsByType: appointmentTypes,
          appointmentsByDoctor: appointmentsByDoctor,
          appointmentTrends: {
            currentMonth: currentMonthSchedules.length,
            lastMonth: lastMonthSchedules.length,
            growth: lastMonthSchedules.length > 0 ?
              ((currentMonthSchedules.length - lastMonthSchedules.length) / lastMonthSchedules.length) * 100 : 0
          }
        }
      };
    })
    .catch(error => {
      console.error('Error fetching appointment statistics:', error);
      return { data: {} };
    });
};
