import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Dropdown } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { FaFileDownload, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import '../../styles/doctor/Statistics.css';

// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data cho thống kê
const mockStatistics = {
  totalPatients: 100,
  activePatients: 70,
  successfulTreatments: 45,
  averageTreatmentDuration: "6 tháng",
  patientsByMonth: {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    datasets: [{
      label: 'Số lượng bệnh nhân',
      data: [10, 15, 35, 25, 60, 100],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  treatmentSuccess: {
    labels: ['Thành công', 'Đang điều trị', 'Ngưng điều trị'],
    datasets: [{
      data: [70, 20, 10],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
      ]
    }]
  },
  diseaseDistribution: {
    labels: ['HIV Giai đoạn 1', 'HIV Giai đoạn 2', 'HIV Giai đoạn 3', 'AIDS'],
    datasets: [{
      label: 'Số lượng bệnh nhân',
      data: [40, 20, 10, 30],
      backgroundColor: 'rgba(54, 162, 235, 0.8)'
    }]
  }
};

// Dữ liệu thống kê theo các khoảng thời gian khác nhau
const mockStatisticsByTimeRange = {
  '30days': {
    totalPatients: 85,
    activePatients: 60,
    successfulTreatments: 35,
    averageTreatmentDuration: "5 tháng",
    patientsByMonth: {
      labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [15, 25, 20, 25],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    treatmentSuccess: {
      labels: ['Thành công', 'Đang điều trị', 'Ngưng điều trị'],
      datasets: [{
        data: [60, 30, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ]
      }]
    },
    diseaseDistribution: {
      labels: ['HIV Giai đoạn 1', 'HIV Giai đoạn 2', 'HIV Giai đoạn 3', 'AIDS'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [35, 20, 10, 20],
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }]
    }
  },
  '90days': {
    totalPatients: 95,
    activePatients: 65,
    successfulTreatments: 40,
    averageTreatmentDuration: "5.5 tháng",
    patientsByMonth: {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [30, 35, 30],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    treatmentSuccess: {
      labels: ['Thành công', 'Đang điều trị', 'Ngưng điều trị'],
      datasets: [{
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ]
      }]
    },
    diseaseDistribution: {
      labels: ['HIV Giai đoạn 1', 'HIV Giai đoạn 2', 'HIV Giai đoạn 3', 'AIDS'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [38, 20, 10, 27],
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }]
    }
  },
  '180days': {
    totalPatients: 100,
    activePatients: 70,
    successfulTreatments: 45,
    averageTreatmentDuration: "6 tháng",
    patientsByMonth: {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [10, 15, 35, 25, 60, 100],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    treatmentSuccess: {
      labels: ['Thành công', 'Đang điều trị', 'Ngưng điều trị'],
      datasets: [{
        data: [70, 20, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ]
      }]
    },
    diseaseDistribution: {
      labels: ['HIV Giai đoạn 1', 'HIV Giai đoạn 2', 'HIV Giai đoạn 3', 'AIDS'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [40, 20, 10, 30],
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }]
    }
  },
  '365days': {
    totalPatients: 120,
    activePatients: 75,
    successfulTreatments: 55,
    averageTreatmentDuration: "7 tháng",
    patientsByMonth: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [25, 35, 30, 30],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    treatmentSuccess: {
      labels: ['Thành công', 'Đang điều trị', 'Ngưng điều trị'],
      datasets: [{
        data: [75, 15, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ]
      }]
    },
    diseaseDistribution: {
      labels: ['HIV Giai đoạn 1', 'HIV Giai đoạn 2', 'HIV Giai đoạn 3', 'AIDS'],
      datasets: [{
        label: 'Số lượng bệnh nhân',
        data: [45, 25, 15, 35],
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }]
    }
  }
};

// Dữ liệu mặc định cho biểu đồ khi không có dữ liệu
const defaultChartData = {
  labels: ['Không có dữ liệu'],
  datasets: [{
    label: 'Không có dữ liệu',
    data: [0],
    borderColor: 'rgb(200, 200, 200)',
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
  }]
};

const Statistics = ({ doctorId }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('180days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchStatistics();
  }, [doctorId, timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // TODO: Thay thế bằng API call thực tế
      // const response = await fetch(`/api/statistics/doctor/${doctorId}?timeRange=${timeRange}`);
      // const data = await response.json();
      // setStatistics(data);

      // Mock API call với dữ liệu theo khoảng thời gian
      setTimeout(() => {
        if (timeRange === 'custom') {
          // Xử lý khoảng thời gian tùy chỉnh
          setStatistics(mockStatistics); // Tạm thời sử dụng dữ liệu mặc định
        } else {
          setStatistics(mockStatisticsByTimeRange[timeRange] || mockStatistics);
        }
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê');
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyCustomDateRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setTimeRange('custom');
      fetchStatistics();
    }
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export
    alert('Đang xuất báo cáo PDF...');
    // Trong thực tế, sẽ sử dụng thư viện như jsPDF hoặc gọi API để tạo PDF
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export
    alert('Đang xuất báo cáo Excel...');
    // Trong thực tế, sẽ sử dụng thư viện như xlsx hoặc gọi API để tạo Excel
  };

  // Chuẩn bị dữ liệu biểu đồ an toàn
  const getPatientsChartData = () => {
    return statistics?.patientsByMonth || defaultChartData;
  };

  const getTreatmentSuccessData = () => {
    return statistics?.treatmentSuccess || defaultChartData;
  };

  const getDiseaseDistributionData = () => {
    return statistics?.diseaseDistribution || defaultChartData;
  };

  if (loading) return (
    <div className="statistics-loading">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="statistics-error">
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    </div>
  );

  return (
    <div className="statistics-container">
      {/* Bộ lọc thời gian và nút xuất báo cáo */}
      <Row className="statistics-filters mb-4">
        <Col md={8}>
          <Card className="filter-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="me-2" />
                <h6 className="mb-0 me-3">Khoảng thời gian:</h6>
                <div className="time-range-buttons">
                  <Button 
                    variant={timeRange === '30days' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => handleTimeRangeChange('30days')}
                  >
                    30 ngày
                  </Button>
                  <Button 
                    variant={timeRange === '90days' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => handleTimeRangeChange('90days')}
                  >
                    3 tháng
                  </Button>
                  <Button 
                    variant={timeRange === '180days' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    className="me-2"
                    onClick={() => handleTimeRangeChange('180days')}
                  >
                    6 tháng
                  </Button>
                  <Button 
                    variant={timeRange === '365days' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => handleTimeRangeChange('365days')}
                  >
                    1 năm
                  </Button>
                </div>
              </div>
              
              <div className="custom-date-range mt-3">
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 me-3">Tùy chỉnh:</h6>
                  <Form.Group className="me-2">
                    <Form.Control 
                      type="date" 
                      name="startDate"
                      value={customDateRange.startDate}
                      onChange={handleCustomDateChange}
                      size="sm"
                    />
                  </Form.Group>
                  <span className="mx-2">đến</span>
                  <Form.Group className="me-2">
                    <Form.Control 
                      type="date" 
                      name="endDate"
                      value={customDateRange.endDate}
                      onChange={handleCustomDateChange}
                      size="sm"
                    />
                  </Form.Group>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={applyCustomDateRange}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="export-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaFileDownload className="me-2" />
                <h6 className="mb-0 me-3">Xuất báo cáo:</h6>
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-export">
                    Xuất báo cáo
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={exportToPDF}>
                      <i className="far fa-file-pdf me-2"></i>PDF
                    </Dropdown.Item>
                    <Dropdown.Item onClick={exportToExcel}>
                      <i className="far fa-file-excel me-2"></i>Excel
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Thẻ thống kê tổng quan */}
      <Row className="statistics-cards mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Tổng số bệnh nhân</h6>
              <h3 className="stat-value">{statistics?.totalPatients || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Bệnh nhân đang điều trị</h6>
              <h3 className="stat-value">{statistics?.activePatients || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Điều trị thành công</h6>
              <h3 className="stat-value">{statistics?.successfulTreatments || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Thời gian điều trị TB</h6>
              <h3 className="stat-value">{statistics?.averageTreatmentDuration || "N/A"}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row className="statistics-charts">
        <Col md={8} className="mb-4">
          <Card>
            <Card.Body>
              <h5 className="chart-title">Số lượng bệnh nhân theo thời gian</h5>
              <div className="chart-container">
                <Line 
                  data={getPatientsChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <h5 className="chart-title">Tỷ lệ điều trị thành công</h5>
              <div className="chart-container">
                <Pie 
                  data={getTreatmentSuccessData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="chart-title">Phân bố bệnh nhân theo giai đoạn bệnh</h5>
              <div className="chart-container">
                <Bar 
                  data={getDiseaseDistributionData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics; 