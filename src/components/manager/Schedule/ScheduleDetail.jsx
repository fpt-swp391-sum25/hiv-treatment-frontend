import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { ScheduleStatus, SlotTimes, StatusMapping } from '../../../types/schedule.types';
import moment from 'moment';
import { deleteScheduleAPI } from '../../../services/api.service';
import './ScheduleDetail.css';
import { BsCalendarWeek, BsClock, BsDoorOpen, BsPerson, BsBriefcase } from 'react-icons/bs';

const ScheduleDetail = ({ show, onHide, schedule, onUpdate, onDelete, onShowToast }) => {
    const [formData, setFormData] = useState({
        id: '',
        doctorId: '',
        doctorName: '',
        date: '',
        status: ScheduleStatus.AVAILABLE,
        slot: '',
        roomCode: '',
        original_status: ScheduleStatus.AVAILABLE,
        shiftType: null // Thêm trường thông tin ca làm việc
    });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Sử dụng SlotTimes từ schedule.types.js
    const timeSlots = SlotTimes;
    
    // Định nghĩa ca sáng và ca chiều
    const morningShiftSlots = timeSlots.filter(slot => 
        ['08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00'].includes(slot.value)
    );
    
    const afternoonShiftSlots = timeSlots.filter(slot => 
        ['13:00:00', '13:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00'].includes(slot.value)
    );

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
                original_status: schedule.original_status, // Lưu trạng thái gốc từ BE
                shiftType: schedule.shiftType || null // Thêm thông tin ca làm việc
            });
        }
        
        // Reset confirmDelete state when modal is shown
        setConfirmDelete(false);
    }, [schedule, show]);

    // Kiểm tra xem slot có thuộc ca nào không nếu chưa có shiftType
    useEffect(() => {
        if (formData.slot && !formData.shiftType) {
            // Kiểm tra xem slot thuộc ca sáng hay ca chiều
            if (morningShiftSlots.some(item => item.value === formData.slot)) {
                setFormData(prev => ({...prev, shiftType: 'morning'}));
            } else if (afternoonShiftSlots.some(item => item.value === formData.slot)) {
                setFormData(prev => ({...prev, shiftType: 'afternoon'}));
            }
        }
    }, [formData.slot, formData.shiftType]);

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
            let title = `${formData.doctorName} - ${formData.slot.substring(0, 5)}`;
            
            // Thêm thông tin ca làm việc vào title nếu có
            if (formData.shiftType) {
                const shiftName = formData.shiftType === 'morning' ? 'Ca sáng' : 'Ca chiều';
                title = `${formData.doctorName} - ${shiftName} - ${formData.slot.substring(0, 5)}`;
            }
            
            const updatedSchedule = {
                ...formData,
                title: title,
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
    
    // Lấy tên ca làm việc
    const getShiftName = (shiftType) => {
        if (!shiftType) return null;
        return shiftType === 'morning' ? 'Ca sáng (08:00 - 11:30)' : 'Ca chiều (13:00 - 16:30)';
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
                            
                            {/* Hiển thị thông tin ca làm việc nếu có */}
                            {formData.shiftType && (
                                <Row className="mt-3">
                                    <Col md={12} className="d-flex align-items-center">
                                        <BsBriefcase className="text-primary me-2" size={20} />
                                        <div>
                                            <div className="text-muted small">Ca làm việc</div>
                                            <Badge 
                                                bg={formData.shiftType === 'morning' ? 'info' : 'warning'}
                                                className="p-2"
                                            >
                                                {getShiftName(formData.shiftType)}
                                            </Badge>
                                        </div>
                                    </Col>
                                </Row>
                            )}
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
                            
                            {/* Thông tin ca làm việc */}
                            <Form.Group className="mb-3">
                                <Form.Label>Ca làm việc</Form.Label>
                                <Form.Select
                                    name="shiftType"
                                    value={formData.shiftType || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Không thuộc ca nào</option>
                                    <option value="morning">Ca sáng (08:00 - 11:30)</option>
                                    <option value="afternoon">Ca chiều (13:00 - 16:30)</option>
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Đánh dấu lịch này thuộc ca làm việc nào
                                </Form.Text>
                            </Form.Group>
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
