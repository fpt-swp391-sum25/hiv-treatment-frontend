import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Tabs, Spin, Empty, message, Table, Card } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import axios from '../../../services/axios.customize';
import { 
  fetchDashboardStatisticsAPI, 
  fetchStaffStatisticsAPI, 
  fetchPatientStatisticsAPI,
  fetchAppointmentStatisticsAPI,
  fetchAllDoctorsAPI
} from '../../../services/api.service';
import { 
  getDashboardStatistics,
  getStaffStatistics,
  getPatientStatistics,
  getAppointmentStatistics
} from '../../../services/statistics.service';
import './Dashboard.css';
import KPICard from './KPICard';
import DashboardFilters from './DashboardFilters';

// Import các biểu đồ mới
import AppointmentStatusChart from './AppointmentStatusChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import GenderDistributionChart from './GenderDistributionChart';
import AgeDistributionChart from './AgeDistributionChart';
import DayOfWeekChart from './DayOfWeekChart';
import StaffWorkloadChart from './StaffWorkloadChart';
import StaffDistributionChart from './StaffDistributionChart';
import StaffPerformanceChart from './StaffPerformanceChart';
import PatientAppointmentRatioChart from './PatientAppointmentRatioChart';
import PatientRegistrationTrendChart from './PatientRegistrationTrendChart';

const { TabPane } = Tabs;

/**
 * Dashboard chính cho Manager
 * Hiển thị tổng quan về hoạt động của phòng khám/bệnh viện
 */
const Dashboard = () => {
  // State để lưu trữ dữ liệu thống kê
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    overview: null,
    staff: null,
    patients: null,
    appointments: null
  });
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    period: 'month', // 'day', 'week', 'month', 'year'
    doctorId: null,
  });

  // State cho danh sách bác sĩ
  const [doctors, setDoctors] = useState([]);
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch danh sách bác sĩ
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await fetchAllDoctorsAPI();
        console.log('Doctors API response:', response);
        
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
        console.error('Error fetching doctors:', error);
        message.error('Không thể tải danh sách bác sĩ');
      }
    };

    loadDoctors();
  }, []);

  // Fetch tổng quan thống kê 
  const fetchOverviewStatistics = useCallback(async () => {
    if (activeTab !== 'overview') return;
    
    setLoading(true);
    try {
      const data = await getDashboardStatistics(filters);
      console.log('Overview statistics:', data);
      setStatistics(prev => ({ ...prev, overview: data }));
    } catch (error) {
      console.error('Error fetching overview statistics:', error);
      message.error('Không thể tải dữ liệu thống kê tổng quan');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  // Fetch thống kê nhân viên
  const fetchStaffStatistics = useCallback(async () => {
    if (activeTab !== 'staff') return;
    
    setLoading(true);
    try {
      const data = await getStaffStatistics(filters);
      console.log('Staff statistics:', data);
      setStatistics(prev => ({ ...prev, staff: data }));
    } catch (error) {
      console.error('Error fetching staff statistics:', error);
      message.error('Không thể tải dữ liệu thống kê nhân viên');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  // Fetch thống kê bệnh nhân
  const fetchPatientStatistics = useCallback(async () => {
    if (activeTab !== 'patients') return;
    
    setLoading(true);
    try {
      const data = await getPatientStatistics(filters);
      console.log('Patient statistics:', data);
      setStatistics(prev => ({ ...prev, patients: data }));
    } catch (error) {
      console.error('Error fetching patient statistics:', error);
      message.error('Không thể tải dữ liệu thống kê bệnh nhân');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  // Fetch thống kê lịch hẹn
  const fetchAppointmentStatistics = useCallback(async () => {
    if (activeTab !== 'appointments') return;
    
    setLoading(true);
    try {
      const data = await getAppointmentStatistics(filters);
      console.log('Appointment statistics:', data);
      setStatistics(prev => ({ ...prev, appointments: data }));
    } catch (error) {
      console.error('Error fetching appointment statistics:', error);
      message.error('Không thể tải dữ liệu thống kê lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  // Gọi API tương ứng dựa vào tab đang active
  useEffect(() => {
    switch (activeTab) {
      case 'overview':
        fetchOverviewStatistics();
        break;
      case 'staff':
        fetchStaffStatistics();
        break;
      case 'patients':
        fetchPatientStatistics();
        break;
      case 'appointments':
        fetchAppointmentStatistics();
        break;
      default:
        break;
    }
  }, [
    activeTab, 
    fetchOverviewStatistics, 
    fetchStaffStatistics, 
    fetchPatientStatistics, 
    fetchAppointmentStatistics
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
      case 'overview':
        return statistics.overview;
      case 'staff':
        return statistics.staff;
      case 'patients':
        return statistics.patients;
      case 'appointments':
        return statistics.appointments;
      default:
        return null;
    }
  };

  // Hiển thị nội dung tab Tổng quan
  const renderOverviewTab = () => {
    const stats = statistics.overview || {
      staff: {},
      patients: {},
      appointments: {}
    };
    
    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <KPICard 
              title="Tổng số bệnh nhân" 
              value={stats.patients?.totalPatients || 0}
              type="info"
              icon={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <KPICard 
              title="Bệnh nhân mới" 
              value={stats.patients?.newPatients || 0}
              type="info"
              icon={<TeamOutlined />}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={8}>
            <KPICard 
              title="Nhân viên  y tế" 
              value={(stats.staff?.totalDoctors || 0) + (stats.staff?.totalLabTechnicians || 0)}
              type="warning"
              icon={<UserOutlined />}
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>

          <Col xs={24} sm={12} md={8} lg={8}>
            <KPICard 
              title="Tổng số lịch hẹn" 
              value={stats.appointments?.totalSchedules || 0}
              type="success"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <KPICard 
              title="Tỷ lệ hoàn thành" 
              value={`${stats.appointments?.completionRate || 0}%`}
              type="success"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <KPICard 
              title="Tỷ lệ hủy hẹn" 
              value={`${stats.appointments?.cancellationRate || 0}%`}
              type="danger"
              icon={<CalendarOutlined />}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Xu hướng lịch hẹn theo tháng">
              <div className="chart-container">
                {stats.appointments?.monthlyTrend ? (
                  <MonthlyTrendChart data={stats.appointments.monthlyTrend} />
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Chưa có dữ liệu biểu đồ" />
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  // Hiển thị nội dung tab Nhân viên
  const renderStaffTab = () => {
    const stats = statistics.staff || { doctors: {}, labTechnicians: {} };
    
    // Tính tỷ lệ bác sĩ và kỹ thuật viên
    const totalStaff = (stats.doctors?.total || 0) + (stats.labTechnicians?.total || 0);
    const doctorRatio = totalStaff > 0 ? Math.round((stats.doctors?.total || 0) / totalStaff * 100) : 0;
    const labTechRatio = totalStaff > 0 ? Math.round((stats.labTechnicians?.total || 0) / totalStaff * 100) : 0;
    
    // Dữ liệu cho biểu đồ phân bố nhân viên
    const staffDistributionData = {
      totalDoctors: stats.doctors?.total || 0,
      totalLabTechnicians: stats.labTechnicians?.total || 0
    };
    
    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Tổng số bác sĩ" 
              value={stats.doctors?.total || 0}
              type="info"
              icon={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Kỹ thuật viên" 
              value={stats.labTechnicians?.total || 0}
              type="info"
              icon={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Tỷ lệ bác sĩ" 
              value={`${doctorRatio}%`}
              type="success"
              icon={<UserOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Tỷ lệ kỹ thuật viên" 
              value={`${labTechRatio}%`}
              type="warning"
              icon={<UserOutlined />}
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} md={12}>
            <StaffDistributionChart data={staffDistributionData} />
          </Col>
          <Col xs={24} md={12}>
            <StaffPerformanceChart data={stats.doctors?.schedulesPerDoctor || []} />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} md={12}>
            <Card title="Phân bố lịch hẹn theo bác sĩ">
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
                          width: 80,
                        },
                        {
                          title: 'Bác sĩ',
                          dataIndex: 'name',
                          key: 'name',
                          ellipsis: true,
                        },
                        {
                          title: 'Số lịch hẹn',
                          dataIndex: 'totalSchedules',
                          key: 'totalSchedules',
                          sorter: (a, b) => a.totalSchedules - b.totalSchedules,
                          defaultSortOrder: 'descend',
                        },
                        {
                          title: 'Hoàn thành',
                          dataIndex: 'completedSchedules',
                          key: 'completedSchedules',
                        },
                        {
                          title: 'Hiệu suất',
                          dataIndex: 'performance',
                          key: 'performance',
                          render: (text) => `${text}%`,
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
          <Col xs={24} md={12}>
            <StaffWorkloadChart data={stats.workloadDistribution} />
          </Col>
        </Row>
      </>
    );
  };

  // Hiển thị nội dung tab Bệnh nhân
  const renderPatientsTab = () => {
    const stats = statistics.patients || {};
    
    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Tổng số bệnh nhân" 
              value={stats.totalPatients || 0}
              type="info"
              icon={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Bệnh nhân mới" 
              value={stats.newPatients || 0}
              type="success"
              icon={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Bệnh nhân đã đặt lịch" 
              value={stats.patientsWithAppointments || 0}
              type="warning"
              icon={<TeamOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Bệnh nhân hoạt động" 
              value={stats.activePatients || 0}
              type="success"
              icon={<TeamOutlined />}
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} md={8}>
            <Card title="Phân bố bệnh nhân theo giới tính">
              <div className="chart-container">
                {stats.genderDistribution ? (
                  <GenderDistributionChart data={stats.genderDistribution} />
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Chưa có dữ liệu giới tính" />
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Phân bố bệnh nhân theo độ tuổi">
              <div className="chart-container">
                {stats.ageGroups ? (
                  <AgeDistributionChart data={stats.ageGroups} />
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Chưa có dữ liệu độ tuổi" />
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <PatientAppointmentRatioChart 
              totalPatients={stats.totalPatients || 0} 
              patientsWithAppointments={stats.patientsWithAppointments || 0} 
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24}>
            <PatientRegistrationTrendChart data={stats.registrationTrend || []} />
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
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Tổng số lịch hẹn" 
              value={stats.totalSchedules || 0}
              type="info"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Hoàn thành" 
              value={stats.completedSchedules || 0}
              type="success"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Đã hủy" 
              value={stats.cancelledSchedules || 0}
              type="danger"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Đang chờ" 
              value={stats.pendingSchedules || 0}
              type="warning"
              icon={<CalendarOutlined />}
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Tỷ lệ hoàn thành" 
              value={`${stats.completionRate || 0}%`}
              type="success"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Tỷ lệ hủy" 
              value={`${stats.cancellationRate || 0}%`}
              type="danger"
              icon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KPICard 
              title="Lịch trống" 
              value={stats.emptySchedules || 0}
              type="info"
              icon={<CalendarOutlined />}
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} sm={12}>
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
          <Col xs={24} sm={12}>
            <Card title="Lịch hẹn theo ngày trong tuần">
              <div className="chart-container">
                {stats.appointmentsByDayOfWeek ? (
                  <DayOfWeekChart data={stats.appointmentsByDayOfWeek} />
                ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Chưa có dữ liệu ngày trong tuần" />
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
      case 'overview':
        return renderOverviewTab();
      case 'staff':
        return renderStaffTab();
      case 'patients':
        return renderPatientsTab();
      case 'appointments':
        return renderAppointmentsTab();
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Thống kê tổng quan</h1>
      
      <DashboardFilters 
        onFilterChange={handleFilterChange} 
        doctors={doctors}
        initialFilters={filters}
      />
      
      <Tabs 
        defaultActiveKey="overview" 
        className="dashboard-tabs"
        activeKey={activeTab}
        onChange={handleTabChange}
      >
        <TabPane tab="Tổng quan" key="overview">
          {renderTabContent()}
        </TabPane>
        
        <TabPane tab="Nhân viên" key="staff">
          {renderTabContent()}
        </TabPane>
        
        <TabPane tab="Bệnh nhân" key="patients">
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
