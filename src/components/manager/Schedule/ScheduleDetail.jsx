import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { ScheduleStatus } from '../../../types/schedule.types';
import moment from 'moment';
import './ScheduleDetail.css';

const ScheduleDetail = ({ show, onHide, schedule, onUpdate, onDelete, onShowToast }) => {
    const [formData, setFormData] = useState({
        id: '',
        doctorId: '',
        doctorName: '',
        date: '',
        status: ScheduleStatus.AVAILABLE,
        morning: true,
        afternoon: true,
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (schedule) {
            console.log('ScheduleDetail: Received schedule data:', schedule);
            setFormData({
                id: schedule.id,
                doctorId: schedule.doctorId,
                doctorName: schedule.doctorName,
                date: schedule.date,
                status: schedule.status,
                morning: schedule.morning,
                afternoon: schedule.afternoon,
                note: schedule.note || ''
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
        
        if (!formData.morning && !formData.afternoon && formData.status === ScheduleStatus.AVAILABLE) {
            onShowToast('Vui lòng chọn ít nhất một buổi làm việc', 'danger');
            return;
        }

        setLoading(true);
        try {
            // Cập nhật title dựa trên trạng thái
            const updatedSchedule = {
                ...formData,
                title: `${formData.doctorName} - ${formData.status === ScheduleStatus.AVAILABLE ? 'Làm việc' : 'Nghỉ phép'}`
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

    const handleDelete = async () => {
        try {
            setDeleting(true);
            
            // Gọi API để xóa lịch
            console.log('Deleting schedule:', schedule.id);
            const response = await deleteScheduleAPI(schedule.id);
            console.log('Delete response:', response);
            
            // Xóa dữ liệu lịch trong localStorage và sessionStorage
            try {
                const localStorageKeys = Object.keys(localStorage);
                localStorageKeys.forEach(key => {
                    if (key.includes('fullcalendar') || key.includes('fc-') || 
                        key.includes('calendar') || key.includes('event') || 
                        key.includes('schedule')) {
                        console.log('Removing from localStorage in handleDelete:', key);
                        localStorage.removeItem(key);
                    }
                });
                
                const sessionStorageKeys = Object.keys(sessionStorage);
                sessionStorageKeys.forEach(key => {
                    if (key.includes('fullcalendar') || key.includes('fc-') || 
                        key.includes('calendar') || key.includes('event') || 
                        key.includes('schedule')) {
                        console.log('Removing from sessionStorage in handleDelete:', key);
                        sessionStorage.removeItem(key);
                    }
                });
                
                // Xóa tất cả dữ liệu trong localStorage và sessionStorage
                localStorage.removeItem('fc-event-sources');
                localStorage.removeItem('fc-view-state');
                sessionStorage.removeItem('fc-event-sources');
                sessionStorage.removeItem('fc-view-state');
            } catch (error) {
                console.error('Error clearing storage:', error);
            }
            
            // Thông báo thành công và đóng modal
            onShowToast('Đã xóa lịch thành công', 'success');
            onDelete(schedule.id);
            onHide();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            onShowToast('Không thể xóa lịch, vui lòng thử lại sau', 'danger');
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => {
        onHide();
        setConfirmDelete(false);
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    if (!schedule) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết lịch làm việc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Bác sĩ</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.doctorName}
                            disabled
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Ngày</Form.Label>
                        <Form.Control
                            type="text"
                            value={formatDate(formData.date)}
                            disabled
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Trạng thái</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value={ScheduleStatus.AVAILABLE}>Làm việc</option>
                            <option value={ScheduleStatus.ON_LEAVE}>Nghỉ phép</option>
                        </Form.Select>
                    </Form.Group>

                    {formData.status === ScheduleStatus.AVAILABLE && (
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="checkbox"
                                        id="detail-morning-check"
                                        label="Buổi sáng (8:00 - 12:00)"
                                        name="morning"
                                        checked={formData.morning}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="checkbox"
                                        id="detail-afternoon-check"
                                        label="Buổi chiều (13:00 - 17:00)"
                                        name="afternoon"
                                        checked={formData.afternoon}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Ghi chú</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Nhập ghi chú (nếu có)"
                        />
                    </Form.Group>
                </Form>

                {confirmDelete && (
                    <Alert variant="danger">
                        <p>Bạn có chắc chắn muốn xóa lịch làm việc này?</p>
                        <p>Thao tác này không thể hoàn tác.</p>
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
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
                            'Xóa lịch'
                        )}
                    </Button>
                    <div>
                        <Button 
                            variant="secondary" 
                            onClick={handleClose} 
                            className="me-2"
                        >
                            Hủy
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleSubmit} 
                            disabled={loading || confirmDelete}
                        >
                            {loading && !confirmDelete ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Cập nhật'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleDetail;
