import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Statistic, Row, Col, Tabs, Button,
  Space, DatePicker, Spin, Empty, Table, Tag,
  Divider, Typography, Alert, List, Descriptions, Input
} from 'antd';
import {
  FileSearchOutlined, ExperimentOutlined, MedicineBoxOutlined, TeamOutlined,
  UserOutlined, CalendarOutlined, UpOutlined, DownOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getMedicalReportData } from '../../../../services/report.service';
import ReportFilters from '../ReportFilters';
import '../../../../styles/manager/MedicalReport.css';


const { Text, Title } = Typography;

// Constants
const HIV_COLORS = {
  positive: '#ff4d4f',
  negative: '#52c41a',
  unknown: '#faad14'
};

const MedicalReport = ({ dateRange, onError, onDateRangeChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [reportData, setReportData] = useState({
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
  });

  const normalizeString = (str) => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // State cho tab Patient Appointments
  const [expandedPatientIds, setExpandedPatientIds] = useState([]);
  const [expandedRecordIds, setExpandedRecordIds] = useState({});



  // State cho search bệnh nhân
  const [searchPatientName, setSearchPatientName] = useState('');

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

  // Filtered HIV trends based on dateRange
  const filteredHivTrends = useMemo(() => {
    const { hivTrends = [] } = reportData.statistics;

    // Nếu không có dateRange, trả về tất cả dữ liệu
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return hivTrends;
    }

    const startDate = dayjs(dateRange[0]);
    const endDate = dayjs(dateRange[1]);

    return hivTrends.filter(trend => {
      if (!trend.month) return false;

      // Parse month từ format "2025-06" thành dayjs object
      const trendDate = dayjs(trend.month + '-01'); // Thêm ngày để tạo date hợp lệ

      // Kiểm tra xem tháng có nằm trong khoảng dateRange không
      return trendDate.isBetween(startDate, endDate, 'month', '[]');
    });
  }, [reportData.statistics, dateRange]);

  // Filtered HIV statistics based on filtered trends
  const filteredHivStatistics = useMemo(() => {
    if (!filteredHivTrends || filteredHivTrends.length === 0) {
      return {
        totalPositiveHIV: 0,
        totalNegativeHIV: 0,
        totalUnknownHIV: 0,
        totalHIVTests: 0,
        positiveRate: 0
      };
    }

    const totals = filteredHivTrends.reduce((acc, trend) => {
      acc.totalPositiveHIV += trend.positive || 0;
      acc.totalNegativeHIV += trend.negative || 0;
      acc.totalUnknownHIV += trend.unknown || 0;
      return acc;
    }, {
      totalPositiveHIV: 0,
      totalNegativeHIV: 0,
      totalUnknownHIV: 0
    });

    const totalHIVTests = totals.totalPositiveHIV + totals.totalNegativeHIV + totals.totalUnknownHIV;
    const positiveRate = totalHIVTests > 0
      ? Math.round((totals.totalPositiveHIV / totalHIVTests) * 100)
      : 0;

    return {
      ...totals,
      totalHIVTests,
      positiveRate
    };
  }, [filteredHivTrends]);

  // Filtered reports based on dateRange
  const filteredReports = useMemo(() => {
    const { reports = [] } = reportData;

    // Nếu không có dateRange, trả về tất cả dữ liệu
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return reports;
    }

    const startDate = dayjs(dateRange[0]);
    const endDate = dayjs(dateRange[1]);

    return reports.filter(report => {
      if (!report || !report.schedule || !report.schedule.date) return false;

      const appointmentDate = dayjs(report.schedule.date);

      // Kiểm tra xem ngày hẹn có nằm trong khoảng dateRange không
      return appointmentDate.isBetween(startDate, endDate, 'day', '[]');
    });
  }, [reportData.reports, dateRange]);

  // Filtered overview statistics based on filtered reports
  const filteredOverviewStatistics = useMemo(() => {
    if (!filteredReports || filteredReports.length === 0) {
      return {
        totalAppointments: 0,
        totalTestOrders: 0,
        totalRegimens: 0, // Sẽ lấy từ API gốc vì không phụ thuộc thời gian
        totalPatients: 0,
        totalPositiveHIV: 0,
        totalNegativeHIV: 0
      };
    }

    // Tính toán các thống kê từ filteredReports
    let totalAppointments = 0;
    const patientIds = new Set();

    filteredReports.forEach(report => {
      const healthRecord = report.healthRecord || {};
      const schedule = report.schedule || {};

      // Đếm lịch hẹn đã hoàn thành
      if (healthRecord.treatment_status === "Đã khám" || healthRecord.treatmentStatus === "Đã khám") {
        totalAppointments++;
      }

      // Đếm bệnh nhân unique
      const patientId = schedule.patient?.id || schedule.patientId;
      if (patientId) {
        patientIds.add(patientId);
      }
    });

    // Sử dụng cùng nguồn dữ liệu như tab "Thống kê HIV" để tính số xét nghiệm và HIV
    const { totalHIVTests, totalPositiveHIV, totalNegativeHIV } = filteredHivStatistics;

    return {
      totalAppointments,
      totalTestOrders: totalHIVTests, // Sử dụng từ filteredHivStatistics
      totalRegimens: reportData.statistics.totalRegimens, // Giữ nguyên từ API
      totalPatients: patientIds.size,
      totalPositiveHIV,
      totalNegativeHIV
    };
  }, [filteredReports, filteredHivStatistics, reportData.statistics.totalRegimens]);

  // Memoized patient list
  const patientList = useMemo(() => {
    const reports = filteredReports;

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return [];
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
        testOrders: report.testOrders || []
      });

      return acc;
    }, {});

    return Object.values(patientAppointments);
  }, [filteredReports]);

  // Filtered patient list based on search
  const filteredPatientList = useMemo(() => {
    if (!searchPatientName.trim()) {
      return patientList;
    }

    return patientList.filter(item =>
      normalizeString(item.patient.fullName?.toLowerCase()).includes(normalizeString(searchPatientName.toLowerCase())) ||
      normalizeString(item.patient.id?.toString()).includes(normalizeString(searchPatientName))
    );
  }, [patientList, searchPatientName]);

  // Handlers
  const handleDateRangeChange = (dates) => {
    if (onDateRangeChange) {
      onDateRangeChange(dates);
    }
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
      setReportData(response);
    } catch (error) {
      console.error('Error loading medical report data:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, onError]);







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
    // Sử dụng dữ liệu đã được filter và tính toán lại
    const statistics = filteredOverviewStatistics;

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
                value={statistics.totalTestOrders}
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
                {dateRange && dateRange[0] && dateRange[1] ? (
                  <>Trong khoảng thời gian từ <Text strong>{dayjs(dateRange[0]).format('DD/MM/YYYY')}</Text> đến <Text strong>{dayjs(dateRange[1]).format('DD/MM/YYYY')}</Text>, h</>
                ) : (
                  <>H</>
                )}ệ thống đã ghi nhận tổng cộng <Text strong>{statistics.totalPositiveHIV + statistics.totalNegativeHIV}</Text> xét nghiệm HIV,
                trong đó có <Text strong style={{ color: '#ff4d4f' }}>{statistics.totalPositiveHIV}</Text> ca dương tính
                và <Text strong style={{ color: '#52c41a' }}>{statistics.totalNegativeHIV}</Text> ca âm tính.
              </p>
              <p>
                Tỷ lệ dương tính HIV chiếm <Text strong>{Math.round((statistics.totalPositiveHIV / (statistics.totalPositiveHIV + statistics.totalNegativeHIV || 1)) * 100)}%</Text> tổng số ca xét nghiệm.
              </p>
              {/* Đã loại bỏ phần hiển thị xu hướng gần đây để giảm độ phức tạp khi phân tích */}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Render HIV Statistics Tab
  const renderHIVStatisticsTab = () => {
    const { statistics } = reportData;

    // Sử dụng dữ liệu đã được filter và tính toán lại
    const { totalHIVTests, totalPositiveHIV, totalNegativeHIV } = filteredHivStatistics;

    // Kiểm tra dữ liệu HIV trends đã được filter
    const hasValidTrends = Array.isArray(filteredHivTrends) && filteredHivTrends.length > 0;

    return (
      <div className="hiv-statistics-tab">
        {/* Báo cáo tổng quan HIV */}
        <Card title="Báo cáo tổng quan HIV" className="report-card">
          <div className="report-content">
            <Title level={4}>Tóm tắt</Title>
            <p>
              Hệ thống đã thực hiện tổng cộng <Text strong>{totalHIVTests}</Text> xét nghiệm HIV.
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
                  value={totalPositiveHIV || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<ExperimentOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Số ca âm tính"
                  value={totalNegativeHIV || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
                />
              </Col>
            </Row>

            <Divider />

            {/* Đã loại bỏ phần Phân tích chi tiết theo yêu cầu */}
          </div>
        </Card>

        {/* Bảng phân tích theo tháng */}
        {hasValidTrends ? (
          <Card title="Phân tích chi tiết theo tháng" style={{ marginTop: 16 }}>
            <Table
              dataSource={filteredHivTrends}
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
                    // Tính tổng số ca bao gồm cả ca chưa xác định
                    const total = record.positive + record.negative + record.unknown;
                    const rate = total > 0 ? Math.round((record.positive / total) * 100) : 0;
                    return `${rate}%`;
                  }
                }
              ]}
            />
          </Card>
        ) : (
          <Card title="Phân tích chi tiết theo tháng" style={{ marginTop: 16 }}>
            <Empty description="Không có dữ liệu HIV trong khoảng thời gian đã chọn" />
          </Card>
        )}

        {/* Khuyến nghị */}
        <Card title="Khuyến nghị" style={{ marginTop: 16 }}>
          <div className="recommendation-content">
            {/* Đã loại bỏ khung cảnh báo theo yêu cầu */}

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
    if (!patientList.length) {
      return <Empty description="Không có dữ liệu lịch sử bệnh nhân" />;
    }

    return (
      <div className="patient-appointments-tab">
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
          <Col span={12}>
            <Statistic
              title="Tổng số bệnh nhân"
              value={searchPatientName.trim() ? `${filteredPatientList.length}/${patientList.length}` : patientList.length}
              suffix="bệnh nhân"
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Input.Search
              placeholder="Tìm kiếm theo tên bệnh nhân hoặc mã bệnh nhân..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchPatientName}
              onChange={(e) => setSearchPatientName(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </Col>
        </Row>

        <List
          dataSource={filteredPatientList}
          locale={{
            emptyText: searchPatientName.trim()
              ? `Không tìm thấy bệnh nhân nào với từ khóa "${searchPatientName}"`
              : "Không có dữ liệu bệnh nhân"
          }}
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
                {/* Đã loại bỏ thông tin số điện thoại */}
                {/* Đã loại bỏ thông tin email */}
                {/* Đã loại bỏ thông tin địa chỉ */}
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

                            {appointment.testOrders && appointment.testOrders.length > 0 ? (
                              <Table
                                dataSource={appointment.testOrders}
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

      {/* Bộ lọc cho tất cả các tab */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <ReportFilters
              onFilterChange={({ filterType, selectedDate }) => {
                if (selectedDate) {
                  const start = dayjs(selectedDate);
                  let end = start.endOf(filterType);
                  onDateRangeChange([start, end]);
                } else {
                  onDateRangeChange(null);
                }
              }}
              initialFilters={{
                filterType: 'month',
                selectedDate: dateRange?.[0]?.toISOString() || null,
              }}
            />
          </Col>

        </Row>
      </div>

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