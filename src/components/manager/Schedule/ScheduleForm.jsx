import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ScheduleStatus, SlotTimes } from '../../../types/schedule.types';
import { scheduleService } from '../../../services/schedule.service';
import moment from 'moment';
import './ScheduleForm.css';

const ScheduleForm = ({ show, onHide, selectedDate, selectedDoctor, onScheduleCreated, existingSchedules = [], onShowToast }) => {
    const [formData, setFormData] = useState({
        status: ScheduleStatus.AVAILABLE,
        morning: true,
        afternoon: true,
        note: '',
        doctorId: selectedDoctor || ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);

    // Tải danh sách bác sĩ mẫu
    useEffect(() => {
        // Mock data cho danh sách bác sĩ
        const mockDoctors = [
            { id: 1, name: "BS. Phát" },
            { id: 2, name: "BS. Sơn" },
            { id: 3, name: "BS. Khiết" }
        ];
        
        setDoctors(mockDoctors);
    }, []);

    // Reset form when modal opens
    useEffect(() => {
        if (show) {
            setFormData({
                status: ScheduleStatus.AVAILABLE,
                morning: true,
                afternoon: true,
                note: '',
                doctorId: selectedDoctor || ''
            });
            setError(null);
        }
    }, [show, selectedDoctor]);

    // Kiểm tra xem bác sĩ đã có lịch vào ngày được chọn chưa
    const checkDoctorScheduleExists = () => {
        if (!formData.doctorId) return false;
        
        const selectedDateStr = moment(selectedDate).format('YYYY-MM-DD');
        return existingSchedules.some(schedule => 
            schedule.doctorId.toString() === formData.doctorId.toString() && 
            schedule.date === selectedDateStr
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.doctorId) {
            setError('Vui lòng chọn bác sĩ');
            return;
        }
        
        // Kiểm tra xem bác sĩ đã có lịch vào ngày này chưa
        if (checkDoctorScheduleExists()) {
            setError('Bác sĩ này đã có lịch làm việc vào ngày đã chọn. Vui lòng chỉnh sửa lịch hiện có hoặc chọn ngày khác.');
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            // Lấy tên bác sĩ
            const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctorId.toString());
            const doctorName = selectedDoctor ? selectedDoctor.name : '';
            
            const scheduleData = {
                ...formData,
                date: moment(selectedDate).format('YYYY-MM-DD'),
                title: `${doctorName} - ${getStatusLabel(formData.status)}`,
                doctorName
            };

            // Tạo một lịch làm việc mẫu để hiển thị
            const mockResponse = {
                id: Math.floor(Math.random() * 1000) + 6, // Random ID từ 6-1005
                ...scheduleData,
            };
            
            onScheduleCreated(mockResponse);
            
            // Gửi thông báo thành công lên component cha để hiển thị
            if (onShowToast) {
                onShowToast(`Đặt lịch cho bác sĩ ${doctorName} thành công!`, 'success');
            }
            
            onHide();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch làm việc');
        } finally {
            setLoading(false);
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
                return '';
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Đặt lịch làm việc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày</Form.Label>
                        <Form.Control
                            type="text"
                            value={moment(selectedDate).format('DD/MM/YYYY')}
                            disabled
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Bác sĩ <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={formData.doctorId}
                            onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                            required
                        >
                            <option value="">Chọn bác sĩ</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Trạng thái <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            required
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
                                    id="morning-check"
                                    label="Buổi sáng (8:00 - 11:00)"
                                    checked={formData.morning}
                                    onChange={(e) => setFormData({...formData, morning: e.target.checked})}
                                    disabled={formData.status !== ScheduleStatus.AVAILABLE}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Check 
                                    type="checkbox"
                                    id="afternoon-check"
                                    label="Buổi chiều (13:00 - 16:00)"
                                    checked={formData.afternoon}
                                    onChange={(e) => setFormData({...formData, afternoon: e.target.checked})}
                                    disabled={formData.status !== ScheduleStatus.AVAILABLE}
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
