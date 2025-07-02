import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ScheduleStatus, SlotTimes, StatusMapping } from '../../../types/schedule.types';
import './ScheduleForm.css';
import moment from 'moment';
import { fetchAllDoctorsAPI } from '../../../services/api.service';

const ScheduleForm = ({ show, onHide, selectedDate, selectedDoctor, onScheduleCreated, existingSchedules, onShowToast }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        doctorId: '',
        doctorName: '',
        date: moment(selectedDate).format('YYYY-MM-DD'),
        status: ScheduleStatus.AVAILABLE,
        slot: '08:00:00',
        repeatWeekly: false,
        repeatCount: 1,
        roomCode: '101'
    });
    
    // Sử dụng SlotTimes từ schedule.types.js
    const timeSlots = SlotTimes;

    useEffect(() => {
        if (show) {
            fetchDoctors();
            resetForm();
        }
    }, [show, selectedDate, selectedDoctor]);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('ScheduleForm: Fetching doctors from API...');
            const response = await fetchAllDoctorsAPI();
            console.log('ScheduleForm: API response for doctors:', response);
            
            // Kiểm tra cấu trúc response để xác định nơi chứa dữ liệu
            let doctorsData = [];
            
            if (response && response.data) {
                doctorsData = response.data;
            } else if (response && Array.isArray(response)) {
                doctorsData = response;
            } else if (response) {
                doctorsData = response;
            }
            
            // Đảm bảo doctorsData là một mảng
            const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
            
            console.log('ScheduleForm: Doctors data after processing:', doctorsList);
            
            if (doctorsList.length > 0) {
                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                const formattedDoctors = doctorsList.map(doctor => {
                    // Log để kiểm tra cấu trúc dữ liệu
                    console.log('ScheduleForm: Doctor data structure:', doctor);
                    
                    // Xử lý các trường hợp khác nhau của cấu trúc dữ liệu
                    const id = doctor.id || doctor.userId || doctor.user_id;
                    const name = doctor.full_name || doctor.fullName || doctor.name || doctor.username || `BS. ${id}`;
                    
                    return {
                        id: id,
                        name: name
                    };
                });
                
                console.log('ScheduleForm: Formatted doctors:', formattedDoctors);
                setDoctors(formattedDoctors);
                
                // Nếu có selectedDoctor, tự động chọn bác sĩ đó
                if (selectedDoctor) {
                    const doctor = formattedDoctors.find(d => d.id.toString() === selectedDoctor.toString());
                    if (doctor) {
                        setFormData(prev => ({
                            ...prev,
                            doctorId: doctor.id,
                            doctorName: doctor.name
                        }));
                    }
                }
            } else {
                console.log('ScheduleForm: No doctor data received');
                setDoctors([]);
                setError('Không có dữ liệu bác sĩ');
            }
        } catch (error) {
            console.error('ScheduleForm: Error fetching doctors:', error);
            setDoctors([]);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            doctorId: selectedDoctor || '',
            doctorName: '',
            date: moment(selectedDate).format('YYYY-MM-DD'),
            status: 'available',
            slot: '08:00:00',
            repeatWeekly: false,
            repeatCount: 1,
            roomCode: '101'
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Cập nhật formData
        const updatedFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };
        
        setFormData(updatedFormData);

        // Nếu thay đổi bác sĩ, cập nhật doctorName
        if (name === 'doctorId') {
            const selectedDoc = doctors.find(doc => doc.id.toString() === value.toString());
            if (selectedDoc) {
                const newFormData = {
                    ...updatedFormData,
                    doctorId: value,
                    doctorName: selectedDoc.name
                };
                setFormData(newFormData);
            }
        }
    };

    // Hàm chuyển đổi thứ sang tiếng Việt
    const formatVietnameseDay = (date) => {
        const weekdays = [
            'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 
            'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
        ];
        const dayOfWeek = moment(date).day(); // 0 = Chủ nhật, 1 = Thứ hai, ...
        return weekdays[dayOfWeek];
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.group('Schedule Form Submission');
        console.log('Form data:', formData);
        
        if (!formData.doctorId) {
            console.error('Missing doctorId');
            console.groupEnd();
            onShowToast('Vui lòng chọn bác sĩ', 'danger');
            return;
        }
        
        if (!formData.slot) {
            console.error('Missing slot');
            console.groupEnd();
            onShowToast('Vui lòng chọn khung giờ làm việc', 'danger');
            return;
        }
        
        // Kiểm tra ngày
        if (!formData.date) {
            console.error('Missing date');
            console.groupEnd();
            onShowToast('Vui lòng chọn ngày', 'danger');
            return;
        }

        // Kiểm tra ngày có phải là quá khứ không
        if (moment(formData.date).isBefore(moment(), 'day')) {
            console.error('Date is in the past', formData.date);
            console.groupEnd();
            onShowToast('Không thể đặt lịch cho ngày đã qua!', 'danger');
            return;
        }

        // Kiểm tra ngày có phải Chủ nhật không
        if (moment(formData.date).day() === 0) { // 0 = Chủ nhật
            console.error('Cannot schedule on Sunday', formData.date);
            console.groupEnd();
            onShowToast('Không thể đặt lịch vào Chủ nhật!', 'danger');
            return;
        }

        // Kiểm tra trùng lịch
        const conflictingSchedules = existingSchedules.filter(schedule => 
            schedule.date === formData.date && 
            schedule.doctorId.toString() === formData.doctorId.toString() &&
            schedule.slot === formData.slot
        );

        if (conflictingSchedules.length > 0) {
            console.error('Schedule conflicts with existing schedules', conflictingSchedules);
            console.groupEnd();
            onShowToast('Bác sĩ đã có lịch vào khung giờ này!', 'danger');
            return;
        }

        console.log('Form validation successful');
        console.groupEnd();

        // Tạo lịch mới
        if (formData.repeatWeekly && formData.repeatCount > 1) {
            // Tạo nhiều lịch lặp lại theo tuần
            const schedules = [];
            
            for (let i = 0; i < formData.repeatCount; i++) {
                const newDate = moment(formData.date).add(i * 7, 'days').format('YYYY-MM-DD');
                
                // Kiểm tra xem ngày mới có trùng với lịch hiện có không
                const hasConflict = existingSchedules.some(schedule => 
                    schedule.date === newDate && 
                    schedule.doctorId.toString() === formData.doctorId.toString() &&
                    schedule.slot === formData.slot
                );
                
                if (!hasConflict) {
                    const selectedDoc = doctors.find(doc => doc.id.toString() === formData.doctorId.toString());
                    const doctorName = selectedDoc ? selectedDoc.name : '';
                    
                    const newSchedule = {
                        doctorId: formData.doctorId,
                        doctorName: doctorName,
                        date: newDate,
                        status: StatusMapping[formData.status] || 'Trống',
                        slot: formData.slot,
                        roomCode: formData.roomCode,
                        type: null,
                        patient_id: null
                    };
                    
                    schedules.push(newSchedule);
                }
            }
            
            // Thông báo số lịch được tạo
            if (schedules.length > 0) {
                console.log('Creating multiple schedules:', schedules);
                onScheduleCreated(schedules);
            } else {
                onShowToast('Không thể tạo lịch do trùng lặp với lịch hiện có', 'warning');
            }
        } else {
            // Tạo một lịch đơn
            const selectedDoc = doctors.find(doc => doc.id.toString() === formData.doctorId.toString());
            const doctorName = selectedDoc ? selectedDoc.name : '';
            
            const newSchedule = {
                doctorId: formData.doctorId,
                doctorName: doctorName,
                date: formData.date,
                status: StatusMapping[formData.status] || 'Trống',
                slot: formData.slot,
                roomCode: formData.roomCode,
                type: null,
                patient_id: null
            };
            
            console.log('Creating single schedule:', newSchedule);
            onScheduleCreated(newSchedule);
        }
        
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="schedule-form-modal">
            <Modal.Header closeButton>
                <Modal.Title>Tạo lịch làm việc mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Bác sĩ</Form.Label>
                                {loading ? (
                                    <div className="d-flex align-items-center">
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        <span>Đang tải danh sách bác sĩ...</span>
                                    </div>
                                ) : (
                                    <Form.Select
                                        name="doctorId"
                                        value={formData.doctorId}
                                        onChange={handleChange}
                                        disabled={loading || doctors.length === 0}
                                        required
                                    >
                                        <option value="">Chọn bác sĩ</option>
                                        {doctors.map(doctor => (
                                            <option key={doctor.id} value={doctor.id}>
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="4">Ngày khám</Form.Label>
                                <Col sm="8">
                                    <Form.Control
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        min={moment().format('YYYY-MM-DD')}
                                        required
                                    />
                                    <small className="form-text text-muted">
                                        {formData.date && `Ngày ${moment(formData.date).format('DD/MM/YYYY')} (${formatVietnameseDay(formData.date)})`}
                                    </small>
                                </Col>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Phòng khám</Form.Label>
                                <Form.Select
                                    name="roomCode"
                                    value={formData.roomCode}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="101">Phòng 101</option>
                                    <option value="102">Phòng 102</option>
                                    <option value="103">Phòng 103</option>
                                    <option value="201">Phòng 201</option>
                                    <option value="202">Phòng 202</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Khung giờ</Form.Label>
                                <Form.Select
                                    name="slot"
                                    value={formData.slot}
                                    onChange={handleChange}
                                    required
                                >
                                    {timeSlots.map(slot => (
                                        <option 
                                            key={slot.value} 
                                            value={slot.value}
                                        >
                                            {slot.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Thiết lập thời gian làm việc cho bác sĩ
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Check 
                                    type="checkbox"
                                    name="repeatWeekly"
                                    label="Lặp lại hàng tuần"
                                    checked={formData.repeatWeekly}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            {formData.repeatWeekly && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Số tuần lặp lại</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="repeatCount"
                                        value={formData.repeatCount}
                                        onChange={handleChange}
                                        min={1}
                                        max={12}
                                    />
                                </Form.Group>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-end">
                <div className="d-flex gap-2">
                    <Button variant="secondary" onClick={onHide} className="px-4">
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} className="px-4">
                        Tạo lịch
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ScheduleForm;
