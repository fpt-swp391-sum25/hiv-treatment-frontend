import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { ScheduleType, ScheduleStatus, SlotTimes } from '../../../types/schedule.types';
import { scheduleService } from '../../../services/schedule.service';
import moment from 'moment';
import './ScheduleForm.css';

const ScheduleForm = ({ show, onHide, selectedDate, selectedDoctor, onScheduleCreated }) => {
    const [formData, setFormData] = useState({
        type: ScheduleType.EXAMINATION,
        slot: '',
        note: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (show) {
            setFormData({
                type: ScheduleType.EXAMINATION,
                slot: '',
                note: ''
            });
            setError(null);
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const scheduleData = {
                ...formData,
                date: moment(selectedDate).format('YYYY-MM-DD'),
                doctorId: selectedDoctor,
                status: ScheduleStatus.PENDING
            };

            const response = await scheduleService.createSchedule(scheduleData);
            onScheduleCreated(response);
            onHide();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Đặt lịch hẹn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày hẹn</Form.Label>
                        <Form.Control
                            type="text"
                            value={moment(selectedDate).format('DD/MM/YYYY')}
                            disabled
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Loại lịch hẹn</Form.Label>
                        <Form.Select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            required
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

                    <Form.Group className="mb-3">
                        <Form.Label>Khung giờ</Form.Label>
                        <Form.Select
                            value={formData.slot}
                            onChange={(e) => setFormData({...formData, slot: e.target.value})}
                            required
                        >
                            <option value="">Chọn khung giờ</option>
                            {Object.entries(SlotTimes).map(([key, value]) => (
                                <option key={key} value={value}>
                                    {key.includes('MORNING') ? 'Sáng' : 'Chiều'} - {
                                        key.endsWith('1') ? '8:00-9:00' :
                                        key.endsWith('2') ? '9:00-10:00' :
                                        '10:00-11:00'
                                    }
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Ghi chú</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.note}
                            onChange={(e) => setFormData({...formData, note: e.target.value})}
                            placeholder="Nhập ghi chú nếu cần..."
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Hủy
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Đặt lịch'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleForm;
