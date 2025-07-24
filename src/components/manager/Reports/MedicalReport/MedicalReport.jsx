import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Statistic, Row, Col, Tabs, Button, 
  Space, DatePicker, Spin, Empty, Table, Tag,
  Divider, Typography, Alert, List, Descriptions
} from 'antd';
import {
  FileSearchOutlined, ExperimentOutlined, MedicineBoxOutlined, TeamOutlined,
  FilterOutlined, FileExcelOutlined, UserOutlined, CalendarOutlined, UpOutlined, DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getMedicalReportData, exportMedicalReportToExcel } from '../../../../services/report.service';
import './MedicalReport.css';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

// Constants
const HIV_COLORS = {
  positive: '#ff4d4f',
  negative: '#52c41a',
  unknown: '#faad14'
};

const MedicalReport = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // Điều chỉnh dateRange để lấy dữ liệu từ rất xa trong quá khứ đến hiện tại
  const [dateRange, setDateRange] = useState([dayjs('2000-01-01'), dayjs()]);
  const [reportData, setReportData] = useState({
    reports: [],
    statistics: {
      totalAppointments: 0,
      totalTestResults: 0,
      testTypeDistribution: [],
      totalRegimens: 0,
      totalPatients: 0,
      totalPositiveHIV: 0,
      totalNegativeHIV: 0,
      hivTrends: []
    }
  });
  
  // State cho tab Patient Appointments
  const [expandedPatientIds, setExpandedPatientIds] = useState([]);
  const [expandedRecordIds, setExpandedRecordIds] = useState({});

  // Memoized values
  const hivStatistics = useMemo(() => {
    const { totalPositiveHIV = 0, totalNegativeHIV = 0 } = reportData.statistics;
    const totalHIVTests = totalPositiveHIV + totalNegativeHIV;
    const positiveRate = totalHIVTests > 0 
      ? Math.round((totalPositiveHIV / totalHIVTests) * 100) 
      : 0;
    
    return {
      totalHIVTests,
      positiveRate
    };
  }, [reportData.statistics]);

  // Handlers
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD');
      
      // Truyền đúng tham số dưới dạng object filters
      const response = await getMedicalReportData({
        startDate,
        endDate
      });
      console.log('Loaded medical report data:', response);
      setReportData(response);
    } catch (error) {
      console.error('Error loading medical report data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD');
      
      await exportMedicalReportToExcel(startDate, endDate);
    } catch (error) {
      console.error('Error exporting medical report:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Toggle mở rộng cho bệnh nhân
  const togglePatientExpand = (patientId) => {
    setExpandedPatientIds(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  // Toggle mở rộng cho hồ sơ y tế
  const toggleRecordExpand = (patientId, recordId) => {
    setExpandedRecordIds(prev => {
      const patientRecords = prev[patientId] || [];
      const updatedRecords = patientRecords.includes(recordId)
        ? patientRecords.filter(id => id !== recordId)
        : [...patientRecords, recordId];
      
      return {
        ...prev,
        [patientId]: updatedRecords
      };
    });
  };

  // Effects
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Render Overview Tab
  const renderOverviewTab = () => {
    const { statistics } = reportData;

    return (
      <div className="medical-overview">
        <Row gutter={[16, 16]}>
          {/* KPI Cards - Hàng 1 */}
          <Col xs={24} sm={12} md={8}>
            <Card className="medical-stat-card">
              <Statistic
                title="Tổng số lịch hẹn đã hoàn thành"
                value={statistics.totalAppointments}
                prefix={<FileSearchOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="medical-stat-card">
              <Statistic
                title="Tổng số xét nghiệm đã thực hiện"
                value={statistics.totalTestResults}
                prefix={<ExperimentOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="medical-stat-card">
              <Statistic
                title="Tổng số phác đồ điều trị"
                value={statistics.totalRegimens}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>

          {/* KPI Cards - Hàng 2 */}
          <Col xs={24} sm={12} md={8}>
            <Card className="medical-stat-card">
              <Statistic
                title="Tổng số bệnh nhân"
                value={statistics.totalPatients || 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="medical-stat-card">
              <Statistic
                title="Tổng số ca dương tính HIV"
                value={statistics.totalPositiveHIV || 0}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExperimentOutlined style={{ color: '#ff4d4f' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="medical-stat-card">
              <Statistic
                title="Tổng số ca âm tính HIV"
                value={statistics.totalNegativeHIV || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tóm tắt tình hình HIV */}
        <Divider>Tóm tắt tình hình HIV</Divider>
        <Row>
          <Col span={24}>
            <Card title="Tổng quan tình hình HIV">
              <p>
                Trong khoảng thời gian báo cáo, đã ghi nhận tổng cộng <Text strong>{statistics.totalPositiveHIV + statistics.totalNegativeHIV}</Text> xét nghiệm HIV, 
                trong đó có <Text strong style={{ color: '#ff4d4f' }}>{statistics.totalPositiveHIV}</Text> ca dương tính 
                và <Text strong style={{ color: '#52c41a' }}>{statistics.totalNegativeHIV}</Text> ca âm tính.
              </p>
              <p>
                Tỷ lệ dương tính HIV chiếm <Text strong>{Math.round((statistics.totalPositiveHIV / (statistics.totalPositiveHIV + statistics.totalNegativeHIV || 1)) * 100)}%</Text> tổng số ca xét nghiệm.
              </p>
              {statistics.hivTrends && statistics.hivTrends.length > 0 && (
                <p>
                  Xu hướng gần đây: {
                    statistics.hivTrends[statistics.hivTrends.length - 1].positive > 
                    statistics.hivTrends[0].positive ? (
                      <Text type="danger">Số ca dương tính đang có xu hướng tăng</Text>
                    ) : (
                      <Text type="success">Số ca dương tính đang có xu hướng giảm</Text>
                    )
                  }
                </p>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Render HIV Statistics Tab
  const renderHIVStatisticsTab = () => {
    const { statistics } = reportData;
    
    // Sử dụng dữ liệu đã được tính toán từ useMemo
    const { totalHIVTests, positiveRate } = hivStatistics;
    
    // Kiểm tra dữ liệu HIV trends
    const hasValidTrends = Array.isArray(statistics.hivTrends) && statistics.hivTrends.length > 0;
    
    return (
      <div className="hiv-statistics-tab">
        {/* Báo cáo tổng quan HIV */}
        <Card title="Báo cáo tổng quan HIV" className="report-card">
          <div className="report-content">
            <Title level={4}>Tóm tắt</Title>
            <p>
              Trong khoảng thời gian từ {dateRange?.[0]?.format('DD/MM/YYYY') || 'đầu kỳ'} đến {dateRange?.[1]?.format('DD/MM/YYYY') || 'cuối kỳ'}, 
              đã thực hiện tổng cộng <Text strong>{totalHIVTests}</Text> xét nghiệm HIV.
            </p>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Statistic
                  title="Tổng số xét nghiệm HIV"
                  value={totalHIVTests}
                  prefix={<ExperimentOutlined />}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Số ca dương tính"
                  value={statistics.totalPositiveHIV || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<ExperimentOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Số ca âm tính"
                  value={statistics.totalNegativeHIV || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Title level={4}>Phân tích chi tiết</Title>
            <p>
              Tỷ lệ dương tính HIV trong kỳ báo cáo là <Text strong>{positiveRate}%</Text>, 
              {positiveRate > 10 ? 
                <Text type="danger"> cao hơn mức trung bình 10%</Text> : 
                <Text type="success"> nằm trong mức trung bình dưới 10%</Text>}.
            </p>
            
            {hasValidTrends && (
              <p>
                So với đầu kỳ báo cáo, số ca dương tính HIV đã 
                {statistics.hivTrends[statistics.hivTrends.length - 1].positive > statistics.hivTrends[0].positive ? (
                  <Text type="danger"> tăng {statistics.hivTrends[statistics.hivTrends.length - 1].positive - statistics.hivTrends[0].positive} ca</Text>
                ) : (
                  <Text type="success"> giảm {statistics.hivTrends[0].positive - statistics.hivTrends[statistics.hivTrends.length - 1].positive} ca</Text>
                )}.
              </p>
            )}
          </div>
        </Card>
        
        {/* Bảng phân tích theo tháng */}
        {hasValidTrends && (
          <Card title="Phân tích chi tiết theo tháng" style={{ marginTop: 16 }}>
            <Table
              dataSource={statistics.hivTrends}
              pagination={false}
              rowKey="month"
              columns={[
                {
                  title: 'Tháng',
                  dataIndex: 'month',
                  key: 'month'
                },
                {
                  title: 'Dương tính',
                  dataIndex: 'positive',
                  key: 'positive',
                  render: (value) => (
                    <Tag color={HIV_COLORS.positive}>{value}</Tag>
                  )
                },
                {
                  title: 'Âm tính',
                  dataIndex: 'negative',
                  key: 'negative',
                  render: (value) => (
                    <Tag color={HIV_COLORS.negative}>{value}</Tag>
                  )
                },
                {
                  title: 'Chưa xác định',
                  dataIndex: 'unknown',
                  key: 'unknown',
                  render: (value) => (
                    <Tag color={HIV_COLORS.unknown}>{value}</Tag>
                  )
                },
                {
                  title: 'Tổng số',
                  dataIndex: 'total',
                  key: 'total'
                },
                {
                  title: 'Tỷ lệ dương tính',
                  key: 'positiveRate',
        render: (_, record) => {
                    const total = record.positive + record.negative;
                    const rate = total > 0 ? Math.round((record.positive / total) * 100) : 0;
                    return `${rate}%`;
                  }
                }
              ]}
            />
          </Card>
        )}
        
        {/* Khuyến nghị */}
        <Card title="Khuyến nghị" style={{ marginTop: 16 }}>
          <div className="recommendation-content">
            {positiveRate > 10 ? (
              <Alert
                message="Cảnh báo: Tỷ lệ dương tính cao"
                description="Tỷ lệ dương tính HIV trong kỳ báo cáo cao hơn mức trung bình. Cần tăng cường các biện pháp phòng ngừa và tầm soát."
                type="warning"
                showIcon
              />
            ) : (
              <Alert
                message="Tỷ lệ dương tính trong mức kiểm soát"
                description="Tỷ lệ dương tính HIV trong kỳ báo cáo nằm trong mức trung bình. Tiếp tục duy trì các biện pháp phòng ngừa hiện tại."
                type="success"
                showIcon
              />
            )}
            
            <Divider />
            
            <p>
              <Text strong>Khuyến nghị hành động:</Text>
            </p>
            <ul>
              <li>Tiếp tục tăng cường tầm soát HIV cho các nhóm nguy cơ cao</li>
              <li>Đảm bảo cung cấp đủ thuốc ARV cho bệnh nhân đang điều trị</li>
              <li>Tăng cường các hoạt động truyền thông về phòng chống HIV/AIDS</li>
              <li>Theo dõi sát sao các ca dương tính mới để đảm bảo tiếp cận điều trị sớm</li>
            </ul>
        </div>
        </Card>
      </div>
    );
  };

  // Render Patient Appointments Tab
  const renderPatientAppointmentsTab = () => {
    const { reports } = reportData;
    console.log("Dữ liệu báo cáo y tế:", reports);

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return <Empty description="Không có dữ liệu lịch sử bệnh nhân" />;
    }

    // Group appointments by patient
    const patientAppointments = reports.reduce((acc, report) => {
      if (!report) return acc;
      
      const schedule = report.schedule || {};
      const healthRecord = report.healthRecord || {};
      
      // Lấy thông tin bệnh nhân từ schedule
      const patient = schedule.patient || {};
      const patientId = patient.id || schedule.patientId;
      
      if (!patientId) return acc;
      
      if (!acc[patientId]) {
        acc[patientId] = {
          patient: {
          id: patientId,
            fullName: patient.fullName,
            phone: patient.phone,
            email: patient.email,
            address: patient.address,
            gender: patient.gender,
            dateOfBirth: patient.dateOfBirth
          },
          appointments: []
        };
      }
      
      acc[patientId].appointments.push({
        id: healthRecord.id || `temp-${Math.random()}`,
        scheduleId: schedule.id,
        date: schedule.date,
        slot: schedule.slot,
        roomCode: schedule.room_code || schedule.roomCode,
        status: schedule.status,
        type: schedule.type,
        doctorId: schedule.doctor_id || schedule.doctorId,
        doctorName: schedule.doctor?.fullName,
        treatmentStatus: healthRecord.treatment_status || healthRecord.treatmentStatus,
        hivStatus: healthRecord.hiv_status || healthRecord.hivStatus,
        bloodType: healthRecord.blood_type || healthRecord.bloodType,
        weight: healthRecord.weight,
        testResults: report.testResults || []
      });
      
      return acc;
    }, {});

    const patientList = Object.values(patientAppointments);
    
    console.log("Số lượng bệnh nhân đã lấy được:", patientList.length);
    console.log("Danh sách bệnh nhân:", patientList);
    
    if (patientList.length === 0) {
      return <Empty description="Không có dữ liệu lịch sử bệnh nhân" />;
    }
    
    return (
      <div className="patient-appointments-tab">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Statistic 
              title="Tổng số bệnh nhân" 
              value={patientList.length} 
              suffix="bệnh nhân" 
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        
        <List
          dataSource={patientList}
          renderItem={item => (
            <Card 
              className="patient-card"
              title={
                <div style={{ cursor: 'pointer' }} onClick={() => togglePatientExpand(item.patient.id)}>
                  <UserOutlined /> {item.patient.fullName || 'Không có tên'}
                  {expandedPatientIds.includes(item.patient.id) ? 
                    <UpOutlined style={{ marginLeft: 8 }} /> : 
                    <DownOutlined style={{ marginLeft: 8 }} />
                  }
                </div>
              }
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Mã bệnh nhân">{item.patient.id || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{item.patient.phone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email">{item.patient.email || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{item.patient.address || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{item.patient.gender || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Số lần khám">{item.appointments.length}</Descriptions.Item>
              </Descriptions>
              
              {expandedPatientIds.includes(item.patient.id) && (
                <>
                  <Divider orientation="left">Lịch sử khám bệnh và kết quả xét nghiệm</Divider>
                  
              <List
                    dataSource={item.appointments}
                    renderItem={appointment => (
                      <Card 
                        className="appointment-card" 
                        type="inner"
                        title={
                          <div style={{ cursor: 'pointer' }} onClick={() => toggleRecordExpand(item.patient.id, appointment.id)}>
                            <CalendarOutlined /> Ngày khám: {appointment.date ? dayjs(appointment.date).format('DD/MM/YYYY') : 'N/A'}
                            {expandedRecordIds[item.patient.id]?.includes(appointment.id) ? 
                              <UpOutlined style={{ marginLeft: 8 }} /> : 
                              <DownOutlined style={{ marginLeft: 8 }} />
                            }
                          </div>
                        }
                        style={{ marginBottom: 8 }}
                      >
                        <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} size="small">
                          <Descriptions.Item label="Mã hồ sơ">{appointment.id}</Descriptions.Item>
                          <Descriptions.Item label="Mã lịch hẹn">{appointment.scheduleId || 'N/A'}</Descriptions.Item>
                          <Descriptions.Item label="Slot">{appointment.slot || 'N/A'}</Descriptions.Item>
                          <Descriptions.Item label="Phòng">{appointment.roomCode || 'N/A'}</Descriptions.Item>
                          <Descriptions.Item label="Loại khám">{appointment.type || 'N/A'}</Descriptions.Item>
                          <Descriptions.Item label="Bác sĩ">{appointment.doctorName || 'N/A'}</Descriptions.Item>
                          <Descriptions.Item label="Trạng thái">
                            {appointment.treatmentStatus === 'Đã khám' ? 
                              <Tag color="green">Đã khám</Tag> : 
                              appointment.treatmentStatus === 'Đang chờ khám' ? 
                                <Tag color="orange">Đang chờ khám</Tag> : 
                                appointment.treatmentStatus === 'Không đến' ?
                                  <Tag color="red">Không đến</Tag> :
                                  <Tag color="default">{appointment.treatmentStatus || 'Chưa xác định'}</Tag>
                            }
                          </Descriptions.Item>
                          <Descriptions.Item label="Nhóm máu">{appointment.bloodType || 'Chưa xác định'}</Descriptions.Item>
                          <Descriptions.Item label="Cân nặng">{appointment.weight ? `${appointment.weight} kg` : 'Chưa xác định'}</Descriptions.Item>
                          <Descriptions.Item label="HIV">
                            {appointment.hivStatus === 'Dương tính' || appointment.hivStatus === 'Positive' ? 
                              <Tag color="red">Dương tính</Tag> : 
                              appointment.hivStatus === 'Âm tính' || appointment.hivStatus === 'Negative' ? 
                                <Tag color="green">Âm tính</Tag> : 
                                <Tag color="default">{appointment.hivStatus || 'Chưa xác định'}</Tag>
                            }
                          </Descriptions.Item>
                        </Descriptions>

                        {expandedRecordIds[item.patient.id]?.includes(appointment.id) && (
                          <div style={{ marginTop: 16 }}>
                            <Divider orientation="left" plain>Kết quả xét nghiệm</Divider>
                            
                            {appointment.testResults && appointment.testResults.length > 0 ? (
                              <Table
                                dataSource={appointment.testResults}
                                rowKey={(record, index) => `${appointment.id}-test-${index}`}
                          size="small"
                                pagination={false}
                                columns={[
                                  {
                                    title: 'ID',
                                    dataIndex: 'id',
                                    key: 'id',
                                    width: 60
                                  },
                                  {
                                    title: 'Loại xét nghiệm',
                                    dataIndex: 'type',
                                    key: 'type',
                                    render: (text) => text || 'N/A'
                                  },
                                  {
                                    title: 'Kết quả',
                                    dataIndex: 'result',
                                    key: 'result',
                                    render: (result) => result || 'Chưa có kết quả'
                                  },
                                  {
                                    title: 'Đơn vị',
                                    dataIndex: 'unit',
                                    key: 'unit',
                                    render: (unit) => unit || 'N/A'
                                  },
                                  {
                                    title: 'Ngày thực hiện',
                                    dataIndex: 'actual_result_time',
                                    key: 'actualResultTime',
                                    render: (time) => time ? dayjs(time).format('DD/MM/YYYY HH:mm') : 'N/A'
                                  },
                                  {
                                    title: 'Ghi chú',
                                    dataIndex: 'note',
                                    key: 'note',
                                    render: (note) => note || 'Không có ghi chú'
                                  }
                                ]}
                              />
                            ) : (
                              <Empty description="Không có kết quả xét nghiệm" />
                      )}
                    </div>
                        )}
                      </Card>
                )}
              />
                </>
              )}
            </Card>
          )}
        />
      </div>
    );
  };

  return (
      <div className="medical-report-container">
        <div className="report-actions">
        <Space>
              <Button
                icon={<FilterOutlined />}
            onClick={toggleFilters}
              >
                Bộ lọc
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
            loading={exportLoading}
              >
                Xuất Excel
              </Button>
        </Space>
      </div>

          {showFilters && (
        <Card className="filter-card">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Khoảng thời gian:</Text>
              <div style={{ marginTop: 8 }}>
                <RangePicker 
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <Button type="primary" onClick={loadReportData}>
                    Áp dụng
                  </Button>
          </Space>
            </Card>
      )}

      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="report-tabs"
          items={[
            {
              key: 'overview',
              label: 'Tổng quan',
              children: renderOverviewTab()
            },
            {
              key: 'hiv-statistics',
              label: 'Thống kê HIV',
              children: renderHIVStatisticsTab()
            },
            {
              key: 'patient-appointments',
              label: 'Lịch sử bệnh nhân',
              children: renderPatientAppointmentsTab()
            }
          ]}
        />
      </Spin>
      </div>
  );
};

export default MedicalReport; 