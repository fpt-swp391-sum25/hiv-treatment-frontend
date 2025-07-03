import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Tabs, Spin, Empty, message, Table, Card } from 'antd';
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axios from '../../../services/axios.customize';
import { 
  fetchDashboardStatisticsAPI, 
  fetchStaffStatisticsAPI, 
  fetchPatientStatisticsAPI,
  fetchAppointmentStatisticsAPI,
  fetchTreatmentStatisticsAPI,
  fetchFinancialStatisticsAPI,
  fetchAllDoctorsAPI
} from '../../../services/api.service';
import './Dashboard.css';
import KPICard from './KPICard';
import DashboardFilters from './DashboardFilters';

const { TabPane } = Tabs;

/**
 * Dashboard chính cho Manager
 * Hiển thị tổng quan về hoạt động của phòng khám/bệnh viện
 */
const Dashboard = () => {
  // State để lưu trữ dữ liệu thống kê
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    staff: {},
    patients: {},
    appointments: {},
    treatments: {},
    finances: {}
  });
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    period: 'month', // 'day', 'week', 'month', 'year'
    doctorId: null,
    patientId: null
  });

  // State cho danh sách bác sĩ
  const [doctors, setDoctors] = useState([]);
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch danh sách bác sĩ
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetchAllDoctorsAPI();
        if (response && response.data) {
          // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
          const formattedDoctors = response.data.map(doctor => ({
            id: doctor.id,
            name: doctor.fullName || `${doctor.username || 'BS.'}`
          }));
          setDoctors(formattedDoctors);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        message.error('Không thể tải danh sách bác sĩ');
      }
    };

    fetchDoctors();
  }, []);

  // Chuyển đổi filters thành params cho API
  const getApiParams = useCallback((currentFilters) => {
    const params = {};
    
    if (currentFilters.dateRange && currentFilters.dateRange[0] && currentFilters.dateRange[1]) {
      params.startDate = currentFilters.dateRange[0].format('YYYY-MM-DD');
      params.endDate = currentFilters.dateRange[1].format('YYYY-MM-DD');
    }
    
    if (currentFilters.period) {
      params.period = currentFilters.period;
    }
    
    if (currentFilters.doctorId) {
      params.doctorId = currentFilters.doctorId;
    }
    
    return params;
  }, []);

  // Fetch dữ liệu thống kê tổng quan
  const fetchOverviewStatistics = useCallback(async () => {
    if (activeTab !== 'overview') return;
    
    setLoading(true);
    try {
      const params = getApiParams(filters);
      const response = await fetchDashboardStatisticsAPI(params);
      
      if (response && response.data) {
        setStatistics(prevStats => ({
          ...prevStats,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching overview statistics:', error);
      message.error('Không thể tải dữ liệu thống kê tổng quan');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, getApiParams]);

  // Fetch dữ liệu thống kê nhân sự
  const fetchStaffStatistics = useCallback(async () => {
    if (activeTab !== 'staff') return;
    
    setLoading(true);
    try {
      const params = getApiParams(filters);
      const response = await fetchStaffStatisticsAPI(params);
      
      if (response && response.data) {
        setStatistics(prevStats => ({
          ...prevStats,
          staff: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching staff statistics:', error);
      message.error('Không thể tải dữ liệu thống kê nhân sự');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, getApiParams]);

  // Fetch dữ liệu thống kê bệnh nhân
  const fetchPatientStatistics = useCallback(async () => {
    if (activeTab !== 'patients') return;
    
    setLoading(true);
    try {
      const params = getApiParams(filters);
      const response = await fetchPatientStatisticsAPI(params);
      
      if (response && response.data) {
        setStatistics(prevStats => ({
          ...prevStats,
          patients: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching patient statistics:', error);
      message.error('Không thể tải dữ liệu thống kê bệnh nhân');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, getApiParams]);

  // Fetch dữ liệu thống kê lịch hẹn
  const fetchAppointmentStatistics = useCallback(async () => {
    if (activeTab !== 'appointments') return;
    
    setLoading(true);
    try {
      const params = getApiParams(filters);
      const response = await fetchAppointmentStatisticsAPI(params);
      
      if (response && response.data) {
        setStatistics(prevStats => ({
          ...prevStats,
          appointments: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching appointment statistics:', error);
      message.error('Không thể tải dữ liệu thống kê lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, getApiParams]);

  // Fetch dữ liệu thống kê điều trị
  const fetchTreatmentStatistics = useCallback(async () => {
    if (activeTab !== 'treatments') return;
    
    setLoading(true);
    try {
      const params = getApiParams(filters);
      const response = await fetchTreatmentStatisticsAPI(params);
      
      if (response && response.data) {
        setStatistics(prevStats => ({
          ...prevStats,
          treatments: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching treatment statistics:', error);
      message.error('Không thể tải dữ liệu thống kê điều trị');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, getApiParams]);

  // Fetch dữ liệu thống kê tài chính
  const fetchFinancialStatistics = useCallback(async () => {
    if (activeTab !== 'finances') return;
    
    setLoading(true);
    try {
      const params = getApiParams(filters);
      const response = await fetchFinancialStatisticsAPI(params);
      
      if (response && response.data) {
        setStatistics(prevStats => ({
          ...prevStats,
          finances: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching financial statistics:', error);
      message.error('Không thể tải dữ liệu thống kê tài chính');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, getApiParams]);

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
      case 'treatments':
        fetchTreatmentStatistics();
        break;
      case 'finances':
        fetchFinancialStatistics();
        break;
      default:
        break;
    }
  }, [
    activeTab, 
    fetchOverviewStatistics, 
    fetchStaffStatistics, 
    fetchPatientStatistics, 
    fetchAppointmentStatistics, 
    fetchTreatmentStatistics, 
    fetchFinancialStatistics
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

  // Fallback cho dữ liệu thiếu từ API
  const getStatisticsWithFallback = () => {
    // Dữ liệu mặc định khi API chưa trả về đầy đủ
    const defaultStats = {
      staff: {
        totalDoctors: 0,
        totalLabTechnicians: 0,
        activeStaff: 0,
        doctorUtilization: 0,
        labTechnicianUtilization: 0
      },
      patients: {
        totalPatients: 0,
        newPatients: 0,
        returningPatients: 0,
        activePatients: 0,
        inactivePatients: 0,
        growthRate: 0
      },
      appointments: {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        pendingAppointments: 0,
        completionRate: 0,
        cancellationRate: 0,
        averageWaitTime: 0
      },
      treatments: {
        ongoingTreatments: 0,
        successfulTreatments: 0,
        averageTreatmentDuration: 0,
        successRate: 0,
        adherenceRate: 0
      },
      finances: {
        monthlyRevenue: 0,
        averageCostPerPatient: 0,
        revenueGrowth: 0,
        costReduction: 0
      }
    };

    // Merge dữ liệu từ API với dữ liệu mặc định
    return {
      staff: { ...defaultStats.staff, ...statistics.staff },
      patients: { ...defaultStats.patients, ...statistics.patients },
      appointments: { ...defaultStats.appointments, ...statistics.appointments },
      treatments: { ...defaultStats.treatments, ...statistics.treatments },
      finances: { ...defaultStats.finances, ...statistics.finances }
    };
  };

  // Lấy dữ liệu thống kê với fallback
  const stats = getStatisticsWithFallback();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Thống kê tổng quan</h1>
      
      {/* Bộ lọc */}
      <DashboardFilters 
        onFilterChange={handleFilterChange} 
        doctors={doctors}
        initialFilters={filters}
      />
      
      {/* Tabs cho các nhóm thống kê */}
      <Tabs 
        defaultActiveKey="overview" 
        className="dashboard-tabs"
        activeKey={activeTab}
        onChange={handleTabChange}
      >
        <TabPane tab="Tổng quan" key="overview">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tổng số bệnh nhân" 
                    value={stats.patients.totalPatients || 0}
                    trend={stats.patients.growthRate}
                    trendLabel="so với tháng trước"
                    type="info"
                    icon={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Lịch hẹn tháng này" 
                    value={stats.appointments.totalAppointments || 0}
                    trend={stats.appointments.appointmentGrowth || 0}
                    trendLabel="so với tháng trước"
                    type="success"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tỷ lệ hoàn thành" 
                    value={`${stats.appointments.completionRate || 0}%`}
                    trend={stats.appointments.completionRateChange || 0}
                    trendLabel="so với tháng trước"
                    type="warning"
                    icon={<MedicineBoxOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Điều trị" 
                    value={stats.treatments.successfulTreatments || 0}
                    trend={stats.treatments.successRateChange || 0}
                    trendLabel="so với tháng trước"
                    type="success"
                    icon={<UserOutlined />}
                  />
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Bệnh nhân mới" 
                    value={stats.patients.newPatients || 0}
                    trend={stats.patients.newPatientGrowth || 0}
                    trendLabel="so với tháng trước"
                    type="info"
                    icon={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tỷ lệ hủy hẹn" 
                    value={`${stats.appointments.cancellationRate || 0}%`}
                    trend={stats.appointments.cancellationRateChange || 0}
                    trendLabel="so với tháng trước"
                    type="danger"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Doanh thu tháng" 
                    value={`${(stats.finances.monthlyRevenue || 0).toLocaleString()} đ`}
                    trend={stats.finances.revenueGrowth || 0}
                    trendLabel="so với tháng trước"
                    type="success"
                    icon={<DollarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Chi phí trung bình" 
                    value={`${(stats.finances.averageCostPerPatient || 0).toLocaleString()} đ`}
                    trend={-(stats.finances.costReduction || 0)}
                    trendLabel="so với tháng trước"
                    type="info"
                    icon={<DollarOutlined />}
                  />
                </Col>
              </Row>
              
              {/* Biểu đồ sẽ được thêm ở đây */}
              <div className="dashboard-charts">
                {/* TODO: Thêm các biểu đồ */}
                <Empty 
                  description="Biểu đồ đang được phát triển" 
                  style={{ marginTop: '40px' }}
                />
              </div>
            </>
          )}
        </TabPane>
        
        <TabPane tab="Nhân sự" key="staff">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tổng số bác sĩ" 
                    value={stats.staff.totalDoctors || 0}
                    type="info"
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Kỹ thuật viên xét nghiệm" 
                    value={stats.staff.totalLabTechnicians || 0}
                    type="success"
                    icon={<MedicineBoxOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Hiệu suất bác sĩ" 
                    value={`${stats.staff.doctorUtilization || 0}%`}
                    type="warning"
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Nhân viên hoạt động" 
                    value={stats.staff.activeStaff || 0}
                    type="success"
                    icon={<TeamOutlined />}
                  />
                </Col>
              </Row>
              
              {/* Bảng chi tiết bác sĩ */}
              {stats.staff.doctorDetails && stats.staff.doctorDetails.length > 0 ? (
                <div className="data-table" style={{ marginTop: '24px' }}>
                  <div className="table-header">
                    <h3 className="table-title">Thống kê theo bác sĩ</h3>
                  </div>
                  <Table 
                    dataSource={stats.staff.doctorDetails} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  >
                    <Table.Column title="Bác sĩ" dataIndex="name" key="name" />
                    <Table.Column 
                      title="Số lịch hẹn" 
                      dataIndex="scheduleCount" 
                      key="scheduleCount"
                      sorter={(a, b) => a.scheduleCount - b.scheduleCount}
                    />
                    <Table.Column 
                      title="Hoàn thành" 
                      dataIndex="completedSchedules" 
                      key="completedSchedules" 
                      sorter={(a, b) => a.completedSchedules - b.completedSchedules}
                    />
                    <Table.Column 
                      title="Tỷ lệ hoàn thành" 
                      key="completionRate" 
                      render={(text, record) => (
                        <span>{record.completionRate || 0}%</span>
                      )}
                      sorter={(a, b) => a.completionRate - b.completionRate}
                    />
                  </Table>
                </div>
              ) : (
                <Empty 
                  description="Không có dữ liệu bác sĩ" 
                  style={{ marginTop: '40px' }}
                />
              )}
              
              {/* Thống kê nhân sự theo giới tính */}
              {stats.staff.staffByGender && (
                <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                  <Col xs={24} sm={12}>
                    <Card title="Phân bố nhân sự theo giới tính">
                      <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Row gutter={16} style={{ width: '100%', textAlign: 'center' }}>
                          <Col span={8}>
                            <div className="stat-circle male">
                              <h3>{stats.staff.staffByGender.male || 0}</h3>
                              <p>Nam</p>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div className="stat-circle female">
                              <h3>{stats.staff.staffByGender.female || 0}</h3>
                              <p>Nữ</p>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div className="stat-circle other">
                              <h3>{stats.staff.staffByGender.other || 0}</h3>
                              <p>Khác</p>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card title="Số lịch hẹn theo bác sĩ">
                      <Empty description="Biểu đồ đang được phát triển" />
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}
        </TabPane>
        
        <TabPane tab="Bệnh nhân" key="patients">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tổng số bệnh nhân" 
                    value={stats.patients.totalPatients || 0}
                    type="info"
                    icon={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Bệnh nhân mới" 
                    value={stats.patients.newPatients || 0}
                    trend={stats.patients.newPatientGrowth || 0}
                    trendLabel="so với tháng trước"
                    type="success"
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Bệnh nhân quay lại" 
                    value={stats.patients.returningPatients || 0}
                    type="warning"
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Bệnh nhân hoạt động" 
                    value={stats.patients.activePatients || 0}
                    type="success"
                    icon={<TeamOutlined />}
                  />
                </Col>
              </Row>
              
              {/* Thống kê bệnh nhân theo giới tính */}
              <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} sm={12}>
                  <Card title="Phân bố bệnh nhân theo giới tính">
                    <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Row gutter={16} style={{ width: '100%', textAlign: 'center' }}>
                        <Col span={8}>
                          <div className="stat-circle male">
                            <h3>{stats.patients.patientsByGender?.male || 0}</h3>
                            <p>Nam</p>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="stat-circle female">
                            <h3>{stats.patients.patientsByGender?.female || 0}</h3>
                            <p>Nữ</p>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="stat-circle other">
                            <h3>{stats.patients.patientsByGender?.other || 0}</h3>
                            <p>Khác</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card title="Phân bố bệnh nhân theo trạng thái">
                    <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Row gutter={16} style={{ width: '100%', textAlign: 'center' }}>
                        <Col span={12}>
                          <div className="stat-box active">
                            <h3>{stats.patients.patientsByStatus?.active || 0}</h3>
                            <p>Đang hoạt động</p>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="stat-box inactive">
                            <h3>{stats.patients.patientsByStatus?.inactive || 0}</h3>
                            <p>Không hoạt động</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              {/* Thống kê bệnh nhân theo lịch hẹn */}
              <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24}>
                  <Card title="Thống kê bệnh nhân theo lịch hẹn">
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <div className="stat-item">
                          <div className="stat-label">Bệnh nhân có lịch hẹn</div>
                          <div className="stat-value">{stats.patients.patientAppointments?.withAppointments || 0}</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="stat-item">
                          <div className="stat-label">Bệnh nhân chưa có lịch hẹn</div>
                          <div className="stat-value">{stats.patients.patientAppointments?.withoutAppointments || 0}</div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
              
              {/* Biểu đồ tăng trưởng bệnh nhân */}
              <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24}>
                  <Card title="Tăng trưởng bệnh nhân">
                    <Empty description="Biểu đồ đang được phát triển" />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>
        
        <TabPane tab="Lịch hẹn" key="appointments">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tổng số lịch hẹn" 
                    value={stats.appointments.totalAppointments || 0}
                    trend={stats.appointments.appointmentGrowth || 0}
                    trendLabel="so với tháng trước"
                    type="info"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Hoàn thành" 
                    value={stats.appointments.completedAppointments || 0}
                    type="success"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Đã hủy" 
                    value={stats.appointments.cancelledAppointments || 0}
                    type="danger"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Đang chờ" 
                    value={stats.appointments.pendingAppointments || 0}
                    type="warning"
                    icon={<CalendarOutlined />}
                  />
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tỷ lệ hoàn thành" 
                    value={`${stats.appointments.completionRate || 0}%`}
                    trend={stats.appointments.completionRateChange || 0}
                    trendLabel="so với tháng trước"
                    type="success"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tỷ lệ hủy" 
                    value={`${stats.appointments.cancellationRate || 0}%`}
                    trend={stats.appointments.cancellationRateChange || 0}
                    trendLabel="so với tháng trước"
                    type="danger"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Thời gian chờ trung bình" 
                    value={`${stats.appointments.averageWaitTime || 0} phút`}
                    type="warning"
                    icon={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Lịch trống" 
                    value={stats.appointments.emptyAppointments || 0}
                    type="info"
                    icon={<CalendarOutlined />}
                  />
                </Col>
              </Row>
              
              {/* Thống kê lịch hẹn theo trạng thái */}
              <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} sm={12}>
                  <Card title="Phân bố lịch hẹn theo trạng thái">
                    <div className="status-distribution">
                      <div className="status-bar">
                        <div 
                          className="status-segment completed" 
                          style={{ 
                            width: `${stats.appointments.totalAppointments ? 
                              (stats.appointments.completedAppointments / stats.appointments.totalAppointments) * 100 : 0}%` 
                          }}
                        >
                          {stats.appointments.completedAppointments || 0}
                        </div>
                        <div 
                          className="status-segment pending" 
                          style={{ 
                            width: `${stats.appointments.totalAppointments ? 
                              (stats.appointments.pendingAppointments / stats.appointments.totalAppointments) * 100 : 0}%` 
                          }}
                        >
                          {stats.appointments.pendingAppointments || 0}
                        </div>
                        <div 
                          className="status-segment cancelled" 
                          style={{ 
                            width: `${stats.appointments.totalAppointments ? 
                              (stats.appointments.cancelledAppointments / stats.appointments.totalAppointments) * 100 : 0}%` 
                          }}
                        >
                          {stats.appointments.cancelledAppointments || 0}
                        </div>
                      </div>
                      <div className="status-legend">
                        <div className="legend-item">
                          <div className="legend-color completed"></div>
                          <div className="legend-label">Hoàn thành</div>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color pending"></div>
                          <div className="legend-label">Đang chờ</div>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color cancelled"></div>
                          <div className="legend-label">Đã hủy</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card title="Xu hướng lịch hẹn">
                    <div className="trend-stats">
                      <div className="trend-item">
                        <div className="trend-label">Tháng hiện tại</div>
                        <div className="trend-value">{stats.appointments.appointmentTrends?.currentMonth || 0}</div>
                      </div>
                      <div className="trend-item">
                        <div className="trend-label">Tháng trước</div>
                        <div className="trend-value">{stats.appointments.appointmentTrends?.lastMonth || 0}</div>
                      </div>
                      <div className="trend-item">
                        <div className="trend-label">Tăng trưởng</div>
                        <div className={`trend-value ${stats.appointments.appointmentTrends?.growth > 0 ? 'positive' : 'negative'}`}>
                          {stats.appointments.appointmentTrends?.growth > 0 ? '+' : ''}
                          {Math.round(stats.appointments.appointmentTrends?.growth || 0)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              {/* Thống kê lịch hẹn theo bác sĩ */}
              {stats.appointments.appointmentsByDoctor && Object.keys(stats.appointments.appointmentsByDoctor).length > 0 ? (
                <div className="data-table" style={{ marginTop: '24px' }}>
                  <div className="table-header">
                    <h3 className="table-title">Thống kê theo bác sĩ</h3>
                  </div>
                  <Table 
                    dataSource={Object.entries(stats.appointments.appointmentsByDoctor).map(([id, data]) => ({
                      id,
                      name: data.name,
                      total: data.total,
                      completed: data.completed,
                      cancelled: data.cancelled,
                      pending: data.pending,
                      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                    }))} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  >
                    <Table.Column title="Bác sĩ" dataIndex="name" key="name" />
                    <Table.Column 
                      title="Tổng số" 
                      dataIndex="total" 
                      key="total"
                      sorter={(a, b) => a.total - b.total}
                    />
                    <Table.Column 
                      title="Hoàn thành" 
                      dataIndex="completed" 
                      key="completed" 
                      sorter={(a, b) => a.completed - b.completed}
                    />
                    <Table.Column 
                      title="Đã hủy" 
                      dataIndex="cancelled" 
                      key="cancelled" 
                      sorter={(a, b) => a.cancelled - b.cancelled}
                    />
                    <Table.Column 
                      title="Tỷ lệ hoàn thành" 
                      key="completionRate" 
                      render={(text, record) => (
                        <span>{record.completionRate}%</span>
                      )}
                      sorter={(a, b) => a.completionRate - b.completionRate}
                    />
                  </Table>
                </div>
              ) : (
                <Empty 
                  description="Không có dữ liệu lịch hẹn theo bác sĩ" 
                  style={{ marginTop: '24px' }}
                />
              )}
            </>
          )}
        </TabPane>
        
        <TabPane tab="Điều trị" key="treatments">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Điều trị đang diễn ra" 
                    value={stats.treatments.ongoingTreatments || 0}
                    type="info"
                    icon={<MedicineBoxOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Điều trị thành công" 
                    value={stats.treatments.successfulTreatments || 0}
                    type="success"
                    icon={<MedicineBoxOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tỷ lệ thành công" 
                    value={`${stats.treatments.successRate || 0}%`}
                    trend={stats.treatments.successRateChange || 0}
                    trendLabel="so với tháng trước"
                    type="warning"
                    icon={<MedicineBoxOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tỷ lệ tuân thủ" 
                    value={`${stats.treatments.adherenceRate || 0}%`}
                    type="success"
                    icon={<MedicineBoxOutlined />}
                  />
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24}>
                  <Card title="Hiệu quả điều trị theo thời gian">
                    <Empty description="Biểu đồ đang được phát triển" />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>
        
        <TabPane tab="Tài chính" key="finances">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Doanh thu tháng" 
                    value={`${(stats.finances.monthlyRevenue || 0).toLocaleString()} đ`}
                    trend={stats.finances.revenueGrowth || 0}
                    trendLabel="so với tháng trước"
                    type="success"
                    icon={<DollarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Chi phí trung bình" 
                    value={`${(stats.finances.averageCostPerPatient || 0).toLocaleString()} đ`}
                    trend={-(stats.finances.costReduction || 0)}
                    trendLabel="so với tháng trước"
                    type="info"
                    icon={<DollarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Tăng trưởng doanh thu" 
                    value={`${stats.finances.revenueGrowth || 0}%`}
                    type={stats.finances.revenueGrowth >= 0 ? "success" : "danger"}
                    icon={<DollarOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <KPICard 
                    title="Giảm chi phí" 
                    value={`${stats.finances.costReduction || 0}%`}
                    type="success"
                    icon={<DollarOutlined />}
                  />
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24}>
                  <Card title="Xu hướng doanh thu">
                    <Empty description="Biểu đồ đang được phát triển" />
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard;
