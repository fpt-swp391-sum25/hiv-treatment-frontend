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
        doctorId: selectedDoctor || '',
        repeatSchedule: false
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
                doctorId: selectedDoctor || '',
                repeatSchedule: false
            });
            setError(null);
        }
    }, [show, selectedDoctor]);

    // Kiểm tra xem bác sĩ đã có lịch vào ngày được chọn chưa
    const checkDoctorScheduleExists = (date) => {
        if (!formData.doctorId) return false;
        
        const checkDateStr = moment(date).format('YYYY-MM-DD');
        return existingSchedules.some(schedule => 
            schedule.doctorId.toString() === formData.doctorId.toString() && 
            schedule.date === checkDateStr
        );
    };

    // Lấy tên thứ trong tuần từ ngày
    const getDayOfWeekName = (date) => {
        const dayOfWeekMap = {
            0: 'Chủ nhật',
            1: 'Thứ hai',
            2: 'Thứ ba',
            3: 'Thứ tư',
            4: 'Thứ năm',
            5: 'Thứ sáu',
            6: 'Thứ bảy'
        };
        
        return dayOfWeekMap[moment(date).day()];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.doctorId) {
            setError('Vui lòng chọn bác sĩ');
            return;
        }
        
        // Kiểm tra xem bác sĩ đã có lịch vào ngày này chưa
        if (checkDoctorScheduleExists(selectedDate)) {
            setError('Bác sĩ này đã có lịch làm việc vào ngày đã chọn. Vui lòng chỉnh sửa lịch hiện có hoặc chọn ngày khác.');
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            // Lấy tên bác sĩ
            const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctorId.toString());
            const doctorName = selectedDoctor ? selectedDoctor.name : '';
            
            // Danh sách lịch cần tạo (bao gồm cả lịch lặp lại nếu có)
            const schedulesToCreate = [];
            
            // Tạo lịch cho ngày hiện tại
            const scheduleData = {
                ...formData,
                date: moment(selectedDate).format('YYYY-MM-DD'),
                title: `${doctorName} - ${getStatusLabel(formData.status)}`,
                doctorName
            };
            
            const mockResponse = {
                id: Math.floor(Math.random() * 1000) + 6, // Random ID từ 6-1005
                ...scheduleData,
            };
            
            schedulesToCreate.push(mockResponse);
            
            // Nếu lặp lại lịch, thêm lịch cho 4 tuần tiếp theo
            if (formData.repeatSchedule) {
                const dayOfWeek = moment(selectedDate).day(); // Lấy thứ trong tuần (0 = CN, 1 = T2,...)
                let skippedDates = 0;
                
                for (let i = 1; i <= 4; i++) {
                    const nextWeekDay = moment(selectedDate).add(i * 7, 'days');
                    
                    // Kiểm tra xem bác sĩ đã có lịch vào ngày này chưa
                    if (checkDoctorScheduleExists(nextWeekDay)) {
                        skippedDates++;
                        continue;
                    }
                    
                    const nextWeekSchedule = {
                        ...formData,
                        date: nextWeekDay.format('YYYY-MM-DD'),
                        title: `${doctorName} - ${getStatusLabel(formData.status)}`,
                        doctorName
                    };
                    
                    const nextWeekMockResponse = {
                        id: Math.floor(Math.random() * 1000) + 500 + i, // Random ID từ 506-510
                        ...nextWeekSchedule,
                    };
                    
                    schedulesToCreate.push(nextWeekMockResponse);
                }
                
                // Hiển thị thông báo tương ứng
                if (skippedDates > 0) {
                    onShowToast(`Đã đặt lịch thành công cho ngày đầu tiên và ${4 - skippedDates} tuần tiếp theo. (Bỏ qua ${skippedDates} ngày đã có lịch)`, 'warning');
                } else {
                    onShowToast(`Đã đặt lịch thành công cho ngày đầu tiên và 4 tuần tiếp theo.`, 'success');
                }
            } else {
                // Gửi thông báo thành công lên component cha để hiển thị
                if (onShowToast) {
                    onShowToast(`Đặt lịch cho bác sĩ ${doctorName} thành công!`, 'success');
                }
            }
            
            // Gửi tất cả lịch đã tạo lên component cha
            schedulesToCreate.forEach(schedule => {
                onScheduleCreated(schedule);
            });
            
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
                        <Form.Text className="text-muted">
                            {getDayOfWeekName(selectedDate)}
                        </Form.Text>
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

                    <Form.Group className="mb-3 repeat-schedule-option">
                        <Form.Check 
                            type="checkbox"
                            id="repeat-check"
                            label="Lặp lại lịch này vào các tuần sau (4 tuần)"
                            checked={formData.repeatSchedule}
                            onChange={(e) => setFormData({...formData, repeatSchedule: e.target.checked})}
                        />
                        {formData.repeatSchedule && (
                            <div className="repeat-info mt-2">
                                <p className="mb-0">Lịch sẽ được tạo cho mỗi <strong>{getDayOfWeekName(selectedDate)}</strong> trong 4 tuần tới</p>
                                <p className="text-muted small">Lưu ý: Hệ thống sẽ bỏ qua những ngày đã có lịch làm việc</p>
                            </div>
                        )}
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
