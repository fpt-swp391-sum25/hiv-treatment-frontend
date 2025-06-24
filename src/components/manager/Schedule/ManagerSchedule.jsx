import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DoctorFilter from './DoctorFilter';
import StatusFilter from './StatusFilter';
import ScheduleForm from './ScheduleForm';
import ScheduleDetail from './ScheduleDetail';
import { Row, Col, ToastContainer, Toast, Form, Spinner } from 'react-bootstrap';
import { BsCalendarPlus } from 'react-icons/bs';
import moment from 'moment';
import './CustomButtons.css';
import './Schedule.css';
import { ScheduleStatus } from '../../../types/schedule.types';
import { getAllSchedulesAPI, updateScheduleAPI, deleteScheduleAPI, createScheduleAPI } from '../../../services/api.service';

const ManagerSchedule = () => {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [loading, setLoading] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Xóa bất kỳ dữ liệu lịch nào có thể được lưu trong localStorage
    useEffect(() => {
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') || 
                key.includes('calendar') || key.includes('event') || 
                key.includes('schedule')) {
                console.log('Removing from localStorage in ManagerSchedule:', key);
                localStorage.removeItem(key);
            }
        });
        
        // Xóa bất kỳ dữ liệu nào được lưu trữ trong sessionStorage
        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') || 
                key.includes('calendar') || key.includes('event') || 
                key.includes('schedule')) {
                console.log('Removing from sessionStorage in ManagerSchedule:', key);
                sessionStorage.removeItem(key);
            }
        });
        
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            console.log('Fetching schedules from API...');
            const response = await getAllSchedulesAPI();
            if (response && response.data) {
                console.log('Received schedules from API:', response.data);
                
                // Đảm bảo mỗi schedule có id và date
                const validSchedules = response.data.filter(schedule => 
                    schedule && schedule.id && schedule.date
                );
                
                if (validSchedules.length !== response.data.length) {
                    console.warn('Some schedules were filtered out due to missing required fields');
                }
                
                setSchedules(validSchedules);
                
                if (validSchedules.length === 0) {
                    showToast('Không có dữ liệu lịch từ server', 'info');
                }
            } else {
                console.log('No schedule data received from API');
                setSchedules([]);
                showToast('Không có dữ liệu lịch từ server', 'info');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setSchedules([]);
            showToast('Không thể kết nối đến server', 'danger');
        } finally {
            setLoading(false);
            setInitialLoadComplete(true);
        }
    };

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
        console.log('Selected schedule:', schedule);
        setSelectedSchedule(schedule);
        setShowDetail(true);
    };

    const handleScheduleCreated = async (newSchedule) => {
        try {
            // Gọi API để tạo lịch mới
            console.log('Creating new schedule:', newSchedule);
            const response = await createScheduleAPI(newSchedule);
            if (response && response.data) {
                console.log('Schedule created successfully:', response.data);
                
                // Nếu API thành công, cập nhật state với dữ liệu từ API
                if (Array.isArray(response.data)) {
                    setSchedules(prevSchedules => [...prevSchedules, ...response.data]);
                } else {
                    setSchedules(prevSchedules => [...prevSchedules, response.data]);
                }
                
                showToast('Tạo lịch thành công!', 'success');
            } else {
                console.warn('API returned success but no data');
                showToast('Không thể tạo lịch, vui lòng thử lại sau', 'warning');
            }
        } catch (error) {
            console.error('Error creating schedule:', error);
            showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
        }
    };

    const handleScheduleUpdate = async (updatedSchedule) => {
        try {
            // Gọi API để cập nhật lịch
            console.log('Updating schedule:', updatedSchedule);
            const response = await updateScheduleAPI(updatedSchedule.id, updatedSchedule);
            if (response && response.data) {
                console.log('Schedule updated successfully:', response.data);
                
                // Nếu API thành công, cập nhật state với dữ liệu từ API
                setSchedules(prevSchedules => 
                    prevSchedules.map(schedule => 
                        schedule.id === updatedSchedule.id ? response.data : schedule
                    )
                );
                
                showToast('Cập nhật lịch thành công!', 'success');
            } else {
                console.warn('API returned success but no data');
                showToast('Không thể cập nhật lịch, vui lòng thử lại sau', 'warning');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
        }
    };

    const handleScheduleDelete = async (scheduleId) => {
        try {
            // Gọi API để xóa lịch
            console.log('Deleting schedule with ID:', scheduleId);
            await deleteScheduleAPI(scheduleId);
            
            // Cập nhật state sau khi xóa thành công
            setSchedules(prevSchedules => 
                prevSchedules.filter(schedule => schedule.id !== scheduleId)
            );
            
            showToast('Xóa lịch thành công!', 'success');
        } catch (error) {
            console.error('Error deleting schedule:', error);
            showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
        }
    };

    // Đảm bảo rằng filteredSchedules là một mảng rỗng khi không có dữ liệu từ API
    const filteredSchedules = initialLoadComplete ? schedules.filter(schedule => {
        // Kiểm tra dữ liệu hợp lệ
        if (!schedule || !schedule.id || !schedule.date) {
            console.warn('Invalid schedule data:', schedule);
            return false;
        }
        
        let match = true;
        
        // Lọc theo bác sĩ
        if (selectedDoctor) {
            match = match && schedule.doctorId?.toString() === selectedDoctor.toString();
        }
        
        // Lọc theo trạng thái
        if (selectedStatus) {
            match = match && schedule.status === selectedStatus;
        }
        
        return match;
    }) : [];

    console.log('Filtered schedules to pass to Calendar:', filteredSchedules);

    // Hàm hiển thị Toast
    const showToast = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    return (
        <div className="container-fluid py-4">
            <div className="schedule-header">
                <h1 className="schedule-title text-center">Quản lý lịch làm việc bác sĩ</h1>
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

            <Row className="mb-4 filter-row">
                <Col md={4} className="filter-col">
                    <DoctorFilter 
                        onDoctorSelect={setSelectedDoctor} 
                        selectedDoctor={selectedDoctor} 
                    />
                </Col>
                <Col md={4} className="filter-col">
                    <StatusFilter 
                        onStatusSelect={setSelectedStatus} 
                        selectedStatus={selectedStatus} 
                    />
                </Col>
                <Col md={4} className="filter-col text-end">
                    <div className="button-container">
                        <button 
                            className="add-schedule-button"
                            onClick={() => handleAddClick(new Date())}
                        >
                            <BsCalendarPlus className="add-schedule-button-icon" />
                            Thêm lịch mới
                        </button>
                    </div>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải dữ liệu lịch...</p>
                </div>
            ) : (
                <Calendar 
                    events={filteredSchedules}
                    onDateSelect={handleAddClick}
                    onEventSelect={handleScheduleSelect}
                    key={`calendar-${filteredSchedules.length}-${selectedDoctor}-${selectedStatus}`}
                />
            )}

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
