import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ScheduleStatus, SlotTimes, StaffRole } from '../../../types/schedule.types';
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
        staffId: '',
        repeatSchedule: false,
        repeatCount: 4,
        role: StaffRole.DOCTOR
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);

    // Tải danh sách bác sĩ và nhân viên mẫu
    useEffect(() => {
        // Mock data cho danh sách bác sĩ
        const mockDoctors = [
            { id: 1, name: "BS. Phát" },
            { id: 2, name: "BS. Sơn" },
            { id: 3, name: "BS. Khiết" }
        ];
        
        // Mock data cho danh sách y tá
        const mockStaff = [
            { id: 101, name: "Linh", role: StaffRole.NURSE },
            { id: 102, name: "Hà", role: StaffRole.NURSE }
        ];
        
        setDoctors(mockDoctors);
        setStaffMembers(mockStaff);
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
                staffId: '',
                repeatSchedule: false,
                repeatCount: 4,
                role: StaffRole.DOCTOR
            });
            setError(null);
        }
    }, [show, selectedDoctor]);

    // Kiểm tra xem đã tồn tại lịch cho người được chọn vào ngày chỉ định chưa
    const checkScheduleExists = (date) => {
        if (formData.role === StaffRole.DOCTOR && !formData.doctorId) return false;
        if (formData.role !== StaffRole.DOCTOR && !formData.staffId) return false;
        
        const checkDateStr = moment(date).format('YYYY-MM-DD');
        
        // Kiểm tra dựa vào role (bác sĩ hoặc y tá)
        if (formData.role === StaffRole.DOCTOR) {
            return existingSchedules.some(schedule => 
                schedule.doctorId?.toString() === formData.doctorId.toString() && 
                schedule.date === checkDateStr &&
                !schedule.staffId // Đảm bảo đây là lịch của bác sĩ
            );
        } else {
            return existingSchedules.some(schedule => 
                schedule.staffId?.toString() === formData.staffId.toString() && 
                schedule.date === checkDateStr
            );
        }
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
        if (formData.role === StaffRole.DOCTOR && !formData.doctorId) {
            setError('Vui lòng chọn bác sĩ');
            return;
        }
        
        if (formData.role === StaffRole.NURSE && !formData.staffId) {
            setError('Vui lòng chọn y tá');
            return;
        }
        
        // Kiểm tra xem đã có lịch vào ngày này chưa
        if (checkScheduleExists(selectedDate)) {
            setError(`${formData.role === StaffRole.DOCTOR ? 'Bác sĩ' : 'Y tá'} này đã có lịch làm việc vào ngày đã chọn. Vui lòng chỉnh sửa lịch hiện có hoặc chọn ngày khác.`);
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            // Lấy tên người lên lịch (bác sĩ hoặc y tá)
            let personName = '';
            let personId = '';
            
            if (formData.role === StaffRole.DOCTOR) {
                const selectedDoc = doctors.find(d => d.id.toString() === formData.doctorId.toString());
                personName = selectedDoc ? selectedDoc.name : '';
                personId = formData.doctorId;
            } else {
                const selectedStaffMember = staffMembers.find(s => s.id.toString() === formData.staffId.toString());
                personName = selectedStaffMember ? selectedStaffMember.name : '';
                personId = formData.staffId;
            }
            
            // Danh sách lịch cần tạo (bao gồm cả lịch lặp lại nếu có)
            const schedulesToCreate = [];
            
            // Tạo lịch cho ngày hiện tại
            const scheduleData = {
                ...formData,
                date: moment(selectedDate).format('YYYY-MM-DD'),
                title: `${personName} - ${getStatusLabel(formData.status)}`,
                doctorName: formData.role === StaffRole.DOCTOR ? personName : null,
                staffName: formData.role !== StaffRole.DOCTOR ? personName : null,
                doctorId: formData.role === StaffRole.DOCTOR ? personId : null,
                staffId: formData.role !== StaffRole.DOCTOR ? personId : null
            };
            
            const mockResponse = {
                id: Math.floor(Math.random() * 1000) + 6,
                ...scheduleData,
            };
            
            schedulesToCreate.push(mockResponse);
            
            // Nếu lặp lại lịch, thêm lịch cho các tuần tiếp theo
            if (formData.repeatSchedule && formData.repeatCount > 0) {
                let skippedDates = 0;
                
                for (let i = 1; i <= formData.repeatCount; i++) {
                    const nextWeekDay = moment(selectedDate).add(i * 7, 'days');
                    
                    // Kiểm tra xem đã có lịch vào ngày này chưa
                    if (checkScheduleExists(nextWeekDay)) {
                        skippedDates++;
                        continue;
                    }
                    
                    const nextWeekSchedule = {
                        ...formData,
                        date: nextWeekDay.format('YYYY-MM-DD'),
                        title: `${personName} - ${getStatusLabel(formData.status)}`,
                        doctorName: formData.role === StaffRole.DOCTOR ? personName : null,
                        staffName: formData.role !== StaffRole.DOCTOR ? personName : null,
                        doctorId: formData.role === StaffRole.DOCTOR ? personId : null,
                        staffId: formData.role !== StaffRole.DOCTOR ? personId : null
                    };
                    
                    const nextWeekMockResponse = {
                        id: Math.floor(Math.random() * 1000) + 500 + i,
                        ...nextWeekSchedule,
                    };
                    
                    schedulesToCreate.push(nextWeekMockResponse);
                }
                
                // Hiển thị thông báo tương ứng
                const roleText = formData.role === StaffRole.DOCTOR ? 'bác sĩ' : 'y tá';
                if (skippedDates > 0) {
                    onShowToast(`Đã đặt lịch thành công cho ${roleText} ${personName} ngày đầu tiên và ${formData.repeatCount - skippedDates} tuần tiếp theo. (Bỏ qua ${skippedDates} ngày đã có lịch)`, 'warning');
                } else {
                    onShowToast(`Đã đặt lịch thành công cho ${roleText} ${personName} ngày đầu tiên và ${formData.repeatCount} tuần tiếp theo.`, 'success');
                }
            } else {
                // Gửi thông báo thành công lên component cha để hiển thị
                const roleText = formData.role === StaffRole.DOCTOR ? 'bác sĩ' : 'y tá';
                if (onShowToast) {
                    onShowToast(`Đặt lịch cho ${roleText} ${personName} thành công!`, 'success');
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
                        <Form.Label>Vai trò <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={formData.role}
                            onChange={(e) => {
                                setFormData({
                                    ...formData, 
                                    role: e.target.value,
                                    doctorId: e.target.value === StaffRole.DOCTOR ? formData.doctorId : '',
                                    staffId: e.target.value !== StaffRole.DOCTOR ? formData.staffId : ''
                                })
                            }}
                            required
                        >
                            <option value={StaffRole.DOCTOR}>Bác sĩ</option>
                            <option value={StaffRole.NURSE}>Y tá</option>
                        </Form.Select>
                    </Form.Group>

                    {formData.role === StaffRole.DOCTOR ? (
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
                    ) : (
                        <Form.Group className="mb-3">
                            <Form.Label>Y tá <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                value={formData.staffId}
                                onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                                required
                            >
                                <option value="">Chọn y tá</option>
                                {staffMembers
                                    .filter(staff => staff.role === StaffRole.NURSE)
                                    .map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.name}
                                        </option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                    )}

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
                            label="Lặp lại lịch này vào các tuần sau"
                            checked={formData.repeatSchedule}
                            onChange={(e) => setFormData({...formData, repeatSchedule: e.target.checked})}
                        />
                        {formData.repeatSchedule && (
                            <div className="repeat-options mt-2">
                                <Form.Group>
                                    <Form.Label>Lặp lại trong số tuần:</Form.Label>
                                    <Form.Select
                                        value={formData.repeatCount}
                                        onChange={(e) => setFormData({...formData, repeatCount: parseInt(e.target.value)})}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                            <option key={num} value={num}>
                                                {num} tuần
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <p className="mb-0 mt-2">Lịch sẽ được tạo cho mỗi <strong>{getDayOfWeekName(selectedDate)}</strong> trong {formData.repeatCount} tuần tới</p>
                                    <p className="text-muted small">Lưu ý: Hệ thống sẽ bỏ qua những ngày đã có lịch làm việc</p>
                                </Form.Group>
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
