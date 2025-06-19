import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { ScheduleStatus, StaffRole } from '../../../types/schedule.types';
import './ScheduleDetail.css';

const ScheduleDetail = ({ show, onHide, schedule, onDelete, onUpdate, onShowToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        status: '',
        morning: true,
        afternoon: true,
        note: ''
    });

    useEffect(() => {
        if (schedule) {
            setFormData({
                status: schedule.status,
                morning: schedule.morning !== undefined ? schedule.morning : true,
                afternoon: schedule.afternoon !== undefined ? schedule.afternoon : true,
                note: schedule.note || ''
            });
        }
    }, [schedule]);

    // Xác định loại người được lên lịch (bác sĩ hoặc y tá)
    const isDoctor = schedule?.doctorId != null;
    const personName = isDoctor ? schedule?.doctorName : schedule?.staffName;
    const roleText = isDoctor ? 'bác sĩ' : 'y tá';

    const handleUpdate = () => {
        const updatedSchedule = {
            ...schedule,
            ...formData,
            title: `${personName} - ${getStatusLabel(formData.status)}`
        };
        onUpdate(updatedSchedule);
        setIsEditing(false);
        
        // Gửi thông báo thành công lên component cha
        if (onShowToast) {
            onShowToast(`Cập nhật lịch làm việc cho ${roleText} ${personName} thành công!`, 'success');
        }
    };

    const handleDelete = () => {
        if (window.confirm('Bạn có chắc muốn xóa lịch làm việc này?')) {
            onDelete(schedule.id);
            
            // Gửi thông báo thành công lên component cha
            if (onShowToast) {
                onShowToast(`Xóa lịch làm việc cho ${roleText} ${personName} thành công!`, 'success');
            }
            
            onHide();
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case ScheduleStatus.AVAILABLE:
                return 'Làm việc';
            case ScheduleStatus.ON_LEAVE:
                return 'Nghỉ phép';
            case ScheduleStatus.IN_MEETING:
                return 'Họp';
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case ScheduleStatus.AVAILABLE:
                return 'text-success';
            case ScheduleStatus.ON_LEAVE:
                return 'text-warning';
            case ScheduleStatus.IN_MEETING:
                return 'text-primary';
            default:
                return '';
        }
    };

    // Xác định nhãn hiển thị dựa trên vai trò
    const getRoleLabel = () => {
        if (isDoctor) return "Bác sĩ";
        return "Y tá";
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="schedule-detail-modal">
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết lịch làm việc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {schedule && (
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{getRoleLabel()}</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={personName} 
                                        disabled 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Ngày</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={schedule.date} 
                                        disabled 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                disabled={!isEditing}
                                className={getStatusClass(formData.status)}
                            >
                                <option value={ScheduleStatus.AVAILABLE}>Làm việc</option>
                                <option value={ScheduleStatus.ON_LEAVE}>Nghỉ phép</option>
                                <option value={ScheduleStatus.IN_MEETING}>Họp</option>
                            </Form.Select>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="checkbox"
                                        id="morning-check-detail"
                                        label="Buổi sáng (8:00 - 11:00)"
                                        checked={formData.morning}
                                        onChange={(e) => setFormData({...formData, morning: e.target.checked})}
                                        disabled={!isEditing || formData.status !== ScheduleStatus.AVAILABLE}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="checkbox"
                                        id="afternoon-check-detail"
                                        label="Buổi chiều (13:00 - 16:00)"
                                        checked={formData.afternoon}
                                        onChange={(e) => setFormData({...formData, afternoon: e.target.checked})}
                                        disabled={!isEditing || formData.status !== ScheduleStatus.AVAILABLE}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.note}
                                onChange={(e) => setFormData({...formData, note: e.target.value})}
                                disabled={!isEditing}
                                placeholder="Không có ghi chú"
                            />
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                {isEditing ? (
                    <>
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleUpdate}>
                            Lưu thay đổi
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="danger" onClick={handleDelete}>
                            Xóa
                        </Button>
                        <Button variant="primary" onClick={() => setIsEditing(true)}>
                            Chỉnh sửa
                        </Button>
                        <Button variant="secondary" onClick={onHide}>
                            Đóng
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleDetail;
