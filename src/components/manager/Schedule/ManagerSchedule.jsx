import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DoctorFilter from './DoctorFilter';
import StatusFilter from './StatusFilter';
import ScheduleForm from './ScheduleForm';
import ScheduleDetail from './ScheduleDetail';
import { Row, Col, ToastContainer, Toast, Form } from 'react-bootstrap';
import { BsCalendarPlus } from 'react-icons/bs';
import moment from 'moment';
import './CustomButtons.css';
import './Schedule.css';
import { StaffRole } from '../../../types/schedule.types';

const ManagerSchedule = () => {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showRoleLegend, setShowRoleLegend] = useState(true);

    // Mock schedules data for testing
    useEffect(() => {
        // Giả lập dữ liệu lịch làm việc
        const mockSchedules = [
            {
                id: 1,
                title: 'BS. Phát - Làm việc',
                date: moment().format('YYYY-MM-DD'),
                status: 'available',
                doctorId: 1,
                doctorName: 'BS. Phát',
                morning: true,
                afternoon: true,
                note: 'Lịch làm việc mẫu',
                role: StaffRole.DOCTOR
            },
            {
                id: 2,
                title: 'BS. Sơn - Làm việc',
                date: moment().add(1, 'days').format('YYYY-MM-DD'),
                status: 'available',
                doctorId: 2,
                doctorName: 'BS. Sơn',
                morning: true,
                afternoon: false,
                note: 'Chỉ làm việc buổi sáng',
                role: StaffRole.DOCTOR
            },
            {
                id: 3,
                title: 'BS. Khiết - Nghỉ phép',
                date: moment().add(2, 'days').format('YYYY-MM-DD'),
                status: 'on_leave',
                doctorId: 3,
                doctorName: 'BS. Khiết',
                morning: false,
                afternoon: false,
                note: 'Nghỉ phép cả ngày',
                role: StaffRole.DOCTOR
            },
            {
                id: 4,
                title: 'Linh - Làm việc',
                date: moment().format('YYYY-MM-DD'),
                status: 'available',
                staffId: 101,
                staffName: 'Linh',
                morning: true,
                afternoon: true,
                note: 'Y tá phụ trách ca sáng và chiều',
                role: StaffRole.NURSE
            },

        ];

        setSchedules(mockSchedules);
    }, []);

    const handleAddClick = (date) => {
        // Kiểm tra xem ngày được chọn có phải là ngày quá khứ không
        if (moment(date).isBefore(moment(), 'day')) {
            showToast('Không thể đặt lịch cho ngày đã qua!', 'danger');
            return;
        }
        
        setSelectedDate(date);
        setShowForm(true);
    };

    const handleScheduleSelect = (schedule) => {
        console.log("Selected schedule:", schedule);
        setSelectedSchedule(schedule);
        setShowDetail(true);
    };

    const handleScheduleCreated = (newSchedule) => {
        setSchedules([...schedules, newSchedule]);
    };

    const handleScheduleUpdate = (updatedSchedule) => {
        setSchedules(schedules.map(schedule => 
            schedule.id === updatedSchedule.id ? updatedSchedule : schedule
        ));
    };

    const handleScheduleDelete = (scheduleId) => {
        setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    };

    // Danh sách các vai trò để lọc
    const roleOptions = [
        { value: null, label: 'Tất cả' },
        { value: StaffRole.DOCTOR, label: 'Bác sĩ' },
        { value: StaffRole.NURSE, label: 'Y tá' }
    ];

    const filteredSchedules = schedules.filter(schedule => {
        let match = true;
        
        if (selectedDoctor) {
            match = match && schedule.doctorId?.toString() === selectedDoctor.toString();
        }
        
        if (selectedStatus) {
            match = match && schedule.status === selectedStatus;
        }
        
        if (selectedRole) {
            match = match && schedule.role === selectedRole;
        }
        
        return match;
    });

    // Hàm hiển thị Toast
    const showToast = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    // Render chú thích các vai trò
    const renderRoleLegend = () => {
        if (!showRoleLegend) return null;
        
        return (
            <div className="role-legend">
                <div className="role-legend-item">
                    <div className="role-legend-color role-DOCTOR-color"></div>
                    <span>Bác sĩ</span>
                </div>
                <div className="role-legend-item">
                    <div className="role-legend-color role-NURSE-color"></div>
                    <span>Y tá</span>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid py-4">
            <div className="schedule-header">
                <h1 className="schedule-title text-center">Quản lý lịch làm việc</h1>
            </div>

            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
                <Toast 
                    onClose={() => setToast({...toast, show: false})} 
                    show={toast.show} 
                    delay={3000} 
                    autohide 
                    bg={toast.type}
                >
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Thông báo</strong>
                    </Toast.Header>
                    <Toast.Body className={toast.type === 'danger' ? 'text-white' : 'text-white'}>
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Row className="mb-4 align-items-center">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Vai trò</Form.Label>
                        <Form.Select 
                            value={selectedRole || ''} 
                            onChange={(e) => setSelectedRole(e.target.value || null)}
                        >
                            {roleOptions.map((option, idx) => (
                                <option key={idx} value={option.value || ''}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <DoctorFilter 
                        onDoctorSelect={setSelectedDoctor} 
                        selectedDoctor={selectedDoctor} 
                    />
                </Col>
                <Col md={3}>
                    <StatusFilter 
                        onStatusSelect={setSelectedStatus} 
                        selectedStatus={selectedStatus} 
                    />
                </Col>
                <Col md={3} className="text-end">
                    <button 
                        className="add-schedule-button"
                        onClick={() => handleAddClick(new Date())}
                    >
                        <BsCalendarPlus className="add-schedule-button-icon" />
                        Thêm lịch mới
                    </button>
                </Col>
            </Row>

            <Form.Check 
                type="checkbox"
                id="show-role-legend"
                label="Hiển thị chú thích vai trò"
                checked={showRoleLegend}
                onChange={(e) => setShowRoleLegend(e.target.checked)}
                className="mb-2"
            />

            {renderRoleLegend()}

            <Calendar 
                events={filteredSchedules}
                onDateSelect={handleAddClick}
                onEventSelect={handleScheduleSelect}
            />

            <ScheduleForm 
                show={showForm}
                onHide={() => setShowForm(false)}
                selectedDate={selectedDate}
                selectedDoctor={selectedDoctor}
                onScheduleCreated={handleScheduleCreated}
                existingSchedules={schedules}
                onShowToast={showToast}
            />

            <ScheduleDetail 
                show={showDetail}
                onHide={() => setShowDetail(false)}
                schedule={selectedSchedule}
                onDelete={handleScheduleDelete}
                onUpdate={handleScheduleUpdate}
                onShowToast={showToast}
            />
        </div>
    );
};

export default ManagerSchedule;
