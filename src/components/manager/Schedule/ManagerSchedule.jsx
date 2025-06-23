import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DoctorFilter from './DoctorFilter';
import StatusFilter from './StatusFilter';
import ScheduleForm from './ScheduleForm';
import ScheduleDetail from './ScheduleDetail';
import { Row, Col, ToastContainer, Toast, Form, Spinner, Alert } from 'react-bootstrap';
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
    const [error, setError] = useState(null);

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
        setError(null);
        try {
            console.log('Fetching schedules from API...');
            const response = await getAllSchedulesAPI();
            console.log('API response for schedules:', response);
            
            // Kiểm tra cấu trúc response để xác định nơi chứa dữ liệu
            let schedulesData = [];
            
            if (response && response.data) {
                schedulesData = response.data;
            } else if (response && Array.isArray(response)) {
                schedulesData = response;
            } else if (response) {
                schedulesData = response;
            }
            
            // Đảm bảo schedulesData là một mảng
            const schedulesList = Array.isArray(schedulesData) ? schedulesData : [];
            
            console.log('Schedules data after processing:', schedulesList);
            
            if (schedulesList.length > 0) {
                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                const formattedSchedules = schedulesList
                    .filter(schedule => {
                        // Lọc bỏ các dữ liệu không hợp lệ
                        if (!schedule || !schedule.id || !schedule.date) {
                            console.warn('Invalid schedule data filtered out:', schedule);
                            return false;
                        }
                        
                        // Kiểm tra xem schedule có doctorId không
                        if (!schedule.doctor_id && !schedule.doctorId) {
                            console.warn('Schedule without doctorId filtered out:', schedule);
                            return false;
                        }
                        
                        return true;
                    })
                    .map(schedule => {
                        // Log để kiểm tra cấu trúc dữ liệu
                        console.log('Schedule data structure:', schedule);
                        
                        // Xử lý các trường hợp khác nhau của cấu trúc dữ liệu
                        const id = schedule.id || schedule.scheduleId;
                        const date = schedule.date || schedule.schedule_date || moment(schedule.created_at).format('YYYY-MM-DD');
                        const doctorId = schedule.doctor_id || schedule.doctorId;
                        const doctorName = schedule.doctor_name || schedule.doctorName || 'Bác sĩ';
                        const status = schedule.status || ScheduleStatus.AVAILABLE;
                        const morning = schedule.morning !== undefined ? schedule.morning : true;
                        const afternoon = schedule.afternoon !== undefined ? schedule.afternoon : true;
                        const note = schedule.note || '';
                        
                        return {
                            id: id,
                            title: `${doctorName} - ${status === ScheduleStatus.AVAILABLE ? 'Làm việc' : 'Nghỉ phép'}`,
                            date: date,
                            doctorId: doctorId,
                            doctorName: doctorName,
                            status: status,
                            morning: morning,
                            afternoon: afternoon,
                            note: note
                        };
                    });
                
                console.log('Formatted schedules:', formattedSchedules);
                setSchedules(formattedSchedules);
                
                if (formattedSchedules.length === 0) {
                    showToast('Không có dữ liệu lịch từ server', 'info');
                }
            } else {
                console.log('No schedule data received');
                setSchedules([]);
                showToast('Không có dữ liệu lịch từ server', 'info');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setSchedules([]);
            
            // Hiển thị thông tin lỗi chi tiết hơn
            if (error.response) {
                console.error('Error response:', error.response);
                setError(`Lỗi server: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`);
                showToast(`Lỗi server: ${error.response.status}`, 'danger');
            } else if (error.request) {
                console.error('Error request:', error.request);
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
                showToast('Không thể kết nối đến server', 'danger');
            } else {
                setError(`Lỗi: ${error.message || 'Unknown error'}`);
                showToast('Đã xảy ra lỗi khi tải dữ liệu', 'danger');
            }
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
            // Chuẩn bị dữ liệu để gửi đến API
            let scheduleData;
            
            if (Array.isArray(newSchedule)) {
                // Nếu là mảng lịch (lặp lại hàng tuần)
                scheduleData = newSchedule.map(schedule => prepareScheduleData(schedule));
            } else {
                // Nếu là một lịch đơn
                scheduleData = prepareScheduleData(newSchedule);
            }
            
            // Gọi API để tạo lịch mới
            console.log('Creating new schedule:', scheduleData);
            
            let response;
            if (Array.isArray(scheduleData)) {
                // Nếu có nhiều lịch, gọi API nhiều lần
                const responses = [];
                for (const schedule of scheduleData) {
                    try {
                        const res = await createScheduleAPI(schedule);
                        responses.push(res);
                    } catch (err) {
                        console.error('Error creating individual schedule:', err);
                    }
                }
                response = { data: responses.map(r => r.data).filter(Boolean) };
            } else {
                // Nếu chỉ có một lịch, gọi API một lần
                response = await createScheduleAPI(scheduleData);
            }
            
            console.log('Schedule creation response:', response);
            
            if (response && response.data) {
                console.log('Schedule created successfully:', response.data);
                
                // Nếu API thành công, cập nhật state với dữ liệu từ API
                if (Array.isArray(response.data)) {
                    const formattedNewSchedules = response.data.map(formatScheduleFromAPI).filter(Boolean);
                    if (formattedNewSchedules.length > 0) {
                        setSchedules(prevSchedules => [...prevSchedules, ...formattedNewSchedules]);
                        showToast(`Đã tạo ${formattedNewSchedules.length} lịch làm việc`, 'success');
                    } else {
                        showToast('Không thể tạo lịch, vui lòng thử lại sau', 'warning');
                    }
                } else {
                    const formattedNewSchedule = formatScheduleFromAPI(response.data);
                    if (formattedNewSchedule) {
                        setSchedules(prevSchedules => [...prevSchedules, formattedNewSchedule]);
                        showToast('Tạo lịch thành công!', 'success');
                    } else {
                        showToast('Không thể tạo lịch, vui lòng thử lại sau', 'warning');
                    }
                }
                
                // Làm mới dữ liệu từ server sau khi tạo lịch thành công
                fetchSchedules();
            } else {
                console.warn('API returned success but no data');
                showToast('Không thể tạo lịch, vui lòng thử lại sau', 'warning');
                
                // Nếu API không trả về dữ liệu, vẫn cập nhật UI với dữ liệu đã nhập
                if (Array.isArray(newSchedule)) {
                    // Tạo ID tạm thời cho các lịch mới
                    const tempSchedules = newSchedule.map((schedule, index) => ({
                        ...schedule,
                        id: `temp-${Date.now()}-${index}`,
                        title: `${schedule.doctorName} - ${schedule.status === ScheduleStatus.AVAILABLE ? 'Làm việc' : 'Nghỉ phép'}`
                    }));
                    setSchedules(prevSchedules => [...prevSchedules, ...tempSchedules]);
                } else {
                    // Tạo ID tạm thời cho lịch mới
                    const tempSchedule = {
                        ...newSchedule,
                        id: `temp-${Date.now()}`,
                        title: `${newSchedule.doctorName} - ${newSchedule.status === ScheduleStatus.AVAILABLE ? 'Làm việc' : 'Nghỉ phép'}`
                    };
                    setSchedules(prevSchedules => [...prevSchedules, tempSchedule]);
                }
            }
        } catch (error) {
            console.error('Error creating schedule:', error);
            
            // Hiển thị thông tin lỗi chi tiết hơn
            if (error.response) {
                console.error('Error response:', error.response);
                const errorMessage = error.response.data?.message || error.response.statusText || 'Lỗi server';
                showToast(`Lỗi: ${errorMessage}`, 'danger');
            } else if (error.request) {
                console.error('Error request:', error.request);
                showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
            } else {
                showToast(`Lỗi: ${error.message || 'Đã xảy ra lỗi không xác định'}`, 'danger');
            }
            
            // Nếu API gặp lỗi, vẫn cập nhật UI với dữ liệu đã nhập (với ID tạm thời)
            if (Array.isArray(newSchedule)) {
                const tempSchedules = newSchedule.map((schedule, index) => ({
                    ...schedule,
                    id: `temp-${Date.now()}-${index}`,
                    title: `${schedule.doctorName} - ${schedule.status === ScheduleStatus.AVAILABLE ? 'Làm việc' : 'Nghỉ phép'}`
                }));
                setSchedules(prevSchedules => [...prevSchedules, ...tempSchedules]);
            } else {
                const tempSchedule = {
                    ...newSchedule,
                    id: `temp-${Date.now()}`,
                    title: `${newSchedule.doctorName} - ${newSchedule.status === ScheduleStatus.AVAILABLE ? 'Làm việc' : 'Nghỉ phép'}`
                };
                setSchedules(prevSchedules => [...prevSchedules, tempSchedule]);
            }
        }
    };

    // Hàm chuẩn bị dữ liệu lịch để gửi đến API
    const prepareScheduleData = (schedule) => {
        return {
            doctor_id: schedule.doctorId,
            date: schedule.date,
            status: schedule.status,
            morning: schedule.morning,
            afternoon: schedule.afternoon,
            note: schedule.note
        };
    };

    // Hàm định dạng dữ liệu lịch từ API để hiển thị trên UI
    const formatScheduleFromAPI = (schedule) => {
        return {
            id: schedule.id || schedule.scheduleId,
            title: `${schedule.doctor_name || schedule.doctorName || 'Bác sĩ'} - ${schedule.status === ScheduleStatus.AVAILABLE ? 'Làm việc' : 'Nghỉ phép'}`,
            date: schedule.date || schedule.schedule_date,
            doctorId: schedule.doctor_id || schedule.doctorId,
            doctorName: schedule.doctor_name || schedule.doctorName || 'Bác sĩ',
            status: schedule.status,
            morning: schedule.morning,
            afternoon: schedule.afternoon,
            note: schedule.note || ''
        };
    };

    const handleScheduleUpdate = async (updatedSchedule) => {
        try {
            // Chuẩn bị dữ liệu để gửi đến API
            const scheduleData = prepareScheduleData(updatedSchedule);
            
            // Gọi API để cập nhật lịch
            console.log('Updating schedule:', updatedSchedule);
            const response = await updateScheduleAPI(updatedSchedule.id, scheduleData);
            console.log('Schedule update response:', response);
            
            if (response && response.data) {
                console.log('Schedule updated successfully:', response.data);
                
                // Nếu API thành công, cập nhật state với dữ liệu từ API
                const formattedUpdatedSchedule = formatScheduleFromAPI(response.data);
                setSchedules(prevSchedules => 
                    prevSchedules.map(schedule => 
                        schedule.id === updatedSchedule.id ? formattedUpdatedSchedule : schedule
                    )
                );
                
                showToast('Cập nhật lịch thành công!', 'success');
            } else {
                console.warn('API returned success but no data');
                showToast('Không thể cập nhật lịch, vui lòng thử lại sau', 'warning');
                
                // Nếu API không trả về dữ liệu, vẫn cập nhật UI với dữ liệu đã nhập
                setSchedules(prevSchedules => 
                    prevSchedules.map(schedule => 
                        schedule.id === updatedSchedule.id ? updatedSchedule : schedule
                    )
                );
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
            
            // Nếu API gặp lỗi, vẫn cập nhật UI với dữ liệu đã nhập
            setSchedules(prevSchedules => 
                prevSchedules.map(schedule => 
                    schedule.id === updatedSchedule.id ? updatedSchedule : schedule
                )
            );
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

    const handleRefreshData = () => {
        // Xóa tất cả dữ liệu trong localStorage và sessionStorage liên quan đến calendar
        try {
            const localStorageKeys = Object.keys(localStorage);
            localStorageKeys.forEach(key => {
                if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                    key.includes('event') || key.includes('schedule')) {
                    console.log('Removing from localStorage:', key);
                    localStorage.removeItem(key);
                }
            });
            
            const sessionStorageKeys = Object.keys(sessionStorage);
            sessionStorageKeys.forEach(key => {
                if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                    key.includes('event') || key.includes('schedule')) {
                    console.log('Removing from sessionStorage:', key);
                    sessionStorage.removeItem(key);
                }
            });
            
            // Xóa các key cụ thể
            localStorage.removeItem('fc-event-sources');
            localStorage.removeItem('fc-view-state');
            sessionStorage.removeItem('fc-event-sources');
            sessionStorage.removeItem('fc-view-state');
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
        
        // Reset state
        setSchedules([]);
        setSelectedSchedule(null);
        setSelectedDate(null);
        setShowDetail(false);
        setShowForm(false);
        setLoading(true);
        setError(null);
        
        // Đặt một flag để tránh vòng lặp cập nhật vô hạn
        const refreshTimestamp = Date.now();
        sessionStorage.setItem('last_refresh_timestamp', refreshTimestamp.toString());
        
        // Sử dụng setTimeout để tránh vòng lặp cập nhật
        setTimeout(() => {
            fetchSchedules();
        }, 100);
        
        showToast('Đã làm mới dữ liệu', 'success');
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

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

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
                            disabled={loading}
                        >
                            <BsCalendarPlus className="me-2" />
                            Thêm lịch mới
                        </button>
                        <button 
                            className="refresh-button ms-2"
                            onClick={handleRefreshData}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Đang tải...
                                </>
                            ) : (
                                'Làm mới dữ liệu'
                            )}
                        </button>
                    </div>
                </Col>
            </Row>

            <div className="calendar-wrapper">
                {loading && !initialLoadComplete ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" />
                        <p className="mt-3">Đang tải dữ liệu lịch...</p>
                    </div>
                ) : (
                    <Calendar 
                        events={filteredSchedules} 
                        onDateSelect={handleAddClick}
                        onEventSelect={handleScheduleSelect}
                    />
                )}
            </div>

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
                onUpdate={handleScheduleUpdate}
                onDelete={handleScheduleDelete}
                onShowToast={showToast}
            />
        </div>
    );
};

export default ManagerSchedule;
