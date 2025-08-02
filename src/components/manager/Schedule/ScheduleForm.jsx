import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { notification } from 'antd';
import { ScheduleStatus, SlotTimes, StatusMapping } from '../../../types/schedule.types';
import moment from 'moment';
import { BsPerson, BsCalendarCheck, BsDoorOpen, BsClock, BsLayersFill, BsArrowRepeat, BsPersonPlus } from 'react-icons/bs';
import { fetchAllDoctorsAPI } from '../../../services/user.service';
import '../../../styles/manager/ScheduleForm.css';

const ScheduleForm = ({ show, onHide, selectedDate, selectedDoctor, onScheduleCreated, existingSchedules, onShowToast }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
    const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDoctorIndex, setSelectedDoctorIndex] = useState(-1);
    const [formData, setFormData] = useState({
        doctorId: selectedDoctor || '',
        doctorName: '',
        date: moment(selectedDate).format('YYYY-MM-DD'),
        status: ScheduleStatus.AVAILABLE,
        slot: '08:00:00',
        repeatWeekly: false,
        repeatCount: 1,
        roomCode: '101',
        scheduleType: 'single',
        shiftType: 'morning',
        maxPatients: 3
    });

    const timeSlots = SlotTimes;

    const morningShiftSlots = timeSlots.filter(slot =>
        ['08:00:00', '09:00:00', '10:00:00', '11:00:00'].includes(slot.value)
    );

    const afternoonShiftSlots = timeSlots.filter(slot =>
        ['13:00:00', '14:00:00', '15:00:00', '16:00:00'].includes(slot.value)
    );

    useEffect(() => {
        if (show) {
            fetchDoctors();
            resetForm();
        }
    }, [show, selectedDate, selectedDoctor]);

    useEffect(() => {
        setFilteredDoctors(doctors);
    }, [doctors]);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllDoctorsAPI();
            let doctorsData = [];

            if (response && response.data) {
                doctorsData = response.data;
            } else if (response && Array.isArray(response)) {
                doctorsData = response;
            } else if (response) {
                doctorsData = response;
            }

            const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
            if (doctorsList.length > 0) {
                const formattedDoctors = doctorsList.map(doctor => {
                    const id = doctor.id || doctor.userId || doctor.user_id;
                    const name = doctor.full_name || doctor.fullName || doctor.name || doctor.username || `BS. ${id}`;

                    return {
                        id: id,
                        name: name
                    };
                });
                setDoctors(formattedDoctors);
                setFilteredDoctors(formattedDoctors); 

                if (selectedDoctor) {
                    const doctor = formattedDoctors.find(d => d.id.toString() === selectedDoctor.toString());
                    if (doctor) {
                        setFormData(prev => ({
                            ...prev,
                            doctorId: doctor.id,
                            doctorName: doctor.name
                        }));
                        setDoctorSearchTerm(doctor.name);
                    }
                }
            } else {
                setDoctors([]);
                setError('Không có dữ liệu bác sĩ');
            }
        } catch {
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
            roomCode: '101',
            scheduleType: 'single',
            shiftType: 'morning',
            maxPatients: 3
        });

        setDoctorSearchTerm('');
        setShowDoctorDropdown(false);
        setFilteredDoctors(doctors);
    };

    const filterDoctors = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredDoctors(doctors);
        } else {
            const filtered = doctors.filter(doctor =>
                doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDoctors(filtered);
        }
    };

    const handleDoctorSearchChange = (e) => {
        const searchTerm = e.target.value;
        setDoctorSearchTerm(searchTerm);
        filterDoctors(searchTerm);
        setShowDoctorDropdown(true);
        setSelectedDoctorIndex(-1); 

        const exactMatch = doctors.find(doctor =>
            doctor.name.toLowerCase() === searchTerm.toLowerCase()
        );
        if (!exactMatch || !searchTerm.trim()) {
            setFormData(prev => ({
                ...prev,
                doctorId: '',
                doctorName: ''
            }));
        }
    };

    const handleDoctorSelect = (doctor) => {
        setFormData(prev => ({
            ...prev,
            doctorId: doctor.id,
            doctorName: doctor.name
        }));
        setDoctorSearchTerm(doctor.name);
        setShowDoctorDropdown(false);
    };

    const handleDoctorInputFocus = () => {
        setShowDoctorDropdown(true);
        if (!doctorSearchTerm.trim()) {
            setFilteredDoctors(doctors);
        } else {
            filterDoctors(doctorSearchTerm);
        }
    };

    const handleDoctorInputBlur = () => {
        setTimeout(() => {
            setShowDoctorDropdown(false);
            setSelectedDoctorIndex(-1);
        }, 200);
    };

    const handleClearDoctorSelection = () => {
        setDoctorSearchTerm('');
        setFormData(prev => ({
            ...prev,
            doctorId: '',
            doctorName: ''
        }));
        setShowDoctorDropdown(false);
        setSelectedDoctorIndex(-1);
        setFilteredDoctors(doctors);
    };

    const handleDateFieldClick = () => {
        const dateInput = document.querySelector('input[name="date"]');
        if (dateInput) {
            dateInput.focus();
            dateInput.showPicker?.();
        }
    };

    const handleScheduleTypeClick = (type) => {
        setFormData(prev => ({
            ...prev,
            scheduleType: type
        }));
    };

    const handleShiftTypeClick = (type) => {
        setFormData(prev => ({
            ...prev,
            shiftType: type
        }));
    };

    const handleDoctorKeyDown = (e) => {
        if (!showDoctorDropdown) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedDoctorIndex(prev =>
                    prev < filteredDoctors.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedDoctorIndex(prev =>
                    prev > 0 ? prev - 1 : filteredDoctors.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedDoctorIndex >= 0 && filteredDoctors[selectedDoctorIndex]) {
                    handleDoctorSelect(filteredDoctors[selectedDoctorIndex]);
                }
                break;
            case 'Escape':
                setShowDoctorDropdown(false);
                setSelectedDoctorIndex(-1);
                break;
            default:
                setSelectedDoctorIndex(-1);
                break;
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let updatedValue = type === 'checkbox' ? checked : value;

        if (name === 'roomCode') {
            updatedValue = value.replace(/[^0-9]/g, '');
            if (updatedValue.length > 3) {
                updatedValue = updatedValue.slice(0, 3);
            }
        }

        const updatedFormData = {
            ...formData,
            [name]: updatedValue
        };

        setFormData(updatedFormData);

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

    const formatVietnameseDay = (date) => {
        const weekdays = [
            'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư',
            'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
        ];
        const dayOfWeek = moment(date).day();
        return weekdays[dayOfWeek];
    };

    const validateForm = () => {
        if (!formData.doctorId) {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng chọn bác sĩ từ danh sách',
                placement: 'topRight',
                duration: 3
            });
            return false;
        }

        if (formData.scheduleType === 'single' && !formData.slot) {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng chọn khung giờ làm việc',
                placement: 'topRight',
                duration: 3
            });
            return false;
        }

        if (!formData.date) {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng chọn ngày',
                placement: 'topRight',
                duration: 3
            });
            return false;
        }

        if (moment(formData.date).isBefore(moment(), 'day')) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể đặt lịch cho ngày đã qua!',
                placement: 'topRight',
                duration: 3
            });
            return false;
        }

        if (moment(formData.date).day() === 0) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể đặt lịch vào Chủ nhật!',
                placement: 'topRight',
                duration: 3
            });
            return false;
        }

        if (!formData.roomCode || formData.roomCode.trim() === '') {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng nhập số phòng',
                placement: 'topRight',
                duration: 3
            });
            return false;
        }
        return true;
    };

    const createSchedule = () => {
        const maxPatients = Math.min(Math.max(parseInt(formData.maxPatients) || 1, 1), 5);
        if (formData.scheduleType === 'shift') {
            const shiftSlots = formData.shiftType === 'morning' ? morningShiftSlots : afternoonShiftSlots;
            const schedules = [];

            for (const slotObj of shiftSlots) {
                const conflictingSchedules = existingSchedules.filter(schedule =>
                    schedule.date === formData.date &&
                    schedule.doctorId.toString() === formData.doctorId.toString() &&
                    schedule.slot === slotObj.value
                );

                if (conflictingSchedules.length === 0) {
                    const selectedDoc = doctors.find(doc => doc.id.toString() === formData.doctorId.toString());
                    const doctorName = selectedDoc ? selectedDoc.name : '';

                    for (let i = 0; i < maxPatients; i++) {
                        const newSchedule = {
                            doctorId: formData.doctorId,
                            doctorName: doctorName,
                            date: formData.date,
                            status: StatusMapping[formData.status] || 'Trống',
                            slot: slotObj.value,
                            roomCode: formData.roomCode,
                            type: null,
                            patient_id: null,
                            shiftType: formData.shiftType,
                            maxPatients: maxPatients 
                        };

                        schedules.push(newSchedule);
                    }
                } else {
                    notification.warning({
                        message: 'Cảnh báo',
                        description: `Đã có lịch cho khung giờ ${slotObj.label}. Vui lòng chọn khung giờ khác.`,
                        placement: 'topRight',
                        duration: 3
                    });
                }
            }

            if (formData.repeatWeekly && formData.repeatCount > 1) {
                for (let weekIndex = 1; weekIndex < formData.repeatCount; weekIndex++) {
                    const newDate = moment(formData.date).add(weekIndex * 7, 'days').format('YYYY-MM-DD');
                    for (const slotObj of shiftSlots) {
                        const conflictingSchedules = existingSchedules.filter(schedule =>
                            schedule.date === newDate &&
                            schedule.doctorId.toString() === formData.doctorId.toString() &&
                            schedule.slot === slotObj.value
                        );

                        if (conflictingSchedules.length === 0) {
                            const selectedDoc = doctors.find(doc => doc.id.toString() === formData.doctorId.toString());
                            const doctorName = selectedDoc ? selectedDoc.name : '';

                            for (let i = 0; i < maxPatients; i++) {
                                const newSchedule = {
                                    doctorId: formData.doctorId,
                                    doctorName: doctorName,
                                    date: newDate,
                                    status: StatusMapping[formData.status] || 'Trống',
                                    slot: slotObj.value,
                                    roomCode: formData.roomCode,
                                    type: null,
                                    patient_id: null,
                                    shiftType: formData.shiftType,
                                    maxPatients: maxPatients 
                                };

                                schedules.push(newSchedule);
                            }
                        }
                    }
                }
            }

            if (schedules.length > 0) {
                setTimeout(() => {
                    onScheduleCreated(schedules);
                }, 0);
            } else {
                notification.warning({
                    message: 'Cảnh báo',
                    description: 'Không thể tạo lịch do trùng lặp với lịch hiện có',
                    placement: 'topRight',
                    duration: 3
                });
            }
        } else {
            const conflictingSchedules = existingSchedules.filter(schedule =>
                schedule.date === formData.date &&
                schedule.doctorId.toString() === formData.doctorId.toString() &&
                schedule.slot === formData.slot
            );

            if (conflictingSchedules.length > 0) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Bác sĩ đã có lịch vào khung giờ này!',
                    placement: 'topRight',
                    duration: 3
                });
                return;
            }
            const selectedDoc = doctors.find(doc => doc.id.toString() === formData.doctorId.toString());
            const doctorName = selectedDoc ? selectedDoc.name : '';
            const schedules = [];

            for (let i = 0; i < maxPatients; i++) {
                const newSchedule = {
                    doctorId: formData.doctorId,
                    doctorName: doctorName,
                    date: formData.date,
                    status: StatusMapping[formData.status] || 'Trống',
                    slot: formData.slot,
                    roomCode: formData.roomCode,
                    type: null,
                    patient_id: null,
                    maxPatients: maxPatients 
                };
                schedules.push(newSchedule);
            }
            setTimeout(() => {
                onScheduleCreated(schedules);
            }, 0);
        }
        onHide();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowConfirmation(true);
        }
    };

    const handleConfirmCreate = () => {
        setShowConfirmation(false);
        createSchedule();
    };

    const handleCancelCreate = () => {
        setShowConfirmation(false);
    };

    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                centered
                size="lg"
                className={`schedule-form-modal ${showConfirmation ? 'blurred' : ''}`}
            >
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <BsCalendarCheck className="me-2 text-primary" size={22} />
                        Tạo lịch làm việc mới
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            color: '#cf1322'
                        }}>
                            {error}
                        </div>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <div className="schedule-section mb-3">
                            <h6 className="section-title">Thông tin cơ bản</h6>
                            <div className="section-content">
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="d-flex align-items-center">
                                                <BsPerson className="me-2 text-primary" />
                                                Bác sĩ
                                            </Form.Label>
                                            {loading ? (
                                                <div className="d-flex align-items-center">
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    <span>Đang tải danh sách bác sĩ...</span>
                                                </div>
                                            ) : (
                                                <div className="searchable-dropdown-container">
                                                    <div className="input-with-clear-container">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Tìm kiếm hoặc chọn bác sĩ..."
                                                            value={doctorSearchTerm}
                                                            onChange={handleDoctorSearchChange}
                                                            onFocus={handleDoctorInputFocus}
                                                            onBlur={handleDoctorInputBlur}
                                                            onKeyDown={handleDoctorKeyDown}
                                                            disabled={loading || doctors.length === 0}
                                                            className="doctor-search-input"
                                                            autoComplete="off"
                                                            role="combobox"
                                                            aria-expanded={showDoctorDropdown}
                                                            aria-haspopup="listbox"
                                                            aria-autocomplete="list"
                                                            aria-label="Tìm kiếm và chọn bác sĩ"
                                                        />
                                                        {doctorSearchTerm && (
                                                            <button
                                                                type="button"
                                                                className="clear-selection-btn"
                                                                onClick={handleClearDoctorSelection}
                                                                aria-label="Xóa lựa chọn bác sĩ"
                                                                title="Xóa lựa chọn"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                    {showDoctorDropdown && filteredDoctors.length > 0 && (
                                                        <div
                                                            className="dropdown-menu show doctor-dropdown-menu"
                                                            role="listbox"
                                                            aria-label="Danh sách bác sĩ"
                                                        >
                                                            {filteredDoctors.map((doctor, index) => (
                                                                <button
                                                                    key={doctor.id}
                                                                    type="button"
                                                                    className={`dropdown-item ${formData.doctorId === doctor.id ? 'active' : ''
                                                                        } ${selectedDoctorIndex === index ? 'highlighted' : ''
                                                                        }`}
                                                                    onClick={() => handleDoctorSelect(doctor)}
                                                                    role="option"
                                                                    aria-selected={formData.doctorId === doctor.id}
                                                                    tabIndex={-1}
                                                                >
                                                                    <div className="doctor-option">
                                                                        <div className="doctor-name">{doctor.name}</div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {showDoctorDropdown && filteredDoctors.length === 0 && doctorSearchTerm && (
                                                        <div className="dropdown-menu show doctor-dropdown-menu">
                                                            <div className="dropdown-item-text text-muted">
                                                                Không tìm thấy bác sĩ nào
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="d-flex align-items-center">
                                                <BsCalendarCheck className="me-2 text-primary" />
                                                Ngày khám
                                            </Form.Label>
                                            <div className="date-input-container" onClick={handleDateFieldClick}>
                                                <Form.Control
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                    min={moment().format('YYYY-MM-DD')}
                                                    required
                                                    className="clickable-date-input"
                                                />
                                                <BsCalendarCheck
                                                    className="custom-calendar-icon"
                                                    onClick={handleDateFieldClick}
                                                    title="Chọn ngày"
                                                />
                                            </div>
                                            {formData.date && (
                                                <div className="date-display">
                                                    <span className="date-badge">
                                                        {moment(formData.date).format('DD/MM/YYYY')} ({formatVietnameseDay(formData.date)})
                                                    </span>
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="d-flex align-items-center">
                                                <BsDoorOpen className="me-2 text-primary" />
                                                Phòng khám
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="roomCode"
                                                value={formData.roomCode}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="d-flex align-items-center">
                                                <BsPersonPlus className="me-2 text-primary" />
                                                Số bệnh nhân tối đa
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="maxPatients"
                                                value={formData.maxPatients}
                                                onChange={handleChange}
                                                min={1}
                                                max={5}
                                                required
                                            />
                                            <Form.Text className="text-muted">
                                                Số lượng bệnh nhân tối đa có thể đặt lịch trong cùng khung giờ này (tối đa 5)
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        <div className="schedule-section mb-3">
                            <h6 className="section-title">Kiểu đặt lịch</h6>
                            <div className="section-content">
                                <div className="schedule-type-options">
                                    <div
                                        className={`schedule-option clickable-option ${formData.scheduleType === 'single' ? 'active' : ''}`}
                                        onClick={() => handleScheduleTypeClick('single')}
                                    >
                                        <Form.Check
                                            type="radio"
                                            id="schedule-type-single"
                                            name="scheduleType"
                                            value="single"
                                            label={
                                                <div className="option-content">
                                                    <div className="option-icon">
                                                        <BsClock size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="option-label">Đặt lịch theo khung giờ</div>
                                                        <div className="option-desc">Tạo lịch làm việc cho một khung giờ cụ thể</div>
                                                    </div>
                                                </div>
                                            }
                                            checked={formData.scheduleType === 'single'}
                                            onChange={handleChange}
                                            className="custom-radio"
                                        />
                                    </div>

                                    <div
                                        className={`schedule-option clickable-option ${formData.scheduleType === 'shift' ? 'active' : ''}`}
                                        onClick={() => handleScheduleTypeClick('shift')}
                                    >
                                        <Form.Check
                                            type="radio"
                                            id="schedule-type-shift"
                                            name="scheduleType"
                                            value="shift"
                                            label={
                                                <div className="option-content">
                                                    <div className="option-icon">
                                                        <BsLayersFill size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="option-label">Đặt lịch theo ca làm việc</div>
                                                        <div className="option-desc">Tự động tạo lịch cho tất cả khung giờ trong ca</div>
                                                    </div>
                                                </div>
                                            }
                                            checked={formData.scheduleType === 'shift'}
                                            onChange={handleChange}
                                            className="custom-radio"
                                        />
                                    </div>
                                </div>

                                {formData.scheduleType === 'single' ? (
                                    <div className="mt-3">
                                        <Form.Group>
                                            <Form.Label className="d-flex align-items-center">
                                                <BsClock className="me-2 text-primary" />
                                                Chọn khung giờ
                                            </Form.Label>
                                            <Form.Select
                                                name="slot"
                                                value={formData.slot}
                                                onChange={handleChange}
                                                required
                                            >
                                                {timeSlots.map(slot => (
                                                    <option key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Text className="text-muted">
                                                Thiết lập thời gian làm việc cho bác sĩ
                                            </Form.Text>
                                        </Form.Group>
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <Form.Label className="d-flex align-items-center mb-2">
                                            <BsLayersFill className="me-2 text-primary" />
                                            Chọn ca làm việc
                                        </Form.Label>
                                        <div className="shift-type-options">
                                            <div
                                                className={`shift-option clickable-option ${formData.shiftType === 'morning' ? 'active' : ''}`}
                                                onClick={() => handleShiftTypeClick('morning')}
                                            >
                                                <Form.Check
                                                    type="radio"
                                                    id="shift-type-morning"
                                                    name="shiftType"
                                                    value="morning"
                                                    label="Ca sáng"
                                                    checked={formData.shiftType === 'morning'}
                                                    onChange={handleChange}
                                                />
                                                <div className="shift-time">08:00 - 11:00</div>
                                                <div className="shift-slots-info">4 khung giờ</div>
                                            </div>
                                            <div
                                                className={`shift-option clickable-option ${formData.shiftType === 'afternoon' ? 'active' : ''}`}
                                                onClick={() => handleShiftTypeClick('afternoon')}
                                            >
                                                <Form.Check
                                                    type="radio"
                                                    id="shift-type-afternoon"
                                                    name="shiftType"
                                                    value="afternoon"
                                                    label="Ca chiều"
                                                    checked={formData.shiftType === 'afternoon'}
                                                    onChange={handleChange}
                                                />
                                                <div className="shift-time">13:00 - 16:00</div>
                                                <div className="shift-slots-info">4 khung giờ</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="schedule-section">
                            <h6 className="section-title">Tùy chọn lặp lại</h6>
                            <div className="section-content">
                                <div className="d-flex align-items-center mb-2">
                                    <BsArrowRepeat className="me-2 text-primary" />
                                    <Form.Check
                                        type="checkbox"
                                        id="repeatWeekly"
                                        name="repeatWeekly"
                                        label="Lặp lại lịch hàng tuần"
                                        checked={formData.repeatWeekly}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-text ms-4">
                                    Tự động tạo lịch cho các tuần tiếp theo với cùng ngày trong tuần
                                </div>

                                {formData.repeatWeekly && (
                                    <div className="repeat-options ms-4 mt-3">
                                        <Form.Group>
                                            <Form.Label>Số tuần lặp lại</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="repeatCount"
                                                value={formData.repeatCount}
                                                onChange={handleChange}
                                                min={1}
                                                max={12}
                                                className="repeat-count"
                                            />
                                        </Form.Group>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <div className="button-container">
                        <div></div>
                        <div className="action-buttons">
                            <Button
                                variant="outline-secondary"
                                onClick={onHide}
                                className="btn-action"
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={handleSubmit}
                                className="btn-action"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-1" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Tạo lịch'
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showConfirmation}
                onHide={handleCancelCreate}
                centered
                size="md"
                className="confirmation-modal"
                backdrop="static"
                keyboard={false}
                enforceFocus={true}
            >
                <Modal.Header closeButton className="confirmation-header">
                    <Modal.Title className="d-flex align-items-center">
                        <BsCalendarCheck className="me-2 text-warning" size={24} />
                        Xác nhận tạo lịch
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="confirmation-body">
                    <div className="confirmation-content">
                        <p className="confirmation-question mb-4">
                            Bạn có chắc chắn muốn tạo lịch này không?
                        </p>
                        <div className="schedule-summary-grid">
                            <div className="summary-row">
                                <div className="summary-item">
                                    <span className="summary-label">Bác sĩ:</span>
                                    <span className="summary-value">{formData.doctorName || 'Chưa chọn'}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Ngày:</span>
                                    <span className="summary-value">
                                        {moment(formData.date).format('DD/MM/YYYY')} ({formatVietnameseDay(formData.date)})
                                    </span>
                                </div>
                            </div>
                            <div className="summary-row">
                                <div className="summary-item">
                                    <span className="summary-label">Phòng:</span>
                                    <span className="summary-value">{formData.roomCode}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">
                                        {formData.scheduleType === 'single' ? 'Khung giờ:' : 'Ca làm việc:'}
                                    </span>
                                    <span className="summary-value">
                                        {formData.scheduleType === 'single'
                                            ? timeSlots.find(slot => slot.value === formData.slot)?.label
                                            : formData.shiftType === 'morning' ? 'Ca sáng (08:00-11:00)' : 'Ca chiều (13:00-16:00)'
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="summary-row">
                                <div className="summary-item">
                                    <span className="summary-label">Số bệnh nhân tối đa:</span>
                                    <span className="summary-value">{formData.maxPatients}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="confirmation-footer">
                    <div className="confirmation-buttons">
                        <Button
                            variant="outline-secondary"
                            onClick={handleCancelCreate}
                            className="btn-action btn-cancel"
                            aria-label="Hủy tạo lịch"
                        >
                            Không
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={handleConfirmCreate}
                            className="btn-action btn-confirm"
                            aria-label="Xác nhận tạo lịch"
                            autoFocus
                        >
                            Có
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default ScheduleForm;
