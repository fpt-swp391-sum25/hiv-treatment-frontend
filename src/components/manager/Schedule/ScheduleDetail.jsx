import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { ScheduleStatus, SlotTimes, StatusMapping } from '../../../types/schedule.types';
import moment from 'moment';
import { deleteScheduleAPI } from '../../../services/api.service';
import './ScheduleDetail.css';
import { BsCalendarWeek, BsClock, BsDoorOpen, BsPerson } from 'react-icons/bs';

const ScheduleDetail = ({ show, onHide, schedule, onUpdate, onDelete, onShowToast }) => {
    const [formData, setFormData] = useState({
        id: '',
        doctorId: '',
        doctorName: '',
        date: '',
        status: ScheduleStatus.AVAILABLE,
        slot: '',
        roomCode: '',
        original_status: ScheduleStatus.AVAILABLE
    });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Sử dụng SlotTimes từ schedule.types.js
    const timeSlots = SlotTimes;

    useEffect(() => {
        if (schedule) {
            console.log('ScheduleDetail: Received schedule data:', schedule);
            setFormData({
                id: schedule.id,
                doctorId: schedule.doctorId,
                doctorName: schedule.doctorName,
                date: schedule.date,
                status: schedule.status,
                slot: schedule.slot || '08:00:00',
                roomCode: schedule.roomCode || '',
                original_status: schedule.original_status // Lưu trạng thái gốc từ BE
            });
        }
        
        // Reset confirmDelete state when modal is shown
        setConfirmDelete(false);
    }, [schedule, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.slot && formData.status === "available") {
            onShowToast('Vui lòng chọn khung giờ làm việc', 'danger');
            return;
        }

        setLoading(true);
        try {
            // Chuyển đổi status từ FE sang BE
            const beStatus = StatusMapping[formData.status] || formData.status;
            
            // Cập nhật title dựa trên trạng thái
            const updatedSchedule = {
                ...formData,
                title: `${formData.doctorName} - ${formData.slot.substring(0, 5)}`,
                original_status: beStatus // Lưu trữ status BE
            };
            
            console.log('ScheduleDetail: Updating schedule:', updatedSchedule);
            
            // Gọi hàm cập nhật từ component cha
            onUpdate(updatedSchedule);
            handleClose();
            onShowToast('Cập nhật lịch thành công', 'success');
        } catch (error) {
            console.error('Error updating schedule:', error);
            onShowToast('Có lỗi xảy ra khi cập nhật lịch', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị xác nhận xóa
    const showDeleteConfirmation = () => {
        setConfirmDelete(true);
    };

    // Hủy xác nhận xóa
    const cancelDelete = () => {
        setConfirmDelete(false);
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            
            if (!schedule || !schedule.id) {
                console.error('Invalid schedule ID:', schedule);
                onShowToast('Không thể xóa lịch: ID không hợp lệ', 'danger');
                return;
            }
            
            // Gọi API để xóa lịch
            console.log('Deleting schedule:', schedule.id);
            const response = await deleteScheduleAPI(schedule.id);
            console.log('Delete response:', response);
            
            // Thông báo thành công và đóng modal
            onShowToast('Đã xóa lịch thành công', 'success');
            onDelete(schedule.id);
            onHide();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            onShowToast('Không thể xóa lịch, vui lòng thử lại sau', 'danger');
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const handleClose = () => {
        onHide();
        setConfirmDelete(false);
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    // Hàm chuyển đổi thứ sang tiếng Việt
    const formatVietnameseDay = (date) => {
        const weekdays = [
            'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 
            'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
        ];
        const dayOfWeek = moment(date).day(); // 0 = Chủ nhật, 1 = Thứ hai, ...
        return weekdays[dayOfWeek];
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const slot = timeSlots.find(slot => slot.value === timeString);
        return slot ? slot.label : timeString.substring(0, 5);
    };

    if (!schedule) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose} centered size="lg" className="schedule-detail-modal">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>Chi tiết lịch làm việc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {confirmDelete ? (
                    <Alert variant="danger">
                        <p className="mb-2"><strong>Xác nhận xóa lịch làm việc</strong></p>
                        <p className="mb-2">Bạn có chắc chắn muốn xóa lịch làm việc của bác sĩ {formData.doctorName} vào ngày {formatDate(formData.date)} lúc {formatTime(formData.slot)}?</p>
                        <p className="mb-0">Thao tác này không thể hoàn tác và sẽ xóa dữ liệu khỏi hệ thống.</p>
                    </Alert>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        {/* Thông tin cơ bản */}
                        <div className="schedule-info-section mb-4 p-3 border rounded bg-light">
                            <h5 className="mb-3">Thông tin chung</h5>
                            
                            <Row className="mb-3">
                                <Col md={6} className="d-flex align-items-center mb-2">
                                    <BsPerson className="text-primary me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Bác sĩ</div>
                                        <strong>{formData.doctorName}</strong>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="d-flex align-items-center mb-2">
                                    <BsDoorOpen className="text-success me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Phòng</div>
                                        <strong>Phòng {formData.roomCode}</strong>
                                    </div>
                                </Col>
                            </Row>
                            
                            <Row>
                                <Col md={6} className="d-flex align-items-center">
                                    <BsCalendarWeek className="text-info me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Ngày</div>
                                        <div className="schedule-date-value">
                                            <i className="bi bi-calendar-event text-primary me-2"></i>
                                            <strong>{formatDate(formData.date)}</strong> 
                                            <span className="ms-2 text-muted small">
                                                ({formatVietnameseDay(formData.date)})
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="d-flex align-items-center">
                                    <BsClock className="text-warning me-2" size={20} />
                                    <div>
                                        <div className="text-muted small">Khung giờ</div>
                                        <strong>{formatTime(formData.slot)}</strong>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        
                        {/* Thông tin cập nhật */}
                        <div className="update-section mb-3 p-3 border rounded">
                            <h5 className="mb-3">Cập nhật thông tin</h5>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Trạng thái</Form.Label>
                                <div className="d-flex align-items-center mb-2">
                                    <div className="current-status me-3">
                                        <Badge 
                                            bg={formData.status === "available" ? "success" : 
                                                formData.status === "cancelled" ? "danger" : "primary"}
                                            className="p-2"
                                        >
                                            {formData.status === "available" ? "Làm việc" : 
                                             formData.status === "cancelled" ? "Đã hủy" : "Đang hoạt động"}
                                        </Badge>
                                    </div>
                                    {formData.original_status && formData.original_status !== StatusMapping[formData.status] && (
                                        <div className="text-muted small">
                                            (Hiện trạng thái trong DB: {formData.original_status})
                                        </div>
                                    )}
                                </div>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-2"
                                >
                                    <option value="available">Làm việc</option>
                                    <option value="cancelled">Đã hủy</option>
                                    <option value="active">Đang hoạt động</option>
                                </Form.Select>
                            </Form.Group>

                            {formData.status === "available" && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Khung giờ</Form.Label>
                                    <Form.Select
                                        name="slot"
                                        value={formData.slot}
                                        onChange={handleChange}
                                    >
                                        {timeSlots.map(slot => (
                                            <option key={slot.value} value={slot.value}>
                                                {slot.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Thiết lập thời gian làm việc cho bác sĩ
                                    </Form.Text>
                                </Form.Group>
                            )}
                        </div>
                        
                        {/* Thông tin hệ thống */}
                        <div className="system-info p-2 border-top mt-3">
                            <small className="d-block text-muted mb-1">ID lịch: {formData.id}</small>
                            <small className="d-block text-muted">Cập nhật gần nhất: {moment().format('DD/MM/YYYY HH:mm')}</small>
                        </div>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                    {!confirmDelete ? (
                        <Button 
                            variant="outline-danger" 
                            onClick={showDeleteConfirmation} 
                            disabled={deleting}
                        >
                            Xóa lịch
                        </Button>
                    ) : (
                        <div className="d-flex">
                            <Button 
                                variant="secondary" 
                                onClick={cancelDelete} 
                                className="me-2"
                                disabled={deleting}
                            >
                                Hủy xóa
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={handleDelete} 
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận xóa'
                                )}
                            </Button>
                        </div>
                    )}
                    
                    <div>
                        <Button 
                            variant="secondary" 
                            onClick={handleClose} 
                            className="me-2"
                        >
                            Đóng
                        </Button>
                        {!confirmDelete && (
                            <Button 
                                variant="primary" 
                                onClick={handleSubmit} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Cập nhật'
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleDetail;
