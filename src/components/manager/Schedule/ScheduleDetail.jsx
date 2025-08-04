import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { message, notification } from 'antd';
import { ScheduleStatus, SlotTimes, StatusMapping } from '../../../types/schedule.types';
import moment from 'moment';
import { BsCalendarWeek, BsClock, BsDoorOpen, BsPerson, BsBriefcase, BsPersonPlus, BsList, BsPersonDash } from 'react-icons/bs';
import { 
    deleteScheduleAPI, 
    bulkUpdateScheduleByDoctorAndDateAPI,
    bulkDeleteSchedulesByDoctorAndDateAPI,  
    updateScheduleStatusAPI,
    getSchedulesByDoctorDateAndSlotAPI,
    testUpdateScheduleStatusAPI
} from '../../../services/schedule.service';
import '../../../styles/manager/ScheduleDetail.css';
import axios from 'axios';

const ScheduleDetail = ({ show, onHide, schedule, onUpdate, onDelete, onShowToast, onRefreshData }) => {
    const [formData, setFormData] = useState({
        id: '',
        doctorId: '',
        doctorName: '',
        date: '',
        status: ScheduleStatus.AVAILABLE,
        slot: '',
        roomCode: '',
        original_status: ScheduleStatus.AVAILABLE,
        currentPatients: 0, 
        maxPatients: 5 
    });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showSubSlots, setShowSubSlots] = useState(false);
    const [subSlots, setSubSlots] = useState([]);
    const [loadingSubSlots, setLoadingSubSlots] = useState(false);
    const [processingSubSlot, setProcessingSubSlot] = useState(null); 
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [selectedSubSlotToCancel, setSelectedSubSlotToCancel] = useState(null);
    const [processingCancel, setProcessingCancel] = useState(false);
    const timeSlots = SlotTimes;

    useEffect(() => {
        if (schedule) {
            setFormData({
                id: schedule.id,
                doctorId: schedule.doctorId,
                doctorName: schedule.doctorName,
                date: schedule.date,
                status: schedule.status,
                slot: schedule.slot || '08:00:00',
                roomCode: schedule.roomCode || '',
                original_status: schedule.original_status, 
                type: schedule.type,
                currentPatients: schedule.currentPatients || 0, 
                maxPatients: schedule.maxPatients || 5
            });
        }

        setConfirmDelete(false);
        setShowCancelConfirm(false);
        setSelectedSubSlotToCancel(null);
    }, [schedule, show]);

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.slot && formData.status === "available") {
            onShowToast('Vui lòng chọn khung giờ làm việc', 'danger');
            return;
        }
        if (!formData.roomCode || formData.roomCode.trim() === '') {
            onShowToast('Vui lòng nhập số phòng', 'danger');
            return;
        }

        setLoading(true);
        try {
            if (!formData.roomCode) {
                formData.roomCode = '101'; 
            }
            const beStatus = formData.original_status || StatusMapping[formData.status] || formData.status;
            let title = `${formData.doctorName} - ${formData.slot.substring(0, 5)} - P.${formData.roomCode}`;

            const updatedSchedule = {
                ...formData,
                title: title,
                original_status: beStatus,
            };

            await onUpdate(updatedSchedule);

            await bulkUpdateScheduleByDoctorAndDateAPI(formData.doctorId, formData.date, {
                roomCode: formData.roomCode,
                slot: formData.slot
            });

            handleClose();
        } catch (error) {
            console.error('Bulk update error:', error);
            onShowToast('Có lỗi xảy ra khi cập nhật lịch', 'danger');
        } finally {
            setLoading(false);
        }
    };


    const showDeleteConfirmation = () => {
        const currentPatients = formData.currentPatients || 0;
        if (currentPatients > 0) {
            showSubSlotsModal();
            return;
        }
        setConfirmDelete(true);
    };

    const cancelDelete = () => {
        setConfirmDelete(false);
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);

            if (!schedule || !schedule.id) {
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể xóa lịch: ID không hợp lệ',
                    placement: 'topRight',
                    duration: 3
                });
                return;
            }

            const currentPatients = formData.currentPatients || 0;

            if (currentPatients === 0) {
                try {
                    await bulkDeleteSchedulesByDoctorAndDateAPI(schedule.doctorId, schedule.date);

                    onHide();
                    onRefreshData && onRefreshData();
                    notification.success({
                        message: 'Thành công',
                        description: 'Đã xóa tất cả các lịch trong ngày của bác sĩ',
                        placement: 'topRight',
                        duration: 3
                    });
                    return;
                } catch {
                    notification.error({
                        message: 'Lỗi',
                        description: 'Không thể xóa lịch hàng loạt, vui lòng thử lại sau',
                        placement: 'topRight',
                        duration: 3
                    });
                    return;
                }
            }

            notification.warning({
                message: 'Không thể xóa lịch',
                description: `Lịch này đã có ${currentPatients} bệnh nhân đặt. Không thể xóa lịch đã có bệnh nhân.`,
                placement: 'topRight',
                duration: 5
            });
            setDeleting(false);
            setConfirmDelete(false);

        } catch {
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi xử lý yêu cầu xóa',
                placement: 'topRight',
                duration: 3
            });
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const fetchSchedulesInSameSlot = async (scheduleId) => {
        try {
            const currentSchedule = schedule;
            if (!currentSchedule) return [];
            
            // Gọi API lấy tất cả schedule cùng ngày, giờ, bác sĩ
            const schedules = await getSchedulesByDoctorDateAndSlotAPI(
                currentSchedule.doctorId,
                currentSchedule.date,
                currentSchedule.slot
            );
            
            // Xử lý dữ liệu - Backend đã trả về đầy đủ thông tin patient
            const processedSchedules = schedules.map((sched, index) => {
                // Backend trả về patient as object, không phải ID
                const hasPatient = !!(sched.patient && sched.patient.id);
                const patientInfo = sched.patient || null;
                
                return {
                    ...sched,
                    // Chỉ lấy thông tin cần thiết: tên và ID
                    patientId: patientInfo?.id || null,
                    patientName: patientInfo?.fullName || null,
                    hasPatientInfo: hasPatient
                };
            });
            
            return Array.isArray(processedSchedules) ? processedSchedules : [];
        } catch (error) {
            console.error('Lỗi khi lấy danh sách lịch trong slot:', error);
            return [];
        }
    };

    const generateSubSlots = async () => {
        const schedules = await fetchSchedulesInSameSlot(schedule.id);
        
        const isPastDate = moment(schedule.date).isBefore(moment().startOf('day'));
        const maxPatients = formData.maxPatients || 5;

        // Tạo danh sách các slot đã có lịch
        const filledSlots = schedules.map((sched, index) => {
            // Sử dụng dữ liệu đã được normalized
            const hasPatient = sched.hasPatientInfo;
            const status = sched.status === 'Đã hủy'
                ? 'Đã hủy'
                : hasPatient
                    ? 'Đang hoạt động'
                    : 'Trống';

            return {
                id: sched.id,
                scheduleId: sched.id,
                slotNumber: index + 1,
                patientName: sched.patientName || null,
                patientId: sched.patientId || null,
                status,
                hasPatient,
                canDelete: !hasPatient,
                canCancel: hasPatient && status !== 'Đã hủy' && !isPastDate,
                isVirtualSlot: false
            };
        });

        // Thêm các slot trống nếu cần
        const slots = [...filledSlots];
        while (slots.length < maxPatients) {
            slots.push({
                id: `empty-${slots.length + 1}`,
                scheduleId: null,
                slotNumber: slots.length + 1,
                patientName: null,
                patientId: null,
                status: 'Trống',
                hasPatient: false,
                canDelete: true,
                canCancel: false,
                isVirtualSlot: true
            });
        }

        return slots;
    };

    const showSubSlotsModal = async () => {
    if (!schedule || !schedule.id) {
        notification.error({
            message: 'Lỗi',
            description: 'Không thể mở quản lý slot do thiếu thông tin lịch',
            placement: 'topRight',
            duration: 3
        });
        return;
    }

    setLoadingSubSlots(true);
        try {
            const slots = await generateSubSlots(); 
            setSubSlots(slots);
            setShowSubSlots(true);
        } catch (error) {
            console.error('Error loading sub slots:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách slot',
                placement: 'topRight',
                duration: 3
            });
        } finally {
            setLoadingSubSlots(false);
            setShowCancelConfirm(false);
            setSelectedSubSlotToCancel(null);
        }
    };

    const closeSubSlotsModal = () => {
        setShowSubSlots(false);

        setShowCancelConfirm(false);
        setSelectedSubSlotToCancel(null);

        setTimeout(() => {
            setSubSlots([]);
            setLoadingSubSlots(false);
        }, 300); 
    };

    const showCancelSubSlotConfirmation = (subSlot) => {
        setSelectedSubSlotToCancel(subSlot);
        setShowCancelConfirm(true);
        setProcessingSubSlot(null); 
    };

    const cancelSubSlotConfirmation = () => {
        setShowCancelConfirm(false);
        setSelectedSubSlotToCancel(null);
    };

    const confirmCancelSubSlot = async () => {
        if (selectedSubSlotToCancel) {
            setProcessingCancel(true); 
            try {
                await handleCancelSubSlotWithCancelAPI(selectedSubSlotToCancel);
            } finally {
                setProcessingCancel(false);
                setShowCancelConfirm(false);
                setSelectedSubSlotToCancel(null);
            }
        }
    };

    const handleCancelSubSlotWithCancelAPI = async (subSlot) => {
        try {
            if (!subSlot.id || subSlot.isVirtualSlot) {
                notification.warning({
                    message: 'Không thể hủy',
                    description: 'Slot này không có lịch để hủy',
                    placement: 'topRight',
                    duration: 3
                });
                return;
            }

            setProcessingSubSlot(subSlot.id);

            console.log(`🔄 Starting cancel process for schedule ${subSlot.id}`);
            
            // Thử axios trước
            try {
                console.log(`🔄 Trying axios method...`);
                const response = await updateScheduleStatusAPI(subSlot.id, "Đã hủy");

                if (response.status === 200) {
                    console.log(`✅ Axios success - Status: ${response.status}, Data:`, response.data);
                    
                    notification.success({
                        message: 'Thành công',
                        description: `Đã hủy lịch cho ${subSlot.patientName}`,
                        placement: 'topRight',
                        duration: 4
                    });

                    await showSubSlotsModal();
                    if (onRefreshData) await onRefreshData();
                    return;
                }
            } catch (axiosError) {
                console.error(`❌ Axios failed:`, axiosError);
                
                // Fallback: Thử fetch API
                console.log(`🔄 Trying fetch API fallback...`);
                try {
                    const fetchResponse = await testUpdateScheduleStatusAPI(subSlot.id, "Đã hủy");
                    
                    if (fetchResponse.ok) {
                        console.log(`✅ Fetch API success!`);
                        
                        notification.success({
                            message: 'Thành công',
                            description: `Đã hủy lịch cho ${subSlot.patientName}`,
                            placement: 'topRight',
                            duration: 4
                        });

                        await showSubSlotsModal();
                        if (onRefreshData) await onRefreshData();
                        return;
                    }
                } catch (fetchError) {
                    console.error(`❌ Fetch API also failed:`, fetchError);
                    throw axiosError; // Throw original axios error
                }
            }

            throw new Error(`Unexpected response status`);

        } catch (error) {
            console.error('❌ Lỗi khi hủy lịch:', error);
            
            let errorMessage = 'Có lỗi xảy ra khi hủy lịch';
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                switch (status) {
                    case 404:
                        errorMessage = 'Không tìm thấy lịch hẹn để hủy';
                        break;
                    case 400:
                        errorMessage = data?.message || 'Dữ liệu không hợp lệ';
                        break;
                    case 500:
                        errorMessage = 'Lỗi server, vui lòng thử lại sau';
                        break;
                    default:
                        errorMessage = data?.message || `Lỗi ${status}: ${error.response.statusText}`;
                }
                
                console.error(`❌ API Error ${status}:`, data);
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            notification.error({
                message: 'Lỗi hủy lịch',
                description: errorMessage,
                placement: 'topRight',
                duration: 5
            });
        } finally {
            setProcessingSubSlot(null);
        }
    };

    const handleDeleteSubSlot = async (subSlot) => {
        try {
            if (!subSlot.id || subSlot.isVirtualSlot) {
                notification.warning({
                    message: 'Không thể xóa',
                    description: 'Slot này không có lịch để xóa',
                    placement: 'topRight',
                    duration: 3
                });
                return;
            }

            setProcessingSubSlot(subSlot.id);
            const response = await deleteScheduleAPI(subSlot.id);

            setShowSubSlots(false);
            onHide();
            onDelete(subSlot.id);
            notification.success({
                message: 'Thành công',
                description: 'Đã xóa lịch làm việc',
                placement: 'topRight',
                duration: 3
            });

        } catch (error) {
            let errorMessage = 'Không thể xóa lịch';
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Không tìm thấy lịch hoặc lịch đã được xóa trước đó';
                } else if (error.response.status === 400) {
                    errorMessage = 'Không thể xóa lịch này';
                }
            }

            notification.error({
                message: 'Lỗi',
                description: errorMessage,
                placement: 'topRight',
                duration: 3
            });
        } finally {
            setProcessingSubSlot(null);
        }
    };

    const handleClose = () => {
        onHide();
        setConfirmDelete(false);
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    const formatVietnameseDay = (date) => {
        const weekdays = [
            'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư',
            'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
        ];
        const dayOfWeek = moment(date).day(); 
        return weekdays[dayOfWeek];
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const start = moment(timeString, 'HH:mm:ss');
        const end = moment(start).add(1, 'hour');
        return `${start.format('HH:mm')} - ${end.format('HH:mm')}`;
    };

    if (!schedule) {
        return null;
    }

    return (
        <>
            <Modal
                show={show && !showSubSlots}
                onHide={handleClose}
                centered
                size="lg"
                className="schedule-detail-modal"
                backdrop="static"
            >
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Chi tiết lịch làm việc</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {confirmDelete ? (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#cf1322' }}>Xác nhận xóa lịch làm việc</p>
                            <p style={{ marginBottom: '8px', color: '#262626' }}>Bạn có chắc chắn muốn xóa lịch làm việc của bác sĩ {formData.doctorName} vào ngày {formatDate(formData.date)} lúc {formatTime(formData.slot)}?</p>
                            <p style={{ marginBottom: '0', color: '#8c8c8c' }}>Thao tác này không thể hoàn tác và sẽ xóa dữ liệu khỏi hệ thống.</p>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <div className="schedule-info-section mb-4 p-3 border rounded bg-light">
                                <h5 className="mb-3">Thông tin chung</h5>

                                <Row className="mb-3">
                                    <Col md={6} className="d-flex align-items-center mb-2">
                                        <BsPerson className="text-primary me-2" size={20} />
                                        <div>
                                            <div className="text-muted small">Bác sĩ</div>
                                            <strong>{formData.doctorName}</strong>
                                        </div>
                                    </Col>

                                    <Col md={6} className="d-flex align-items-center mb-2">
                                        <BsDoorOpen className="text-success me-2" size={20} />
                                        <div>
                                            <div className="text-muted small">Phòng</div>
                                            <strong>Phòng {formData.roomCode}</strong>
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="d-flex align-items-center">
                                        <BsCalendarWeek className="text-info me-2" size={20} />
                                        <div>
                                            <div className="text-muted small">Ngày</div>
                                            <div className="schedule-date-value">
                                                <strong>{formatDate(formData.date)}</strong>
                                                <span className="ms-2 text-muted small">
                                                    ({formatVietnameseDay(formData.date)})
                                                </span>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={6} className="d-flex align-items-center">
                                        <BsClock className="text-warning me-2" size={20} />
                                        <div>
                                            <div className="text-muted small">Khung giờ</div>
                                            <strong>{formatTime(formData.slot)}</strong>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="mt-3 align-items-center justify-content-between">
                                    <Col md={6} className="d-flex align-items-center mb-2">
                                        <BsPersonPlus className="text-success me-2" size={20} />
                                        <div>
                                        <div className="text-muted small">Số bệnh nhân</div>
                                        <Badge
                                            bg={formData.currentPatients >= formData.maxPatients ? 'danger' :
                                            formData.currentPatients > 0 ? 'warning' : 'success'}
                                            className="p-2"
                                        >
                                            {formData.currentPatients} / {formData.maxPatients}
                                        </Badge>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div className="update-section mb-3 p-3 border rounded">
                                <h5 className="mb-3">Cập nhật thông tin</h5>

                                <Form.Group className="mb-3">
                                    <Form.Label>Khung giờ</Form.Label>
                                    <Form.Select
                                        name="slot"
                                        value={formData.slot}
                                        onChange={handleChange}
                                    >
                                        {timeSlots.map(slot => (
                                            <option key={slot.value} value={slot.value}>
                                                {slot.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phòng làm việc</Form.Label>
                                    <div className="d-flex align-items-center">
                                        <Form.Control
                                            type="text"
                                            name="roomCode"
                                            value={formData.roomCode}
                                            onChange={handleChange}
                                            placeholder="Nhập số phòng (VD: 101)"
                                            required
                                        />
                                    </div>
                                </Form.Group>
                            </div>

                            <div className="system-info p-2 border-top mt-3">
                                <small className="d-block text-muted">Cập nhật gần nhất: {moment().format('DD/MM/YYYY HH:mm')}</small>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="button-container">
                        {!confirmDelete ? (
                            <Button
                                variant="outline-danger"
                                onClick={showDeleteConfirmation}
                                disabled={deleting}
                                className="btn-action"
                            >
                                {formData.currentPatients > 0 ? (
                                    <>
                                        <BsList className="me-1" />
                                        Quản lý slot
                                    </>
                                ) : (
                                    'Xóa lịch'
                                )}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={cancelDelete}
                                    className="btn-action"
                                    disabled={deleting}
                                >
                                    Hủy xóa
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="btn-action"
                                >
                                    {deleting ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Xác nhận xóa'
                                    )}
                                </Button>
                            </>
                        )}

                        <div className="action-buttons">
                            <Button
                                variant="outline-secondary"
                                onClick={handleClose}
                                className="btn-action"
                            >
                                Đóng
                            </Button>
                            {!confirmDelete && (
                                <Button
                                    variant="outline-primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="btn-action"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Cập nhật'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showSubSlots}
                onHide={closeSubSlotsModal}
                centered
                size="lg"
                className="sub-slots-modal"
                backdrop="static"
                style={{ zIndex: 1060 }}
            >
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>
                        <BsList className="me-2" />
                        Quản lý từng ca khám
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ position: 'relative' }}>
                    <div className="mb-3">
                        <h6>Lịch: {formData.doctorName} - {formatDate(formData.date)} - {formatTime(formData.slot)}</h6>
                        <p className="text-muted small">
                            Slot này có thể chứa tối đa {formData.maxPatients} bệnh nhân.
                            Hiện tại có {formData.currentPatients} bệnh nhân đã đặt lịch.
                        </p>
                    </div>

                    {showCancelConfirm && selectedSubSlotToCancel && (
                        <div className="confirmation-overlay">
                            <div className="confirmation-card">
                                <div className="confirmation-header">
                                    <div className="confirmation-icon">
                                        <BsPersonDash size={24} />
                                    </div>
                                    <h5 className="confirmation-title">Xác nhận hủy lịch</h5>
                                </div>

                                <div className="confirmation-body">
                                    <p className="confirmation-question">
                                        Bạn có chắc chắn muốn hủy lịch của
                                    </p>
                                    <div className="patient-info">
                                        <strong>{selectedSubSlotToCancel.patientName}</strong>
                                        <span className="slot-badge">Slot {selectedSubSlotToCancel.slotNumber}</span>
                                    </div>
                                    <p className="confirmation-warning">
                                        Thao tác này không thể hoàn tác
                                    </p>
                                </div>

                                <div className="confirmation-actions">
                                    <button
                                        className="btn-cancel-action"
                                        onClick={cancelSubSlotConfirmation}
                                        disabled={processingSubSlot !== null}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        className="btn-confirm-action"
                                        onClick={confirmCancelSubSlot}
                                        disabled={processingCancel}
                                    >
                                        {processingCancel ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-1" />
                                                Đang hủy...
                                            </>
                                        ) : (
                                            'Xác nhận hủy'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {loadingSubSlots ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Đang tải danh sách...</p>
                        </div>
                    ) : (
                        <div className="sub-slots-list">
                            {subSlots.map((subSlot) => (
                                <div
                                    key={subSlot.id}
                                    className={`d-flex align-items-center justify-content-between p-3 mb-2 border rounded ${subSlot.status === 'Đã hủy' ? 'border-secondary bg-light' :
                                        subSlot.hasPatient ? 'border-warning bg-light' : 'border-success'
                                        }`}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <Badge
                                                bg={
                                                    subSlot.status === 'Đã hủy' ? 'secondary' :
                                                        subSlot.hasPatient ? 'warning' : 'success'
                                                }
                                                className="p-2"
                                            >
                                                Slot {subSlot.slotNumber}
                                            </Badge>
                                        </div>
                                        <div>
                                            <div className="fw-bold">
                                                {subSlot.hasPatient ? subSlot.patientName : 'Slot trống'}
                                            </div>
                                            
                                            <small className="text-muted">
                                                Trạng thái: <span className={
                                                    subSlot.status === 'Đã hủy' ? 'text-secondary fw-bold' :
                                                        subSlot.status === 'Đang hoạt động' ? 'text-warning' : 'text-success'
                                                }>
                                                    {subSlot.status}
                                                </span>
                                            </small>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        {subSlot.canCancel && !subSlot.isVirtualSlot && (
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => showCancelSubSlotConfirmation(subSlot)}
                                                disabled={subSlot.status === "Đã hủy" || processingSubSlot === subSlot.id}
                                            >
                                                <BsPersonDash className="me-1" />
                                                {processingSubSlot === subSlot.id ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-1" />
                                                        Đang hủy...
                                                    </>
                                                ) : (
                                                    'Hủy lịch'
                                                )}
                                            </Button>
                                        )}
                                        {subSlot.hasPatient && !subSlot.canCancel && subSlot.status !== 'Đã hủy' && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                disabled
                                                title="Không thể hủy lịch trong quá khứ"
                                            >
                                                <BsPersonDash className="me-1" />
                                                Đã quá hạn
                                            </Button>
                                        )}
                                        {subSlot.canDelete && !subSlot.isVirtualSlot && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteSubSlot(subSlot)}
                                            disabled={processingSubSlot === subSlot.id}
                                        >
                                            {processingSubSlot === subSlot.id ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-1" />
                                                    Đang xóa...
                                                </>
                                            ) : (
                                                'Xóa slot'
                                            )}
                                        </Button>
                                    )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowSubSlots(false)}
                        disabled={processingSubSlot !== null || showCancelConfirm}
                    >
                        {processingSubSlot !== null ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Đang xử lý...
                            </>
                        ) : showCancelConfirm ? (
                            'Vui lòng hoàn thành xác nhận'
                        ) : (
                            'Đóng'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default ScheduleDetail;
