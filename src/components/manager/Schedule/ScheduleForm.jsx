import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ScheduleStatus, SlotTimes } from '../../../types/schedule.types';
import { scheduleService } from '../../../services/schedule.service';
import moment from 'moment';
import './ScheduleForm.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ScheduleForm = ({ show, onHide, selectedDate, selectedDoctor, onScheduleCreated, existingSchedules = [], onShowToast }) => {
    const [formData, setFormData] = useState({
        status: ScheduleStatus.AVAILABLE,
        morning: true,
        afternoon: true,
        note: '',
        doctorId: selectedDoctor || '',
        date: selectedDate || new Date()
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [workingMode, setWorkingMode] = useState('bothShifts'); // fullDay, morning, afternoon

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
                doctorId: selectedDoctor || '',
                date: selectedDate || new Date()
            });
            setWorkingMode('bothShifts');
            setError(null);
        }
    }, [show, selectedDoctor, selectedDate]);

    // Kiểm tra xem bác sĩ đã có lịch vào ngày được chọn chưa
    const checkDoctorScheduleExists = () => {
        if (!formData.doctorId) return false;
        
        const selectedDateStr = moment(formData.date).format('YYYY-MM-DD');
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
            
            // Cập nhật morning và afternoon dựa trên workingMode
            let updatedMorning = formData.morning;
            let updatedAfternoon = formData.afternoon;
            
            if (workingMode === 'bothShifts') {
                updatedMorning = true;
                updatedAfternoon = true;
            } else if (workingMode === 'morningOnly') {
                updatedMorning = true;
                updatedAfternoon = false;
            } else if (workingMode === 'afternoonOnly') {
                updatedMorning = false;
                updatedAfternoon = true;
            }
            
            const scheduleData = {
                ...formData,
                morning: updatedMorning,
                afternoon: updatedAfternoon,
                date: moment(formData.date).format('YYYY-MM-DD'),
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

    const handleWorkingModeChange = (mode) => {
        setWorkingMode(mode);
        
        // Cập nhật formData theo mode đã chọn
        if (mode === 'bothShifts') {
            setFormData({...formData, morning: true, afternoon: true});
        } else if (mode === 'morningOnly') {
            setFormData({...formData, morning: true, afternoon: false});
        } else if (mode === 'afternoonOnly') {
            setFormData({...formData, morning: false, afternoon: true});
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered className="schedule-form-modal">
            <Modal.Header closeButton>
                <Modal.Title>Đặt lịch làm việc</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày</Form.Label>
                        <DatePicker
                            selected={formData.date}
                            onChange={date => setFormData({...formData, date})}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            wrapperClassName="w-100"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Bác sĩ <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={formData.doctorId}
                            onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                            required
                            className="custom-select"
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
                            className="custom-select"
                        >
                            <option value={ScheduleStatus.AVAILABLE}>Làm việc</option>
                            <option value={ScheduleStatus.ON_LEAVE}>Nghỉ phép</option>
                            <option value={ScheduleStatus.IN_MEETING}>Họp</option>
                        </Form.Select>
                    </Form.Group>

                    {formData.status === ScheduleStatus.AVAILABLE && (
                        <Form.Group className="mb-3">
                            <Form.Label>Ca làm việc</Form.Label>
                            <div className="shift-options">
                                <Form.Check
                                    type="radio"
                                    id="shift-both"
                                    name="workingMode"
                                    label="Cả ngày (8:00 - 16:00)"
                                    checked={workingMode === 'bothShifts'}
                                    onChange={() => handleWorkingModeChange('bothShifts')}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    id="shift-morning"
                                    name="workingMode"
                                    label="Buổi sáng (8:00 - 11:00)"
                                    checked={workingMode === 'morningOnly'}
                                    onChange={() => handleWorkingModeChange('morningOnly')}
                                    className="mb-2"
                                />
                                <Form.Check
                                    type="radio"
                                    id="shift-afternoon"
                                    name="workingMode"
                                    label="Buổi chiều (13:00 - 16:00)"
                                    checked={workingMode === 'afternoonOnly'}
                                    onChange={() => handleWorkingModeChange('afternoonOnly')}
                                />
                            </div>
                        </Form.Group>
                    )}

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
