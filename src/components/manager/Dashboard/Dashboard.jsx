import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Tabs, Spin, Empty, message, Table, Card } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import axios from '../../../services/axios.customize';
import {
  fetchStaffStatisticsAPI,
  fetchAppointmentStatisticsAPI,
  fetchAllDoctorsAPI,
  fetchAccountByRoleAPI,
  getHealthRecordByDoctorIdAPI
} from '../../../services/api.service';
import {
  getStaffStatistics,
  getAppointmentStatistics
} from '../../../services/statistics.service';
import { getMedicalReportData } from '../../../services/report.service';
import { SCHEDULE_STATUS, STATUS_LABELS } from '../../../constants/status.constants';
import './Dashboard.css';
import KPICard from './KPICard';
import DashboardFilters from './DashboardFilters';
import dayjs from 'dayjs';

// Import các biểu đồ cần thiết
import AppointmentStatusChart from './AppointmentStatusChart';
import MonthlyTrendChart from './MonthlyTrendChart';

const { TabPane } = Tabs;

/**
 * Dashboard chính cho Manager
 * Hiển thị thống kê về nhân viên và lịch hẹn
 */
const Dashboard = () => {
  // State để lưu trữ dữ liệu thống kê
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    staff: null,
    appointments: null
  });
  
  // State cho dữ liệu báo cáo y tế
  const [medicalStats, setMedicalStats] = useState({
    totalAppointments: 0,
    totalTestResults: 0
  });
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    period: 'month', // 'day', 'week', 'month', 'year'
    selectedDate: null,
    doctorId: null,
  });

  // State cho danh sách bác sĩ
  const [doctors, setDoctors] = useState([]);
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('staff');

  const convertSelectedDate = (date, filterType) => {
    if (!date) return null;

    switch (filterType) {
      case 'year':
        return dayjs(date).startOf('year').format('YYYY-MM-DD');
      case 'quarter':
        return dayjs(date).startOf('quarter').format('YYYY-MM-DD');
      case 'month':
      default:
        return dayjs(date).startOf('month').format('YYYY-MM-DD');
    }
  };

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
      case 'day':
      default:
        const formatted = day.format('YYYY-MM-DD');
        return { startDate: formatted, endDate: formatted };
    }
  };

  const fetchDoctorPerformanceStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const doctorResponse = await fetchAccountByRoleAPI('DOCTOR');
      const doctors = doctorResponse?.data || [];

      const performanceData = await Promise.all(
        doctors.map(async (doctor) => {
          const doctorId = doctor.id || doctor.user_id || doctor.userId;
          const name = doctor.full_name || doctor.fullName || doctor.name || `BS. ${doctorId}`;

          try {
            const { selectedDate, period: filterType } = filters;

            const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

            const healthRecordRes = await getHealthRecordByDoctorIdAPI(
              doctorId,
              filterType,
              formattedDate
            );


            const records = healthRecordRes?.data || [];

            // Group records by treatmentStatus
            const stats = records.reduce((acc, record) => {
              const status = record.treatmentStatus || 'Không rõ';
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});

            return {
              name,
              waitingSchedules: stats['Đang chờ khám'] || 0,
              completedSchedules: stats['Đã khám'] || 0,
              consultationSchedules: stats['Tư vấn'] || 0,
              absentSchedules: stats['Không đến'] || 0,
            };
          } catch (err) {
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

      // Lưu vào statistics.staff.doctors.schedulesPerDoctor
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
    } catch (err) {
      message.error('Không thể tải dữ liệu hiệu suất bác sĩ');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch danh sách bác sĩ
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await fetchAllDoctorsAPI();
        
        if (response && response.data) {
          // Chuẩn hóa dữ liệu bác sĩ
          const doctorsList = response.data.map(doctor => {
            return {
              id: doctor.id || doctor.userId || doctor.user_id,
              name: doctor.full_name || doctor.fullName || doctor.name || doctor.username || `BS. ${doctor.id}`
            };
          });
          setDoctors(doctorsList);
        }
      } catch (error) {
        message.error('Không thể tải danh sách bác sĩ');
      }
    };

    loadDoctors();
  }, []);

  // Fetch dữ liệu báo cáo y tế
  useEffect(() => {
    const fetchMedicalStats = async () => {
      try {
        const response = await getMedicalReportData();
        if (response && response.statistics) {
          setMedicalStats({
            totalAppointments: response.statistics.totalAppointments || 0,
            totalTestResults: response.statistics.totalTestResults || 0
          });
        }
      } catch (error) {
        error
      }
    };

    fetchMedicalStats();
  }, []);

  // Fetch thống kê nhân viên
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
    } catch (error) {
      message.error('Không thể tải dữ liệu thống kê nhân viên');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);



  // Fetch thống kê lịch hẹn
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

      setStatistics(prev => ({ ...prev, appointments: data }));
    } catch (error) {
      message.error('Không thể tải dữ liệu thống kê lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);



  // Gọi API tương ứng dựa vào tab đang active
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
    fetchStaffStatistics, 
    fetchAppointmentStatistics,
    fetchDoctorPerformanceStatistics,
  ]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Xử lý khi thay đổi tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Lấy dữ liệu thống kê cho tab hiện tại
  const getStatisticsForCurrentTab = () => {
    switch (activeTab) {
      case 'staff':
        return statistics.staff;
      case 'appointments':
        return statistics.appointments;
      default:
        return null;
    }
  };

  // Hiển thị nội dung tab Hiệu suất làm việc
  const renderPerformanceTab = () => {
    const stats = {
      doctors: statistics.staff?.doctors|| {},
      labTechnicians: statistics.staff?.labTechnicians || {},
    };
    
    return (
      <>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={12} md={12} lg={12}>
            <KPICard
              title="Tổng số bác sĩ"
              value={stats.doctors?.total || 0}
              type="primary"
              icon={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={12}>
            <KPICard
              title="Tổng số ca khám/tư vấn đã thực hiện"
              value={medicalStats.totalAppointments || 0}
              type="success"
              icon={<CheckCircleOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={12} md={12} lg={12}>
            <KPICard
              title="Tổng số kĩ thuật viên"
              value={stats.labTechnicians?.total || 0}
              type="warning"
              icon={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={12}>
            <KPICard
              title="Tổng số xét nghiệm đã thực hiện"
              value={medicalStats.totalTestResults || 0}
              type="success"
              icon={<ExperimentOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Hiệu suất làm việc của bác sĩ">
              <div className="chart-container" style={{ height: '300px' }}>
                {stats.doctors?.schedulesPerDoctor && stats.doctors.schedulesPerDoctor.length > 0 ? (
                  <div style={{ height: '100%', overflowY: 'auto', padding: '8px' }}>
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
                          title: 'Tư vấn',
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
                      pagination={{ pageSize: 5 }}
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

  // Hiển thị nội dung tab Lịch hẹn
  const renderAppointmentsTab = () => {
    const stats = statistics.appointments || {};

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <KPICard
              title="Tổng số lịch hẹn"
              value={stats.totalSchedules || 0}
              type="info"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <KPICard
              title="Đã Khám"
              value={stats.completedSchedules || 0}
              type="success"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <KPICard
              title="Đã hủy"
              value={stats.cancelledSchedules || 0}
              type="danger"
              icon={<CalendarOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12} md={12}>
            <KPICard
              title="Đã đặt"
              value={stats.bookedSchedules || 0}
              type="warning"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={12}>
            <KPICard
              title="Tỷ lệ hủy"
              value={`${stats.cancellationRate || 0}%`}
              type="danger"
              icon={<CloseCircleOutlined />}
            />
          </Col>
        </Row>
        
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
            <Card title="Xu hướng lịch hẹn theo tháng">
              <div className="chart-container">
                {stats.monthlyTrend ? (
                  <MonthlyTrendChart data={stats.monthlyTrend} title="Xu hướng lịch hẹn theo tháng" />
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

  // Render nội dung theo tab hiện tại
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
      <h1 className="dashboard-title">Thống kê hiệu suất</h1>

      <DashboardFilters
        onFilterChange={handleFilterChange}
        doctors={doctors}
        initialFilters={filters}
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
