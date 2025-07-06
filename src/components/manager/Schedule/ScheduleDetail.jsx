import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { ScheduleStatus, SlotTimes, StatusMapping } from '../../../types/schedule.types';
import moment from 'moment';
import { deleteScheduleAPI, updateScheduleAPI } from '../../../services/api.service';
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
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);

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
            
            // Xác định shiftType từ trường type (theo phản hồi từ BE)
            let shiftTypeValue = null;
            if (schedule.type === 'morning' || schedule.type === 'afternoon') {
                shiftTypeValue = schedule.type;
            } else if (schedule.shiftType) {
                shiftTypeValue = schedule.shiftType;
            }
            
            setFormData({
                id: schedule.id,
                doctorId: schedule.doctorId,
                doctorName: schedule.doctorName,
                date: schedule.date,
                status: schedule.status,
                slot: schedule.slot || '08:00:00',
                roomCode: schedule.roomCode || '',
                original_status: schedule.original_status, // Lưu trạng thái gốc từ BE
                shiftType: shiftTypeValue, // Lấy từ type hoặc shiftType
                type: schedule.type // Lưu trữ trường type gốc
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
        console.log(`Field changed: ${name}, new value: ${value}`);
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // DEBUG: Log dữ liệu form trước khi xử lý
        console.log('=== BẮT ĐẦU CẬP NHẬT LỊCH ===');
        console.log('1. Dữ liệu form:', formData);
        console.log('2. ID lịch cần cập nhật:', formData.id);
        
        if (!formData.slot && formData.status === "available") {
            onShowToast('Vui lòng chọn khung giờ làm việc', 'danger');
            return;
        }

        setLoading(true);
        try {
            // Kiểm tra và đảm bảo roomCode luôn có giá trị
            if (!formData.roomCode) {
                formData.roomCode = '101'; // Giá trị mặc định nếu không có
            }
            
            // DEBUG: Log thông tin quan trọng
            console.log('3. Thông tin phòng:', formData.roomCode);
            console.log('4. Ca làm việc:', formData.shiftType);
            console.log('5. Trạng thái:', formData.status);
            
            // Giữ nguyên trạng thái hiện tại
            const beStatus = formData.original_status || StatusMapping[formData.status] || formData.status;
            console.log('6. Trạng thái gửi lên server:', beStatus);
            
            // Cập nhật title dựa trên trạng thái
            let title = `${formData.doctorName} - ${formData.slot.substring(0, 5)} - P.${formData.roomCode}`;
            
            // Thêm thông tin ca làm việc vào title nếu có
            if (formData.shiftType) {
                const shiftName = formData.shiftType === 'morning' ? 'Ca sáng' : 'Ca chiều';
                title = `${formData.doctorName} - ${shiftName} - ${formData.slot.substring(0, 5)} - P.${formData.roomCode}`;
            }
            
            const updatedSchedule = {
                ...formData,
                title: title,
                original_status: beStatus,
                type: formData.shiftType
            };
            
            // DEBUG: Log dữ liệu cuối cùng trước khi gửi
            console.log('7. Dữ liệu cuối cùng sẽ gửi đi:', updatedSchedule);
            
            // Sử dụng setTimeout để tránh FlushSync error
            setTimeout(() => {
                try {
                    // DEBUG: Log thời điểm gọi hàm cập nhật
                    console.log('8. Bắt đầu gọi hàm cập nhật');
                    onUpdate(updatedSchedule);
                    handleClose();
                    onShowToast('Cập nhật lịch thành công', 'success');
                    console.log('=== KẾT THÚC CẬP NHẬT LỊCH ===');
                } catch (error) {
                    console.error('9. Lỗi khi gọi hàm cập nhật:', error);
                    onShowToast('Có lỗi xảy ra khi cập nhật lịch', 'danger');
                }
            }, 0);
        } catch (error) {
            console.error('10. Lỗi trong quá trình xử lý:', error);
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
            
            // Sử dụng setTimeout để tránh FlushSync error
            setTimeout(() => {
                // Thông báo thành công và đóng modal
                onShowToast('Đã xóa lịch thành công', 'success');
                onDelete(schedule.id);
                onHide();
            }, 0);
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

    const handleUpdateSchedule = async () => {
        try {
            setIsLoading(true);
            const updatedScheduleData = {
                date: selectedSchedule.date,
                slot: selectedSchedule.slot,
                roomCode: selectedSchedule.roomCode,
                status: selectedSchedule.status,
                doctorId: selectedSchedule.doctorId,
            };

            console.log('Bắt đầu cập nhật lịch:', selectedSchedule.id);
            const updatedSchedules = await updateScheduleAPI(selectedSchedule.id, updatedScheduleData);
            
            // Cập nhật state với danh sách lịch mới
            if (updatedSchedules?.data) {
                setSchedules(updatedSchedules.data);
                message.success('Cập nhật lịch thành công!');
                handleClose();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật lịch:', error);
            message.error('Không thể cập nhật lịch. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
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
                            
                            {/* Thêm phần cập nhật phòng làm việc */}
                            <Form.Group className="mb-3">
                                <Form.Label>Phòng làm việc</Form.Label>
                                <div className="d-flex align-items-center">
                                    <BsDoorOpen className="text-success me-2" size={20} />
                                    <Form.Select
                                        name="roomCode"
                                        value={formData.roomCode}
                                        onChange={handleChange}
                                    >
                                        <option value="101">Phòng 101</option>
                                        <option value="102">Phòng 102</option>
                                        <option value="103">Phòng 103</option>
                                        <option value="201">Phòng 201</option>
                                        <option value="202">Phòng 202</option>
                                    </Form.Select>
                                </div>
                                <Form.Text className="text-muted">
                                    Cập nhật phòng làm việc cho bác sĩ
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
                <div className="button-container">
                    {!confirmDelete ? (
                        <Button 
                            variant="outline-danger" 
                            onClick={showDeleteConfirmation} 
                            disabled={deleting}
                            className="btn-action"
                        >
                            Xóa lịch
                        </Button>
                    ) : (
                        <>
                            <Button 
                                variant="secondary" 
                                onClick={cancelDelete} 
                                className="btn-action"
                                disabled={deleting}
                            >
                                Hủy xóa
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={handleDelete} 
                                disabled={deleting}
                                className="btn-action"
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
                        </>
                    )}
                    
                    <div className="action-buttons">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose} 
                            className="btn-action"
                        >
                            Đóng
                        </Button>
                        {!confirmDelete && (
                            <Button 
                                variant="outline-primary" 
                                onClick={handleSubmit} 
                                disabled={loading}
                                className="btn-action"
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
