import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { ScheduleStatus } from '../../../types/schedule.types';
import moment from 'moment';
import { deleteScheduleAPI } from '../../../services/api.service';
import './ScheduleDetail.css';

const ScheduleDetail = ({ show, onHide, schedule, onUpdate, onDelete, onShowToast }) => {
    const [formData, setFormData] = useState({
        id: '',
        doctorId: '',
        doctorName: '',
        date: '',
        status: ScheduleStatus.AVAILABLE,
        slot: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Định nghĩa các khung giờ làm việc
    const timeSlots = [
        { value: '08:00:00', label: '08:00' },
        { value: '08:30:00', label: '08:30' },
        { value: '09:00:00', label: '09:00' },
        { value: '09:30:00', label: '09:30' },
        { value: '10:00:00', label: '10:00' },
        { value: '10:30:00', label: '10:30' },
        { value: '11:00:00', label: '11:00' },
        { value: '11:30:00', label: '11:30' },
        { value: '13:00:00', label: '13:00' },
        { value: '13:30:00', label: '13:30' },
        { value: '14:00:00', label: '14:00' },
        { value: '14:30:00', label: '14:30' },
        { value: '15:00:00', label: '15:00' },
        { value: '15:30:00', label: '15:30' },
        { value: '16:00:00', label: '16:00' },
        { value: '16:30:00', label: '16:30' }
    ];

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
        
        if (!formData.slot && formData.status === ScheduleStatus.AVAILABLE) {
            onShowToast('Vui lòng chọn khung giờ làm việc', 'danger');
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

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const slot = timeSlots.find(slot => slot.value === timeString);
        return slot ? slot.label : timeString.substring(0, 5);
    };

    if (!schedule) {
        return null;
    }

    return (
        <Modal show={show} onHide={handleClose} centered className="schedule-detail-modal">
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
                                Mỗi khung giờ có thể tiếp nhận tối đa 5 bệnh nhân
                            </Form.Text>
                        </Form.Group>
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
                        <p className="mb-2"><strong>Xác nhận xóa lịch làm việc</strong></p>
                        <p className="mb-2">Bạn có chắc chắn muốn xóa lịch làm việc của bác sĩ {formData.doctorName} vào ngày {formatDate(formData.date)} lúc {formatTime(formData.slot)}?</p>
                        <p className="mb-0">Thao tác này không thể hoàn tác và sẽ xóa dữ liệu khỏi hệ thống.</p>
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                    {!confirmDelete ? (
                        <Button 
                            variant="danger" 
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
