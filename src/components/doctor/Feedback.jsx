import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Pagination } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/doctor/Feedback.css';

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

/**
 * Interface cho dữ liệu feedback từ API
 * @typedef {Object} FeedbackData
 * @property {number} id - ID của feedback
 * @property {string} patientName - Tên bệnh nhân
 * @property {number} rating - Số sao đánh giá (1-5)
 * @property {string} comment - Nội dung đánh giá
 * @property {string} date - Ngày đánh giá (format: YYYY-MM-DD)
 * @property {string} treatmentType - Loại điều trị
 */

/**
 * Interface cho response từ API
 * @typedef {Object} FeedbackResponse
 * @property {FeedbackData[]} data - Mảng các feedback
 * @property {number} total - Tổng số feedback
 * @property {number} page - Trang hiện tại
 * @property {number} pageSize - Số lượng feedback mỗi trang
 */

// TODO: Thay thế bằng API endpoint thực tế
const API_ENDPOINTS = {
  GET_FEEDBACKS: '/api/feedbacks/doctor', // GET /api/feedbacks/doctor/{doctorId}?page={page}&pageSize={pageSize}&rating={rating}&sortBy={sortBy}
  GET_FEEDBACK_STATS: '/api/feedbacks/doctor/stats', // GET /api/feedbacks/doctor/{doctorId}/stats
};

// Dữ liệu mẫu - sẽ được thay thế bằng dữ liệu từ API
const mockFeedbacks = [
  {
    id: 1,
    patientName: 'Nguyễn Văn X',
    rating: 5,
    comment: 'Bác sĩ rất tận tâm và chuyên nghiệp',
    date: '2023-11-15',
    treatmentType: 'Điều trị HIV',
  },
  {
    id: 2,
    patientName: 'Trần Thị Y',
    rating: 4,
    comment: 'Tư vấn rất chi tiết và dễ hiểu',
    date: '2023-11-14',
    treatmentType: 'Tư vấn sức khỏe',
  },
];

/**
 * Component hiển thị đánh giá của bệnh nhân cho bác sĩ
 * @param {Object} props - Component props
 * @param {number} props.doctorId - ID của bác sĩ
 */
const Feedback = ({ doctorId }) => {
  // State management
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  });

  const itemsPerPage = 5;

  useEffect(() => {
    fetchFeedbacks();
  }, [doctorId, currentPage, filterRating, sortBy]); // Re-fetch khi các filter thay đổi

  useEffect(() => {
    calculateStats();
  }, [feedbacks]);

  /**
   * Hàm lấy danh sách feedback từ API
   * TODO: Implement API call
   * Expected API Response:
   * {
   *   data: Array<FeedbackData>,
   *   total: number,
   *   page: number,
   *   pageSize: number
   * }
   */
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      // TODO: Thay thế mock data bằng API call thực tế
      // const response = await fetch(
      //   `${API_ENDPOINTS.GET_FEEDBACKS}/${doctorId}?` + 
      //   `page=${currentPage}&` +
      //   `pageSize=${itemsPerPage}&` +
      //   `rating=${filterRating}&` +
      //   `sortBy=${sortBy}`
      // );
      // const data = await response.json();
      // setFeedbacks(data.data);
      // setTotalPages(Math.ceil(data.total / data.pageSize));

      // Mock API call
      setTimeout(() => {
        setFeedbacks(mockFeedbacks);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Không thể tải đánh giá');
      setLoading(false);
    }
  };

  /**
   * Hàm tính toán thống kê từ danh sách feedback
   * TODO: Có thể chuyển sang lấy từ API endpoint riêng để tối ưu performance
   */
  const calculateStats = () => {
    if (feedbacks.length === 0) return;

    // TODO: Thay thế bằng API call thực tế
    // const response = await fetch(`${API_ENDPOINTS.GET_FEEDBACK_STATS}/${doctorId}`);
    // const stats = await response.json();
    // setStats(stats);

    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    const distribution = [0, 0, 0, 0, 0];
    feedbacks.forEach(fb => distribution[fb.rating - 1]++);

    setStats({
      averageRating: totalRating / feedbacks.length,
      totalFeedbacks: feedbacks.length,
      ratingDistribution: distribution,
    });
  };

  /**
   * Hàm lọc feedback theo các tiêu chí
   * @returns {Array<FeedbackData>} Danh sách feedback đã được lọc
   */
  const filteredFeedbacks = () => {
    let result = [...feedbacks];

    if (filterRating !== 'all') {
      result = result.filter(fb => fb.rating === parseInt(filterRating));
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      return b.rating - a.rating;
    });

    return result;
  };

  /**
   * Hàm phân trang danh sách feedback
   * @returns {Array<FeedbackData>} Danh sách feedback của trang hiện tại
   */
  const paginatedFeedbacks = () => {
    const filtered = filteredFeedbacks();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredFeedbacks().length / itemsPerPage);

  /**
   * Hàm render hệ thống sao đánh giá
   * @param {number} rating - Số sao (1-5)
   * @returns {JSX.Element[]} Mảng các component sao
   */
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  /**
   * Hàm render phân trang
   * @returns {JSX.Element} Component phân trang
   */
  const renderPagination = () => {
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  // Cấu hình cho biểu đồ thống kê
  const chartData = {
    labels: ['1 sao', '2 sao', '3 sao', '4 sao', '5 sao'],
    datasets: [
      {
        label: 'Số lượng đánh giá',
        data: stats.ratingDistribution,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Phân bố đánh giá',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="feedback-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="feedback-error">{error}</div>;
  }

  // Main render
  return (
    <div className="feedback-container">
      {/* Tổng quan đánh giá */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="text-center">
              <h2 className="rating-average">{stats.averageRating.toFixed(1)}</h2>
              <div className="rating-stars">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-muted">
                Dựa trên {stats.totalFeedbacks} đánh giá
              </p>
            </Col>
            <Col md={8}>
              <div className="rating-distribution">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bộ lọc */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Lọc theo số sao</Form.Label>
                <Form.Select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sắp xếp theo</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Mới nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Danh sách đánh giá */}
      <div className="feedback-list">
        {paginatedFeedbacks().map((feedback) => (
          <Card key={feedback.id} className="mb-3 feedback-item">
            <Card.Body>
              <div className="feedback-header">
                <h5 className="feedback-patient-name">{feedback.patientName}</h5>
                <div className="feedback-rating">
                  {renderStars(feedback.rating)}
                </div>
              </div>
              <p className="feedback-date text-muted">
                {new Date(feedback.date).toLocaleDateString('vi-VN')}
              </p>
              <p className="feedback-treatment-type">
                <strong>Loại điều trị:</strong> {feedback.treatmentType}
              </p>
              <p className="feedback-comment">{feedback.comment}</p>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Phân trang */}
      <div className="d-flex justify-content-center mt-4">
        {renderPagination()}
      </div>
    </div>
  );
};

export default Feedback; 