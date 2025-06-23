import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { ScheduleStatus } from '../../../types/schedule.types';
import moment from 'moment';
import './ScheduleDetail.css';
import { updateScheduleAPI, deleteScheduleAPI } from '../../../services/api.service';

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

    useEffect(() => {
        if (schedule) {
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
    }, [schedule]);

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
            
            // Gọi API cập nhật lịch
            await updateScheduleAPI(formData.id, updatedSchedule);
            
            // Thông báo thành công và cập nhật UI
            onUpdate(updatedSchedule);
            onHide();
        } catch (error) {
            console.error('Error updating schedule:', error);
            onShowToast('Có lỗi xảy ra khi cập nhật lịch', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setLoading(true);
        try {
            // Gọi API xóa lịch
            await deleteScheduleAPI(formData.id);
            
            // Thông báo thành công và cập nhật UI
            onDelete(formData.id);
            onHide();
            setConfirmDelete(false);
        } catch (error) {
            console.error('Error deleting schedule:', error);
            onShowToast('Có lỗi xảy ra khi xóa lịch', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết lịch làm việc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {schedule && (
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
                                            label="Buổi sáng"
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
                                            label="Buổi chiều"
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
                )}

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
                        disabled={loading}
                    >
                        {confirmDelete ? 'Xác nhận xóa' : 'Xóa lịch'}
                    </Button>
                    <div>
                        <Button variant="secondary" onClick={onHide} className="me-2">
                            Hủy
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleSubmit} 
                            disabled={loading || confirmDelete}
                        >
                            {loading ? 'Đang xử lý...' : 'Cập nhật'}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleDetail;
