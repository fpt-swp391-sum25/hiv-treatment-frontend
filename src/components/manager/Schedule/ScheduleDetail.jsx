import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { ScheduleType, ScheduleStatus, SlotTimes } from '../../../types/schedule.types';
import { scheduleService } from '../../../services/schedule.service';
import './ScheduleDetail.css';

const ScheduleDetail = ({ show, onHide, scheduleId, onDelete, onUpdate }) => {
    const [schedule, setSchedule] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        status: '',
        slot: '',
        note: ''
    });

    useEffect(() => {
        if (scheduleId) {
            loadScheduleDetails();
        }
    }, [scheduleId]);

    const loadScheduleDetails = async () => {
        try {
            const data = await scheduleService.getScheduleById(scheduleId);
            setSchedule(data);
            setFormData({
                type: data.type,
                status: data.status,
                slot: data.slot,
                note: data.note
            });
        } catch (error) {
            console.error('Error loading schedule details:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            await scheduleService.updateSchedule(scheduleId, formData);
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating schedule:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc muốn xóa lịch hẹn này?')) {
            try {
                await scheduleService.deleteSchedule(scheduleId);
                onDelete();
                onHide();
            } catch (error) {
                console.error('Error deleting schedule:', error);
            }
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="schedule-detail-modal">
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết lịch hẹn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {schedule && (
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Loại lịch hẹn</Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        disabled={!isEditing}
                                    >
                                        {Object.entries(ScheduleType).map(([key, value]) => (
                                            <option key={key} value={value}>
                                                {key === 'EXAMINATION' ? 'Khám thông thường' :
                                                 key === 'EMERGENCY' ? 'Khám khẩn cấp' :
                                                 key === 'FOLLOW_UP' ? 'Tái khám' : 'Tư vấn'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Trạng thái</Form.Label>
                                    <Form.Select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        disabled={!isEditing}
                                    >
                                        {Object.entries(ScheduleStatus).map(([key, value]) => (
                                            <option key={key} value={value}>
                                                {key === 'PENDING' ? 'Chờ xác nhận' :
                                                 key === 'CONFIRMED' ? 'Đã xác nhận' :
                                                 key === 'CANCELLED' ? 'Đã hủy' :
                                                 key === 'COMPLETED' ? 'Đã hoàn thành' : 'Không đến khám'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ghi chú</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                        disabled={!isEditing}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
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
