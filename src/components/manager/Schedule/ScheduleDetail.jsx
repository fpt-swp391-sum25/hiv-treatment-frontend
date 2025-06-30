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
                        <p className="mb-2"><strong>Xác nhận xóa lịch làm việc</strong></p>
                        <p className="mb-2">Bạn có chắc chắn muốn xóa lịch làm việc của bác sĩ {formData.doctorName} vào ngày {formatDate(formData.date)}?</p>
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
