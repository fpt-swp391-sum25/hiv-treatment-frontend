import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DoctorFilter from './DoctorFilter';
import ScheduleForm from './ScheduleForm';
import ScheduleDetail from './ScheduleDetail';
import { Row, Col, ToastContainer, Toast, Form, Spinner, Alert } from 'react-bootstrap';
import { BsCalendarPlus } from 'react-icons/bs';
import moment from 'moment';
import './CustomButtons.css';
import './Schedule.css';
import { ScheduleStatus, StatusMapping } from '../../../types/schedule.types';
import { getAllSchedulesAPI, updateScheduleAPI, deleteScheduleAPI, createScheduleAPI, checkBackendConnection } from '../../../services/api.service';

const ManagerSchedule = () => {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [loading, setLoading] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [error, setError] = useState(null);
    const [backendConnected, setBackendConnected] = useState(true);

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
        
        // Kiểm tra kết nối đến backend
        checkBackendConnection()
            .then(result => {
                setBackendConnected(result.success);
                if (!result.success) {
                    setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và làm mới trang.');
                    showToast('Không thể kết nối đến server', 'danger');
                } else {
                    fetchSchedules();
                }
            })
            .catch(err => {
                console.error('Error checking backend connection:', err);
                setBackendConnected(false);
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và làm mới trang.');
                showToast('Không thể kết nối đến server', 'danger');
            });
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
                console.log('Found data in response.data:', schedulesData);
            } else if (response && Array.isArray(response)) {
                schedulesData = response;
                console.log('Found array data directly in response:', schedulesData);
            } else if (response) {
                schedulesData = response;
                console.log('Using entire response as data:', schedulesData);
            }
            
            // Đảm bảo schedulesData là một mảng
            const schedulesList = Array.isArray(schedulesData) ? schedulesData : [];
            
            console.log('Schedules data after processing:', schedulesList);
            
            if (schedulesList.length > 0) {
                // Đảm bảo tất cả lịch đều có trạng thái là "available" (Làm việc)
                const updatedSchedulesList = schedulesList.map(schedule => ({
                    ...schedule,
                    status: 'available' // Ghi đè trạng thái thành "available"
                }));
                
                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                const formattedSchedules = updatedSchedulesList
                    .map(schedule => {
                        const formatted = formatScheduleFromAPI(schedule);
                        console.log(`Formatted schedule ${schedule.id}:`, formatted);
                        return formatted;
                    })
                    .filter(Boolean); // Lọc bỏ các giá trị null
                
                console.log('Final formatted schedules:', formattedSchedules);
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
        
        // Sử dụng setTimeout để tránh FlushSync error
        setTimeout(() => {
            setSelectedSchedule(schedule);
            setShowDetail(true);
        }, 0);
    };

    const handleScheduleCreated = async (newSchedule) => {
        try {
            console.log('Starting to create schedule with data:', newSchedule);
            
            // Nếu đó là một mảng (nhiều lịch), xử lý từng lịch một
            if (Array.isArray(newSchedule)) {
                console.log('Creating multiple schedules:', newSchedule.length);
                const createdSchedules = [];
                
                // Xử lý tuần tự các lịch để tránh race condition
                for (const schedule of newSchedule) {
                    const scheduleData = prepareScheduleData(schedule);
                    console.log('Prepared data for API call:', scheduleData);
                    
                    try {
                        const response = await createScheduleAPI(scheduleData);
                        console.log('Create schedule API response:', response);
                        
                        if (response && response.data) {
                            const formattedSchedule = formatScheduleFromAPI(response.data);
                            createdSchedules.push(formattedSchedule);
                            console.log('Successfully created and formatted schedule:', formattedSchedule);
                        } else {
                            console.warn('API returned success but no data for schedule:', scheduleData);
                        }
                    } catch (error) {
                        console.error('Error creating individual schedule:', error);
                        console.error('Failed schedule data:', scheduleData);
                        if (error.response) {
                            console.error('Error response:', error.response.status, error.response.data);
                        }
                    }
                }
                
                // Cập nhật state với tất cả lịch đã tạo thành công
                if (createdSchedules.length > 0) {
                    setSchedules(prevSchedules => [...prevSchedules, ...createdSchedules]);
                    showToast(`Đã tạo ${createdSchedules.length}/${newSchedule.length} lịch thành công!`, 'success');
                } else {
                    showToast('Không thể tạo lịch, vui lòng kiểm tra log để biết chi tiết', 'danger');
                }
            } else {
                // Xử lý một lịch đơn
                const scheduleData = prepareScheduleData(newSchedule);
                console.log('Prepared data for API call (single schedule):', scheduleData);
                
                const response = await createScheduleAPI(scheduleData);
                console.log('Create schedule API response (single):', response);
                
                if (response && response.data) {
                    console.log('API returned data:', response.data);
                    const formattedSchedule = formatScheduleFromAPI(response.data);
                    console.log('Formatted schedule:', formattedSchedule);
                    
                    // Thêm lịch mới vào state
                    setSchedules(prevSchedules => [...prevSchedules, formattedSchedule]);
                    
                    showToast('Tạo lịch thành công!', 'success');
                } else {
                    console.warn('API returned success but no data');
                    showToast('API trả về thành công nhưng không có dữ liệu', 'warning');
                }
            }
            
            // Làm mới dữ liệu sau khi tạo lịch
            setTimeout(() => {
                fetchSchedules();
            }, 500);
            
        } catch (error) {
            console.error('Error in handleScheduleCreated:', error);
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
                showToast(`Lỗi: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'danger');
            } else {
                showToast(`Lỗi: ${error.message}`, 'danger');
            }
        }
    };

    // Hàm chuẩn bị dữ liệu lịch để gửi đến API
    const prepareScheduleData = (schedule) => {
        // Chuyển đổi từ dữ liệu form sang định dạng API
        console.log('Preparing schedule data for API:', schedule);
        
        // Xác định status dựa trên loại thao tác (tạo mới hoặc cập nhật)
        let status;
        if (schedule.original_status) {
            // Nếu đang cập nhật, sử dụng trạng thái từ form hoặc giữ nguyên trạng thái gốc
            status = schedule.status ? (StatusMapping[schedule.status] || schedule.status) : schedule.original_status;
        } else {
            // Nếu đang tạo mới, đặt trạng thái là "Trống"
            status = 'Trống';
        }
        
        // Sử dụng trường type để lưu thông tin ca làm việc (shiftType)
        // Theo phản hồi từ BE, trường type có thể dùng để lưu shiftType
        const typeValue = schedule.shiftType || schedule.type;
        
        return {
            // Nếu đã có type từ trước, giữ nguyên nếu không có shiftType
            type: typeValue,
            roomCode: schedule.roomCode, // Sử dụng roomCode từ form
            date: schedule.date, // Giữ nguyên định dạng YYYY-MM-DD
            slot: schedule.slot, // Sử dụng slot từ form (định dạng HH:mm:ss)
            doctorId: parseInt(schedule.doctorId),
            status: status,
            patient_id: schedule.patient_id !== undefined ? schedule.patient_id : null
        };
    };

    // Hàm định dạng dữ liệu lịch từ API để hiển thị trên UI
    const formatScheduleFromAPI = (schedule) => {
        if (!schedule) {
            console.warn('Invalid schedule data: null or undefined');
            return null;
        }
        
        console.log('Formatting schedule data:', schedule);
        
        try {
            // Lấy thông tin từ đối tượng schedule
            const id = schedule.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const date = schedule.date;
            const slot = schedule.slot || '08:00:00'; // Mặc định là 8:00 nếu không có slot
            
            // Xử lý nhiều cách để lấy doctorId
            let doctorId = null;
            if (schedule.doctorId) {
                doctorId = schedule.doctorId;
            } else if (schedule.doctor_id) {
                doctorId = schedule.doctor_id;
            } else if (schedule.doctor && schedule.doctor.id) {
                doctorId = schedule.doctor.id;
            } else if (schedule.doctor) {
                doctorId = schedule.doctor;
            }
            
            // Xử lý nhiều cách để lấy doctorName
            let doctorName = 'Bác sĩ';
            if (schedule.doctorName) {
                doctorName = schedule.doctorName;
            } else if (schedule.doctor && schedule.doctor.fullName) {
                doctorName = schedule.doctor.fullName;
            } else if (schedule.doctor && schedule.doctor.name) {
                doctorName = schedule.doctor.name;
            }
            
            // Chuyển đổi status từ BE sang FE
            let status = 'available'; // default
            if (schedule.status && StatusMapping[schedule.status]) {
                status = StatusMapping[schedule.status];
            } else if (schedule.status) {
                status = schedule.status;
            }
            
            // Lấy thông tin ca làm việc từ trường type
            // Theo phản hồi từ BE, trường type có thể chứa thông tin ca làm việc
            const type = schedule.type || null;
            const shiftType = type === 'morning' || type === 'afternoon' ? type : null;
            
            const roomCode = schedule.roomCode || schedule.room_code || '100';
            
            // Định dạng hiển thị khung giờ
            const slotDisplay = slot ? slot.substring(0, 5) : '08:00';
            
            // Tạo title với thông tin đầy đủ hơn
            let title = `${doctorName} - ${slotDisplay} - P.${roomCode}`;
            
            // Thêm thông tin ca làm việc vào title nếu có
            if (shiftType) {
                const shiftName = shiftType === 'morning' ? 'Ca sáng' : 'Ca chiều';
                title = `${doctorName} - ${shiftName} - ${slotDisplay} - P.${roomCode}`;
            }
            
            return {
                id: id,
                title: title,
                date: date,
                doctorId: doctorId,
                doctorName: doctorName,
                status: status,
                type: type,
                roomCode: roomCode,
                slot: slot,
                original_status: schedule.status, // Lưu trữ status nguyên bản từ BE
                shiftType: shiftType // Lưu thông tin ca làm việc từ trường type
            };
        } catch (error) {
            console.error('Error formatting schedule:', error, schedule);
            return null;
        }
    };

    const handleScheduleUpdate = async (updatedSchedule) => {
        try {
            console.log('=== TIẾN TRÌNH GỌI API CẬP NHẬT ===');
            console.log('1. Dữ liệu nhận được:', updatedSchedule);
            
            // Kiểm tra kết nối
            console.log('2. Kiểm tra kết nối đến server...');
            const connectionCheck = await checkBackendConnection();
            console.log('3. Kết quả kiểm tra kết nối:', connectionCheck);

            if (!connectionCheck.success) {
                console.error('4. Lỗi kết nối:', connectionCheck.error);
                showToast('Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng', 'danger');
                return;
            }
            
            // Đảm bảo trường type được cập nhật với giá trị của shiftType
            if (updatedSchedule.shiftType && !updatedSchedule.type) {
                updatedSchedule.type = updatedSchedule.shiftType;
            }
            
            console.log('5. Thông tin ca làm việc:', {
                shiftType: updatedSchedule.shiftType,
                type: updatedSchedule.type
            });
            
            // Chuẩn bị dữ liệu để gửi đến API
            const scheduleData = prepareScheduleData(updatedSchedule);
            console.log('6. Dữ liệu đã chuẩn bị cho API:', scheduleData);
            
            // Gọi API để cập nhật lịch
            console.log('7. Bắt đầu gọi API với ID:', updatedSchedule.id);
            const response = await updateScheduleAPI(updatedSchedule.id, scheduleData);
            console.log('8. Phản hồi từ API:', response);
            
            if (response && response.data) {
                console.log('9. Cập nhật thành công, dữ liệu trả về:', response.data);
                
                // Nếu API thành công, cập nhật state với dữ liệu từ API
                const formattedUpdatedSchedule = formatScheduleFromAPI(response.data);
                console.log('10. Dữ liệu sau khi format:', formattedUpdatedSchedule);
                
                // Sử dụng setTimeout để tránh FlushSync error
                setTimeout(() => {
                    setSchedules(prevSchedules => 
                        prevSchedules.map(schedule => 
                            schedule.id === updatedSchedule.id ? formattedUpdatedSchedule : schedule
                        )
                    );
                    
                    showToast('Cập nhật lịch thành công!', 'success');
                    
                    // Làm mới dữ liệu từ server sau khi cập nhật
                    setTimeout(() => {
                        console.log('11. Làm mới dữ liệu từ server');
                        fetchSchedules();
                    }, 500);
                }, 0);
            } else {
                console.warn('12. API trả về thành công nhưng không có dữ liệu');
                showToast('Không thể cập nhật lịch, vui lòng thử lại sau', 'warning');
            }
        } catch (error) {
            console.error('13. Lỗi trong quá trình cập nhật:', error);
            if (error.response) {
                console.error('14. Chi tiết lỗi từ server:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            showToast('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
        }
        console.log('=== KẾT THÚC TIẾN TRÌNH CẬP NHẬT ===');
    };

    const handleScheduleDelete = async (scheduleId) => {
        try {
            if (!scheduleId) {
                console.error('Invalid schedule ID:', scheduleId);
                showToast('Không thể xóa lịch: ID không hợp lệ', 'danger');
                return;
            }
            
            // Gọi API để xóa lịch
            console.log('Deleting schedule with ID:', scheduleId);
            const response = await deleteScheduleAPI(scheduleId);
            console.log('Delete schedule response:', response);
            
            // Kiểm tra response từ API
            if (response && (response.status === 200 || response.status === 204 || response.data?.message?.includes('success'))) {
                // Cập nhật state sau khi xóa thành công
                setSchedules(prevSchedules => 
                    prevSchedules.filter(schedule => schedule.id !== scheduleId)
                );
                
                // Làm mới dữ liệu từ server sau khi xóa
                setTimeout(() => {
                    fetchSchedules();
                }, 500);
                
                showToast('Xóa lịch thành công!', 'success');
            } else {
                console.warn('API returned unexpected response:', response);
                showToast('Lịch đã được xóa nhưng có thể cần làm mới trang', 'warning');
                
                // Vẫn cập nhật UI để người dùng không thấy lịch đã xóa
                setSchedules(prevSchedules => 
                    prevSchedules.filter(schedule => schedule.id !== scheduleId)
                );
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            
            if (error.response) {
                console.error('Error response:', error.response);
                
                // Xử lý các mã lỗi cụ thể
                if (error.response.status === 404) {
                    showToast('Không tìm thấy lịch này trên hệ thống', 'warning');
                    
                    // Xóa khỏi UI nếu không tìm thấy trên server
                    setSchedules(prevSchedules => 
                        prevSchedules.filter(schedule => schedule.id !== scheduleId)
                    );
                    return;
                }
                
                showToast(`Lỗi server: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`, 'danger');
            } else if (error.request) {
                showToast('Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng', 'danger');
            } else {
                showToast(`Lỗi: ${error.message || 'Unknown error'}`, 'danger');
            }
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
        // Sử dụng setTimeout để tránh FlushSync error
        setTimeout(() => {
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
        }, 0);
        
        // Reset state - sử dụng setTimeout để tránh FlushSync error
        setTimeout(() => {
            setSchedules([]);
            setSelectedSchedule(null);
            setSelectedDate(null);
            setShowDetail(false);
            setShowForm(false);
            setLoading(true);
            setError(null);
        }, 0);
        
        // Đặt một flag để tránh vòng lặp cập nhật vô hạn
        const refreshTimestamp = Date.now();
        sessionStorage.setItem('last_refresh_timestamp', refreshTimestamp.toString());
        
        // Sử dụng setTimeout để tránh vòng lặp cập nhật
        setTimeout(() => {
            fetchSchedules();
        }, 100);
        
        showToast('Đã làm mới dữ liệu', 'success');
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
                <Col md={3} className="filter-col">
                    <DoctorFilter 
                        onDoctorSelect={setSelectedDoctor} 
                        selectedDoctor={selectedDoctor} 
                    />
                </Col>
                <Col md={9} className="filter-col text-end">
                    <div className="button-container">
                        <button 
                            className="add-schedule-button"
                            onClick={() => handleAddClick(new Date())}
                            disabled={loading}
                        >
                            <BsCalendarPlus className="me-2" />
                            Thêm lịch mới
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
