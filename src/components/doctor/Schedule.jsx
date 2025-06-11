import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import vi from 'date-fns/locale/vi';
import { Card, Row, Col, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/doctor/Schedule.css';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Dữ liệu giả cho lịch làm việc
const mockAppointments = [
  {
    id: 1,
    title: 'Nguyễn Văn X',
    start: new Date(2023, 12, 15, 9, 0),
    end: new Date(2023, 10, 15, 10, 0),
    status: 'CONFIRMED',
    patientInfo: 'Nam, 35 tuổi, Điều trị theo dõi HIV giai đoạn 2'
  },
  {
    id: 2,
    title: 'Trần Thị Y',
    start: new Date(2023, 10, 15, 11, 0),
    end: new Date(2023, 10, 15, 12, 0),
    status: 'PENDING',
    patientInfo: 'Nữ, 28 tuổi, Tư vấn điều trị dự phòng'
  },
  {
    id: 3,
    title: 'Lê Văn Z',
    start: new Date(2023, 10, 16, 14, 0),
    end: new Date(2023, 10, 16, 15, 0),
    status: 'CANCELLED',
    patientInfo: 'Nam, 42 tuổi, Khám định kỳ'
  },
  {
    id: 4,
    title: 'Phạm Thị A',
    start: new Date(2023, 10, 17, 10, 0),
    end: new Date(2023, 10, 17, 11, 0),
    status: 'CONFIRMED',
    patientInfo: 'Nữ, 32 tuổi, Tư vấn sức khỏe'
  },
  {
    id: 5,
    title: 'Hoàng Văn B',
    start: new Date(2023, 10, 18, 9, 0),
    end: new Date(2023, 10, 18, 10, 0),
    status: 'CONFIRMED',
    patientInfo: 'Nam, 45 tuổi, Điều trị theo dõi'
  }
];

// Cập nhật ngày giờ của các cuộc hẹn để luôn hiển thị trong tuần hiện tại
const updateAppointmentDates = (appointments) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Chủ Nhật, 1-6 = Thứ 2 - Thứ 7
  const mondayThisWeek = new Date(today);
  mondayThisWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  return appointments.map((apt, index) => {
    const newStart = new Date(apt.start);
    const newEnd = new Date(apt.end);

    // Phân bố các cuộc hẹn trong tuần hiện tại
    const daysToAdd = index % 5; // 0-4 tương ứng với Thứ 2 - Thứ 6

    newStart.setFullYear(today.getFullYear());
    newStart.setMonth(today.getMonth());
    newStart.setDate(mondayThisWeek.getDate() + daysToAdd);

    newEnd.setFullYear(today.getFullYear());
    newEnd.setMonth(today.getMonth());
    newEnd.setDate(mondayThisWeek.getDate() + daysToAdd);

    return {
      ...apt,
      start: newStart,
      end: newEnd
    };
  });
};

const Schedule = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Giả lập API call với dữ liệu mẫu
      setTimeout(() => {
        const updatedAppointments = updateAppointmentDates(mockAppointments);
        setAppointments(updatedAppointments);
        setFilteredAppointments(updatedAppointments);
        setLoading(false);
      }, 800);

      // TODO: Khi API thực sự sẵn sàng, bỏ comment phần này
      /*
      const response = await fetch(`/api/appointments/doctor/${doctorId}`);
      const data = await response.json();
      
      const formattedAppointments = data.map(apt => ({
        id: apt.id,
        title: apt.patientName,
        start: new Date(apt.startTime),
        end: new Date(apt.endTime),
        status: apt.status,
        patientInfo: apt.patientInfo
      }));
      
      setAppointments(formattedAppointments);
      setFilteredAppointments(formattedAppointments);
      */
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientInfo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event);
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#3498db',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    switch (event.status) {
      case 'CONFIRMED':
        style.backgroundColor = '#2ecc71';
        break;
      case 'PENDING':
        style.backgroundColor = '#f1c40f';
        break;
      case 'CANCELLED':
        style.backgroundColor = '#e74c3c';
        break;
      default:
        break;
    }

    return {
      style
    };
  };

  return (
    <div className="schedule-container">
      <Row className="mb-3">
        <Col md={8}>
          <InputGroup>
            <Form.Control
              placeholder="Tìm kiếm theo tên bệnh nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PENDING">Đang chờ</option>
              <option value="CANCELLED">Đã hủy</option>
            </Form.Select>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
            >
              Đặt lại
            </Button>
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col md={8}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="calendar-card">
                <Card.Body>
                  {loading ? (
                    <div className="loading-spinner">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {error}
                    </div>
                  ) : (
                    <Calendar
                      localizer={localizer}
                      events={filteredAppointments}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 500 }}
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={handleSelectEvent}
                      views={['month', 'week', 'day']}
                      messages={{
                        next: "Tiếp",
                        previous: "Trước",
                        today: "Hôm nay",
                        month: "Tháng",
                        week: "Tuần",
                        day: "Ngày"
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Col>
        <Col md={4}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="appointment-details-card">
                <Card.Body>
                  <h4 className="section-title">Chi tiết cuộc hẹn</h4>
                  {selectedAppointment ? (
                    <div className="appointment-details">
                      <div className="detail-item">
                        <span className="detail-label">Bệnh nhân:</span>
                        <span className="detail-value">{selectedAppointment.title}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Thời gian:</span>
                        <span className="detail-value">
                          {format(selectedAppointment.start, 'HH:mm - dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Trạng thái:</span>
                        <Badge
                          bg={
                            selectedAppointment.status === 'CONFIRMED' ? 'success' :
                              selectedAppointment.status === 'PENDING' ? 'warning' :
                                'danger'
                          }
                        >
                          {selectedAppointment.status}
                        </Badge>
                      </div>
                      {selectedAppointment.patientInfo && (
                        <div className="patient-info mt-3">
                          <h5>Thông tin bệnh nhân</h5>
                          <p>{selectedAppointment.patientInfo}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted">Chọn một cuộc hẹn để xem chi tiết</p>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="stats-card mt-3">
                <Card.Body>
                  <h4 className="section-title">Thống kê hôm nay</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Tổng cuộc hẹn</span>
                      <span className="stat-value">
                        {appointments.filter(apt =>
                          format(apt.start, 'dd/MM/yyyy') === format(new Date(), 'dd/MM/yyyy')
                        ).length}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Đã xác nhận</span>
                      <span className="stat-value confirmed">
                        {appointments.filter(apt =>
                          format(apt.start, 'dd/MM/yyyy') === format(new Date(), 'dd/MM/yyyy') &&
                          apt.status === 'CONFIRMED'
                        ).length}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Đang chờ</span>
                      <span className="stat-value pending">
                        {appointments.filter(apt =>
                          format(apt.start, 'dd/MM/yyyy') === format(new Date(), 'dd/MM/yyyy') &&
                          apt.status === 'PENDING'
                        ).length}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Col>
      </Row>
    </div>
  );
};

export default Schedule; 