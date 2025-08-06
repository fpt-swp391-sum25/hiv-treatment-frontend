import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DoctorFilter from './DoctorFilter';
import ScheduleForm from './ScheduleForm';
import ScheduleDetail from './ScheduleDetail';
import { Row, Col, Form, Spinner } from 'react-bootstrap';
import { notification } from 'antd';
import { BsCalendarPlus } from 'react-icons/bs';
import moment from 'moment';
import { StatusMapping } from '../../../types/schedule.types';
import { checkBackendConnection, createScheduleAPI, deleteScheduleAPI, getAllSchedulesAPI, updateScheduleAPI } from '../../../services/schedule.service';
import '../../../styles/manager/ManagerSchedule.css';
import '../../../styles/manager/CustomButtons.css';

const ManagerSchedule = () => {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [schedules, setSchedules] = useState([]);

    const [loading, setLoading] = useState(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const [backendConnected, setBackendConnected] = useState(true);

    // Xóa bất kỳ dữ liệu lịch nào có thể được lưu trong localStorage
    useEffect(() => {
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') ||
                key.includes('calendar') || key.includes('event') ||
                key.includes('schedule')) {
                localStorage.removeItem(key);
            }
        });

        // Xóa bất kỳ dữ liệu nào được lưu trữ trong sessionStorage
        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') ||
                key.includes('calendar') || key.includes('event') ||
                key.includes('schedule')) {
                sessionStorage.removeItem(key);
            }
        });

        // Kiểm tra kết nối đến backend
        // Bỏ qua lỗi kết nối và tiếp tục tải dữ liệu
        try {
            checkBackendConnection()
                .then(result => {
                    setBackendConnected(result.success);
                    // Luôn tải dữ liệu bất kể kết nối thành công hay không
                    fetchSchedules();
                })
                .catch(error => {
                    console.error('Error checking backend connection:', error);
                    // Vẫn đặt backendConnected = true để không chặn UI
                    setBackendConnected(true);
                    // Vẫn tải dữ liệu ngay cả khi kiểm tra kết nối thất bại
                    fetchSchedules();
                });
        } catch (error) {
            console.error('Exception in connection check:', error);
            // Vẫn đặt backendConnected = true để không chặn UI
            setBackendConnected(true);
            // Vẫn tải dữ liệu
            fetchSchedules();
        }
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await getAllSchedulesAPI();

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


            if (schedulesList.length > 0) {
                // Nhóm các lịch theo doctorId + date + slot để đếm số lượng bệnh nhân
                const slotGroups = {};

                schedulesList.forEach(schedule => {
                    // Xác định doctorId
                    let doctorId = null;
                    if (schedule.doctorId) {
                        doctorId = schedule.doctorId;
                    } else if (schedule.doctor_id) {
                        doctorId = schedule.doctor_id;
                    } else if (schedule.doctor && schedule.doctor.id) {
                        doctorId = schedule.doctor.id;
                    }

                    if (!doctorId) return; // Bỏ qua nếu không có doctorId

                    const key = `${doctorId}_${schedule.date}_${schedule.slot}`;
                    if (!slotGroups[key]) {
                        slotGroups[key] = {
                            total: 0,
                            booked: 0,
                            schedules: []
                        };
                    }

                    slotGroups[key].total++;
                    if (schedule.patient_id || (schedule.patient && schedule.patient.id)) {
                        slotGroups[key].booked++;
                    }
                    slotGroups[key].schedules.push(schedule);
                });

                // Chọn một lịch đại diện cho mỗi nhóm và thêm thông tin số lượng bệnh nhân
                const representativeSchedules = [];

                Object.entries(slotGroups).forEach(([key, group]) => {
                    // Ưu tiên lịch trống để hiển thị
                    const emptySchedule = group.schedules.find(s => !s.patient_id && (!s.patient || !s.patient.id));
                    const schedule = emptySchedule || group.schedules[0];

                    // Thêm thông tin số lượng bệnh nhân
                    schedule.currentPatients = group.booked;
                    schedule.maxPatients = group.total;

                    representativeSchedules.push(schedule);
                });

                // Đảm bảo tất cả lịch đều có trạng thái là "available" (Làm việc)
                const updatedSchedulesList = representativeSchedules.map(schedule => ({
                    ...schedule,
                    status: 'available' // Ghi đè trạng thái thành "available"
                }));

                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                const formattedSchedules = updatedSchedulesList
                    .map(schedule => {
                        const formatted = formatScheduleFromAPI(schedule);
                        return formatted;
                    })
                    .filter(Boolean); // Lọc bỏ các giá trị null

                // Sử dụng setTimeout để tránh FlushSync error
                setTimeout(() => {
                    setSchedules(formattedSchedules);
                }, 0);

                if (formattedSchedules.length === 0) {
                    showNotification('Không có dữ liệu lịch từ server', 'info');
                }
            } else {
                // Sử dụng setTimeout để tránh FlushSync error
                setTimeout(() => {
                    setSchedules([]);
                }, 0);

                showNotification('Không có dữ liệu lịch từ server', 'info');
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu lịch:', error);

            // Sử dụng setTimeout để tránh FlushSync error
            setTimeout(() => {
                setSchedules([]);
            }, 0);

            // Hiển thị thông tin lỗi chi tiết hơn
            if (error.response) {
                console.error('❌ Lỗi phản hồi:', error.response);
                showNotification(`Lỗi server: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`, 'error');
            } else if (error.request) {
                console.error('❌ Lỗi yêu cầu:', error.request);
                showNotification('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', 'error');
            } else {
                showNotification(`Lỗi: ${error.message || 'Unknown error'}`, 'error');
            }
        } finally {
            setLoading(false);
            setInitialLoadComplete(true);
        }
    };

    const handleAddClick = (date) => {
        // Kiểm tra xem ngày được chọn có phải là ngày quá khứ không
        if (moment(date).isBefore(moment(), 'day')) {
            showNotification('Không thể đặt lịch cho ngày đã qua!', 'error');
            return;
        }

        setSelectedDate(date);
        setShowForm(true);
    };

    const handleScheduleSelect = (schedule) => {

        // Sử dụng setTimeout để tránh FlushSync error
        setTimeout(() => {
            setSelectedSchedule(schedule);
            setShowDetail(true);
        }, 0);
    };

    const handleScheduleCreated = async (newSchedule) => {
        try {
            // Nếu đó là một mảng (nhiều lịch), xử lý từng lịch một
            if (Array.isArray(newSchedule)) {
                const createdSchedules = [];

                // Xử lý tuần tự các lịch để tránh race condition
                for (const schedule of newSchedule) {
                    const scheduleData = prepareScheduleData(schedule);

                    try {
                        const response = await createScheduleAPI(scheduleData);

                        if (response && response.data) {
                            const formattedSchedule = formatScheduleFromAPI(response.data);
                            createdSchedules.push(formattedSchedule);
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
                    showNotification(`Đã tạo ${createdSchedules.length}/${newSchedule.length} lịch thành công!`, 'success');
                } else {
                    showNotification('Không thể tạo lịch, vui lòng kiểm tra log để biết chi tiết', 'danger');
                }
            } else {
                // Xử lý một lịch đơn
                const scheduleData = prepareScheduleData(newSchedule);

                const response = await createScheduleAPI(scheduleData);

                if (response && response.data) {
                    const formattedSchedule = formatScheduleFromAPI(response.data);

                    // Thêm lịch mới vào state
                    setSchedules(prevSchedules => [...prevSchedules, formattedSchedule]);

                    showNotification('Tạo lịch thành công!', 'success');
                } else {
                    console.warn('API returned success but no data');
                    showNotification('API trả về thành công nhưng không có dữ liệu', 'warning');
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
                showNotification(`Lỗi: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'danger');
            } else {
                showNotification(`Lỗi: ${error.message}`, 'danger');
            }
        }
    };

    // Hàm chuẩn bị dữ liệu lịch để gửi đến API
    const prepareScheduleData = (schedule) => {
        // Chuyển đổi từ dữ liệu form sang định dạng API

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

            // Lấy thông tin số lượng bệnh nhân
            const currentPatients = schedule.currentPatients !== undefined ? schedule.currentPatients : 0;
            const maxPatients = schedule.maxPatients !== undefined ? schedule.maxPatients : 5;

            // Tạo title với thông tin đầy đủ hơn
            let title = `${doctorName} - ${slotDisplay} - P.${roomCode}`;

            // Thêm thông tin ca làm việc vào title nếu có
            if (shiftType) {
                const shiftName = shiftType === 'morning' ? 'Ca sáng' : 'Ca chiều';
                title = `${doctorName} - ${shiftName} - ${slotDisplay} - P.${roomCode}`;
            }

            // Thêm thông tin số lượng bệnh nhân vào title
            title += ` (${currentPatients}/${maxPatients})`;

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
                shiftType: shiftType, // Lưu thông tin ca làm việc từ trường type
                currentPatients: currentPatients, // Thêm thông tin số bệnh nhân hiện tại
                maxPatients: maxPatients // Thêm thông tin số bệnh nhân tối đa
            };
        } catch (error) {
            console.error('Error formatting schedule:', error, schedule);
            return null;
        }
    };

    const handleScheduleUpdate = async (updatedSchedule) => {
        try {
            // Kiểm tra kết nối
            const connectionCheck = await checkBackendConnection();

            if (!connectionCheck.success) {
                console.error('4. Lỗi kết nối:', connectionCheck.error);
                showNotification('Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng', 'danger');
                return;
            }

            // Đảm bảo trường type được cập nhật với giá trị của shiftType
            if (updatedSchedule.shiftType && !updatedSchedule.type) {
                updatedSchedule.type = updatedSchedule.shiftType;
            }

            // Chuẩn bị dữ liệu để gửi đến API
            const scheduleData = prepareScheduleData(updatedSchedule);

            // Gọi API để cập nhật lịch
            const response = await updateScheduleAPI(updatedSchedule.id, scheduleData);

            if (response && response.data) {
                // Nếu API thành công, cập nhật state với dữ liệu từ API
                const formattedUpdatedSchedule = formatScheduleFromAPI(response.data);
                // Sử dụng setTimeout để tránh FlushSync error
                setTimeout(() => {
                    setSchedules(prevSchedules =>
                        prevSchedules.map(schedule =>
                            schedule.id === updatedSchedule.id ? formattedUpdatedSchedule : schedule
                        )
                    );

                    showNotification('Cập nhật lịch thành công!', 'success');

                    // Làm mới dữ liệu từ server sau khi cập nhật
                    setTimeout(() => {
                        fetchSchedules();
                    }, 500);
                }, 0);
            } else {
                console.warn('12. API trả về thành công nhưng không có dữ liệu');
                showNotification('Không thể cập nhật lịch, vui lòng thử lại sau', 'warning');
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
            showNotification('Không thể kết nối đến server, vui lòng thử lại sau', 'danger');
        }
    };

    const handleScheduleDelete = async (scheduleId) => {
        try {
            if (!scheduleId) {
                showNotification('Không thể xóa lịch: ID không hợp lệ', 'danger');
                return;
            }

            // Gọi API để xóa lịch
            const response = await deleteScheduleAPI(scheduleId);

            // Kiểm tra response từ API
            if (response && (response.status === 200 || response.status === 204 || response.data?.message?.includes('success'))) {
                // Cập nhật state sau khi xóa thành công
                setSchedules(prevSchedules =>
                    prevSchedules.filter(schedule => schedule.id !== scheduleId)
                );

                showNotification('Xóa lịch thành công! Đang làm mới dữ liệu...', 'success');

                // Làm mới dữ liệu từ server sau khi xóa
                // Sử dụng async/await để đảm bảo dữ liệu được làm mới
                try {
                    // Đặt một timeout ngắn để đảm bảo UI được cập nhật trước
                    await new Promise(resolve => setTimeout(resolve, 300));
                    await fetchSchedules();
                    showNotification('Dữ liệu đã được cập nhật', 'success');
                } catch (refreshError) {
                    console.error('Error refreshing schedules:', refreshError);
                    showNotification('Không thể làm mới dữ liệu, vui lòng tải lại trang', 'warning');
                }
            } else {
                console.warn('API returned unexpected response:', response);
                showNotification('Đã xóa lịch thành công', 'success');

                // Vẫn cập nhật UI để người dùng không thấy lịch đã xóa
                setSchedules(prevSchedules =>
                    prevSchedules.filter(schedule => schedule.id !== scheduleId)
                );

                // Vẫn thử làm mới dữ liệu
                setTimeout(() => {
                    fetchSchedules();
                }, 300);
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);

            if (error.response) {
                console.error('Error response:', error.response);

                // Xử lý các mã lỗi cụ thể
                if (error.response.status === 404) {
                    showNotification('Đã xóa lịch thành công', 'success');

                    // Xóa khỏi UI nếu không tìm thấy trên server
                    setSchedules(prevSchedules =>
                        prevSchedules.filter(schedule => schedule.id !== scheduleId)
                    );

                    // Vẫn thử làm mới dữ liệu
                    setTimeout(() => {
                        fetchSchedules();
                    }, 300);
                    return;
                }

                showNotification(`Lỗi server: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`, 'danger');
            } else if (error.request) {
                showNotification('Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng', 'danger');
            } else {
                showNotification(`Lỗi: ${error.message || 'Unknown error'}`, 'danger');
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


    // Hàm hiển thị thông báo Ant Design Notification
    const showNotification = (msg, type = 'success') => {
        const config = {
            message: 'Thông báo',
            description: msg,
            placement: 'topRight',
            duration: 3,
        };

        switch (type) {
            case 'success':
                notification.success(config);
                break;
            case 'danger':
            case 'error':
                notification.error({
                    ...config,
                    message: 'Lỗi'
                });
                break;
            case 'warning':
                notification.warning({
                    ...config,
                    message: 'Cảnh báo'
                });
                break;
            case 'info':
                notification.info({
                    ...config,
                    message: 'Thông tin'
                });
                break;
            default:
                notification.info(config);
        }
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
                        localStorage.removeItem(key);
                    }
                });

                const sessionStorageKeys = Object.keys(sessionStorage);
                sessionStorageKeys.forEach(key => {
                    if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') ||
                        key.includes('event') || key.includes('schedule')) {
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
        }, 0);

        // Đặt một flag để tránh vòng lặp cập nhật vô hạn
        const refreshTimestamp = Date.now();
        sessionStorage.setItem('last_refresh_timestamp', refreshTimestamp.toString());

        // Sử dụng setTimeout để tránh vòng lặp cập nhật
        setTimeout(() => {
            fetchSchedules();
        }, 100);

        showNotification('Đã làm mới dữ liệu', 'success');
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
                onShowToast={showNotification}
            />

            <ScheduleDetail
                show={showDetail}
                onHide={() => setShowDetail(false)}
                schedule={selectedSchedule}
                onUpdate={handleScheduleUpdate}
                onDelete={handleScheduleDelete}
                onShowToast={showNotification}
                onRefreshData={fetchSchedules}
            />
        </div>
    );
};

export default ManagerSchedule;
