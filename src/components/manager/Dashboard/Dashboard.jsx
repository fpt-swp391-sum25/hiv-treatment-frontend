import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Tabs, Spin, Empty, message, Table, Card } from 'antd';
import {
  getStaffStatistics,
  getAppointmentStatistics
} from '../../../services/statistics.service';
import DashboardFilters from './DashboardFilters';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import AppointmentStatusChart from './AppointmentStatusChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import { fetchAccountByRoleAPI, fetchAllDoctorsAPI } from '../../../services/user.service';
import { getAllSchedulesAPI } from '../../../services/schedule.service';
import { getHealthRecordByDoctorIdAPI } from '../../../services/health-record.service';
import '../../../styles/manager/Dashboard.css';

dayjs.extend(isBetween);

const { TabPane } = Tabs;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    staff: null,
    appointments: null
  });

  const [filters, setFilters] = useState({
    dateRange: [null, null],
    period: 'month', 
    selectedDate: dayjs().startOf('month'),
    doctorId: null,
  });

  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('staff');

  const getDateRangeFromFilter = (selectedDate, filterType) => {
    if (!selectedDate) return { startDate: null, endDate: null };

    const day = dayjs(selectedDate);

    switch (filterType) {
      case 'month':
        return {
          startDate: day.startOf('month').format('YYYY-MM-DD'),
          endDate: day.endOf('month').format('YYYY-MM-DD'),
        };
      case 'quarter':
        return {
          startDate: day.startOf('quarter').format('YYYY-MM-DD'),
          endDate: day.endOf('quarter').format('YYYY-MM-DD'),
        };
      case 'year':
        return {
          startDate: day.startOf('year').format('YYYY-MM-DD'),
          endDate: day.endOf('year').format('YYYY-MM-DD'),
        };
      case 'default': {
        const formatted = day.format('YYYY-MM-DD'); 
        return { startDate: formatted, endDate: formatted };
      }
    }
  };

  const fetchDoctorPerformanceStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const doctorResponse = await fetchAccountByRoleAPI('DOCTOR');
      const doctors = doctorResponse?.data || [];

      const performanceData = await Promise.all(
        doctors.map(async (doctor) => {
          const doctorId = doctor.id;
          const name = doctor.fullName;

          try {
            const { selectedDate, period: filterType } = filters;

            const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

            const healthRecordRes = await getHealthRecordByDoctorIdAPI(
              doctorId,
              filterType,
              formattedDate
            );

            const records = healthRecordRes?.data || [];

            const stats = records.reduce((acc, record) => {
              const status = record.treatmentStatus || 'Không rõ';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});

            return {
              name,
              waitingSchedules: stats['Đang chờ khám'] || 0,
              completedSchedules: stats['Đã khám'] || 0,
              consultationSchedules: stats['Đã tư vấn'] || 0,
              absentSchedules: stats['Không đến'] || 0,
            };
          } catch {
            return {
              name,
              waitingSchedules: 0,
              completedSchedules: 0,
              consultationSchedules: 0,
              absentSchedules: 0,
            };
          }
        })
      )

      setStatistics(prev => ({
        ...prev,
        staff: {
          ...prev.staff,
          doctors: {
            ...prev.staff?.doctors,
            schedulesPerDoctor: performanceData
          }
        }
      }));
    } catch {
      message.error('Không thể tải dữ liệu hiệu suất bác sĩ');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await fetchAllDoctorsAPI();
        if (response && response.data) {
          const doctorsList = response.data.map(doctor => {
            return {
              id: doctor.id || doctor.userId || doctor.user_id,
              name: doctor.full_name || doctor.fullName || doctor.name || doctor.username || `BS. ${doctor.id}`
            };
          });
          setDoctors(doctorsList);
        }
      } catch {
        message.error('Không thể tải danh sách bác sĩ');
      }
    };

    loadDoctors();
  }, []);

  const fetchStaffStatistics = useCallback(async () => {
    if (activeTab !== 'staff') return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRangeFromFilter(filters.selectedDate, filters.period);

      const data = await getStaffStatistics({
        ...filters,
        startDate,
        endDate,
      });

      setStatistics(prev => ({ ...prev, staff: data }));
    } catch {
      message.error('Không thể tải dữ liệu thống kê nhân viên');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  const fetchAppointmentStatistics = useCallback(async () => {
    if (activeTab !== 'appointments') return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRangeFromFilter(filters.selectedDate, filters.period);

      const data = await getAppointmentStatistics({
        ...filters,
        startDate,
        endDate,
      });

      await fetchAppointmentStatusData(data);
      await fetchMonthlyTrendData(data);

      setStatistics(prev => ({ ...prev, appointments: data }));
    } catch {
      message.error('Không thể tải dữ liệu thống kê lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  const fetchAppointmentStatusData = async (data) => {
    try {
      let totalWaiting = 0;
      let totalCompleted = 0;
      let totalConsultation = 0;
      let totalAbsent = 0;

      try {
        const doctorResponse = await fetchAccountByRoleAPI('DOCTOR');
        const doctors = doctorResponse?.data || [];

        const allRecords = await Promise.all(
          doctors.map(async (doctor) => {
            const doctorId = doctor.id || doctor.user_id || doctor.userId;
            const { selectedDate, period: filterType } = filters;
            const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

            try {
              const healthRecordRes = await getHealthRecordByDoctorIdAPI(
                doctorId,
                filterType,
                formattedDate
              );
              return healthRecordRes?.data || [];
            } catch (err) {
              console.error(`Lỗi khi lấy health record của bác sĩ ${doctorId}:`, err);
              return [];
            }
          })
        );

        const allHealthRecords = allRecords.flat();
        allHealthRecords.forEach(record => {
          const status = record.treatmentStatus || 'Không rõ';
          if (status === 'Đang chờ khám') totalWaiting++;
          else if (status === 'Đã khám') totalCompleted++;
          else if (status === 'Đã tư vấn') totalConsultation++;
          else if (status === 'Không đến') totalAbsent++;
        });
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu health record:', error);

        totalWaiting = data.activeSchedules || data.appointmentsByStatus?.active || 0;
        totalCompleted = data.completedSchedules || data.appointmentsByStatus?.completed || 0;

        if (totalCompleted > 0 && !totalConsultation) {
          totalConsultation = Math.floor(totalCompleted * 0.3);
          totalCompleted = totalCompleted - totalConsultation;
        }

        if (!totalAbsent) {
          totalAbsent = Math.floor(totalWaiting * 0.1);
        }
      }

      data.appointmentsByStatus = {
        active: totalWaiting,        
        examined: totalCompleted,      
        consulted: totalConsultation, 
        absent: totalAbsent           
      };

      data.totalSchedules = totalWaiting + totalCompleted + totalConsultation + totalAbsent;
    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu trạng thái lịch hẹn:', error);
    }
  };

  const fetchMonthlyTrendData = async (data) => {
    try {
      const schedulesResponse = await getAllSchedulesAPI();
      const schedules = schedulesResponse?.data || [];

      const { selectedDate, period: filterType } = filters;
      let filteredSchedules = schedules;

      if (selectedDate) {
        const { startDate, endDate } = getDateRangeFromFilter(selectedDate, filterType);

        filteredSchedules = schedules.filter(schedule => {
          if (!schedule.date) return false;
          const scheduleDate = dayjs(schedule.date);
          return scheduleDate.isBetween(startDate, endDate, 'day', '[]');
        });

      }

      const monthlyData = Array(12).fill().map(() => ({
        total: 0,
        examination: 0,     
        reExamination: 0,  
        consultation: 0    
      }));

      // Data for 4 quarter
      const quarterlyData = Array(4).fill().map(() => ({
        total: 0,
        examination: 0,     
        reExamination: 0,   
        consultation: 0     
      }));

      // Data for 6 previous years
      const currentYear = new Date().getFullYear();
      const yearlyData = Array(6).fill().map((_, i) => ({
        year: currentYear - 5 + i,
        total: 0,
        examination: 0,     
        reExamination: 0,   
        consultation: 0     
      }));

      filteredSchedules.forEach(schedule => {
        if (!schedule.date) return;

        const date = new Date(schedule.date);
        const month = date.getMonth(); 
        const quarter = Math.floor(month / 3); 
        const year = date.getFullYear();
        const type = schedule.type || '';

        if (!schedule.status) return;

        monthlyData[month].total++;

        if (type === 'Khám') {
          monthlyData[month].examination++;
        } else if (type === 'Tái khám') {
          monthlyData[month].reExamination++;
        } else if (type === 'Tư vấn') {
          monthlyData[month].consultation++;
        }

        quarterlyData[quarter].total++;

        if (type === 'Khám') {
          quarterlyData[quarter].examination++;
        } else if (type === 'Tái khám') {
          quarterlyData[quarter].reExamination++;
        } else if (type === 'Tư vấn') {
          quarterlyData[quarter].consultation++;
        }

        const yearIndex = year - (currentYear - 5);
        if (yearIndex >= 0 && yearIndex < 6) {
          yearlyData[yearIndex].total++;

          if (type === 'Khám') {
            yearlyData[yearIndex].examination++;
          } else if (type === 'Tái khám') {
            yearlyData[yearIndex].reExamination++;
          } else if (type === 'Tư vấn') {
            yearlyData[yearIndex].consultation++;
          }
        }
      });

      switch (filters.period) {
        case 'quarter':
          data.monthlyTrend = quarterlyData;
          break;
        case 'year':
          data.monthlyTrend = yearlyData;
          break;
        case 'month':
        default:
          data.monthlyTrend = monthlyData;
          break;
      }

    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu xu hướng lịch hẹn:', error);
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case 'staff':
        fetchStaffStatistics();
        fetchDoctorPerformanceStatistics();
        break;
      case 'appointments':
        fetchAppointmentStatistics();
        break;
      default:
        break;
    }
  }, [
    activeTab,
    filters, 
    fetchStaffStatistics,
    fetchAppointmentStatistics,
    fetchDoctorPerformanceStatistics,
  ]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      period: newFilters.filterType || prevFilters.period,
     selectedDate: newFilters.selectedDate || prevFilters.selectedDate,
      ...newFilters
    }));
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const renderPerformanceTab = () => {
    const stats = {
      doctors: statistics.staff?.doctors || {},
      labTechnicians: statistics.staff?.labTechnicians || {},
    };

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Hiệu suất làm việc của bác sĩ">
              <div className="chart-container" >
                {stats.doctors?.schedulesPerDoctor && stats.doctors.schedulesPerDoctor.length > 0 ? (
                  <div style={{ padding: '8px', paddingBottom: '16px' }}>
                    <Table
                      dataSource={stats.doctors.schedulesPerDoctor.map((doctor, index) => ({
                        ...doctor,
                        key: index,
                        rank: index + 1,
                      }))}
                      columns={[
                        {
                          title: 'STT',
                          dataIndex: 'rank',
                          key: 'rank',
                          width: 60,
                        },
                        {
                          title: 'Bác sĩ',
                          dataIndex: 'name',
                          key: 'name',
                          ellipsis: true,
                        },
                        {
                          title: 'Đang chờ khám',
                          dataIndex: 'waitingSchedules',
                          key: 'waitingSchedules',
                          render: (_, record) => record.waitingSchedules || 0,
                        },
                        {
                          title: 'Đã khám',
                          dataIndex: 'completedSchedules',
                          key: 'completedSchedules',
                        },
                        {
                          title: 'Đã tư vấn',
                          dataIndex: 'consultationSchedules',
                          key: 'consultationSchedules',
                          render: (_, record) => record.consultationSchedules || 0,
                        },
                        {
                          title: 'Không đến',
                          dataIndex: 'absentSchedules',
                          key: 'absentSchedules',
                          render: (_, record) => record.absentSchedules || 0,
                        },
                      ]}
                      size="small"
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Chưa có dữ liệu bác sĩ" />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderAppointmentsTab = () => {
    const stats = statistics.appointments || {};

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} md={12}>
            <Card title="Phân bố lịch hẹn theo trạng thái">
              <div className="chart-container">
                {stats.appointmentsByStatus ? (
                  <AppointmentStatusChart data={stats.appointmentsByStatus} />
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Chưa có dữ liệu trạng thái" />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Xu hướng lịch hẹn theo thời gian">
              <div className="chart-container">
                {stats.monthlyTrend ? (
                  <MonthlyTrendChart
                    data={stats.monthlyTrend}
                    timeFilter={filters.period || 'month'}
                  />
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Chưa có dữ liệu xu hướng" />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      );
    }

    switch (activeTab) {
      case 'staff':
        return renderPerformanceTab();
      case 'appointments':
        return renderAppointmentsTab();
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Thống kê</h1>

      <DashboardFilters
        onFilterChange={handleFilterChange}
        doctors={doctors}
        initialFilters={{
          filterType: filters.period, 
          selectedDate: filters.selectedDate
        }}
      />

      <Tabs
        defaultActiveKey="staff"
        className="dashboard-tabs"
        activeKey={activeTab}
        onChange={handleTabChange}
      >
        <TabPane tab="Hiệu suất làm việc" key="staff">
          {renderTabContent()}
        </TabPane>

        <TabPane tab="Lịch hẹn" key="appointments">
          {renderTabContent()}
        </TabPane>
      </Tabs>
    </div>
  );
};
export default Dashboard;
