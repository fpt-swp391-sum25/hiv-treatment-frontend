import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
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
  totalPatients: 150,
  activePatients: 120,
  successfulTreatments: 95,
  averageTreatmentDuration: "6 tháng",
  patientsByMonth: {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    datasets: [{
      label: 'Số lượng bệnh nhân',
      data: [65, 75, 85, 95, 110, 120],
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
      data: [40, 35, 25, 20],
      backgroundColor: 'rgba(54, 162, 235, 0.8)'
    }]
  }
};

const Statistics = ({ doctorId }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, [doctorId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // TODO: Thay thế bằng API call thực tế
      setTimeout(() => {
        setStatistics(mockStatistics);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê');
      setLoading(false);
    }
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
      {/* Thẻ thống kê tổng quan */}
      <Row className="statistics-cards mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Tổng số bệnh nhân</h6>
              <h3 className="stat-value">{statistics?.totalPatients}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Bệnh nhân đang điều trị</h6>
              <h3 className="stat-value">{statistics?.activePatients}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Điều trị thành công</h6>
              <h3 className="stat-value">{statistics?.successfulTreatments}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="stat-title">Thời gian điều trị TB</h6>
              <h3 className="stat-value">{statistics?.averageTreatmentDuration}</h3>
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
                  data={statistics?.patientsByMonth}
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
                  data={statistics?.treatmentSuccess}
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
                  data={statistics?.diseaseDistribution}
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