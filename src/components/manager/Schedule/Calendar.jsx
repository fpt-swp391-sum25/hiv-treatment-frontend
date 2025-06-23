import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import viLocale from '@fullcalendar/core/locales/vi';
import moment from 'moment';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import './Calendar.css';
import './CustomButtons.css';
import { ScheduleStatus } from '../../../types/schedule.types';

const Calendar = ({ events = [], onDateSelect, onEventSelect }) => {
    const [view, setView] = useState('dayGridMonth');
    const calendarRef = React.useRef(null);
    
    // Đảm bảo events là một mảng
    const validEvents = Array.isArray(events) ? events : [];
    
    // Kiểm tra xem có sự kiện nào không
    const hasEvents = validEvents.length > 0;
    
    // Debug: Ghi log events để kiểm tra
    console.log('Calendar received events:', validEvents);
    
    const handleDateSelect = (selectInfo) => {
        const selectedDate = selectInfo.start;
        const dayOfWeek = moment(selectedDate).day();
        
        // Kiểm tra xem ngày được chọn có phải là Chủ nhật không
        if (dayOfWeek === 0) {
            // Nếu là Chủ nhật, hiển thị thông báo hoặc vô hiệu hóa
            alert('Chủ nhật là ngày nghỉ. Vui lòng chọn ngày khác từ thứ Hai đến thứ Bảy.');
            return;
        }
        
        // Vẫn cho phép chọn ngày quá khứ, nhưng component cha sẽ xử lý logic cảnh báo
        onDateSelect(selectedDate);
    };

    const handleEventClick = (clickInfo) => {
        // Khi click vào sự kiện, truyền thông tin sự kiện lên component cha
        onEventSelect(clickInfo.event.extendedProps);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return '#28a745'; // success
            case 'on_leave':
                return '#ffc107'; // warning
            default:
                return '#6c757d'; // secondary
        }
    };

    // Chuẩn bị sự kiện cho Full Calendar
    const calendarEvents = hasEvents ? validEvents.map(event => {
        // Debug: Ghi log từng sự kiện
        console.log('Processing event:', event);
        
        // Kiểm tra tính hợp lệ của sự kiện
        if (!event || !event.id || !event.date) {
            console.error('Invalid event data:', event);
            return null;
        }
        
        return {
            id: event.id,
            title: event.title || 'Không xác định',
            start: event.date,
            color: getStatusColor(event.status),
            extendedProps: {
                ...event
            },
            allDay: true
        };
    }).filter(Boolean) : []; // Lọc bỏ các sự kiện null

    // Render content cho ngày quá khứ và Chủ nhật
    const dayCellDidMount = (info) => {
        const date = info.date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) {
            // Thêm class cho ngày đã qua
            info.el.classList.add('fc-day-past');
        }
        
        // Nếu là Chủ nhật, thêm class để hiển thị khác
        if (date.getDay() === 0) {
            info.el.classList.add('fc-day-sunday');
            info.el.classList.add('fc-day-disabled');
        }
    };

    // Tùy chỉnh hiển thị nội dung của sự kiện
    const eventContent = (eventInfo) => {
        const eventData = eventInfo.event.extendedProps;
        
        // Debug: Ghi log dữ liệu sự kiện
        console.log('Rendering event content:', eventData);
        
        // Kiểm tra tính hợp lệ của dữ liệu sự kiện
        if (!eventData || !eventData.status) {
            console.error('Invalid event data in eventContent:', eventData);
            return <div>Lỗi dữ liệu</div>;
        }
        
        const statusClass = `status-${eventData.status}`;
        
        return (
            <div className={`custom-event-content ${statusClass}`}>
                <div className="event-title">{eventData.doctorName || 'Không có tên'}</div>
                <div className="event-status">
                    {eventData.status === 'available' 
                        ? `Làm việc: ${eventData.morning && eventData.afternoon 
                            ? 'Cả ngày' 
                            : eventData.morning 
                                ? 'Buổi sáng' 
                                : 'Buổi chiều'}`
                        : 'Nghỉ phép'
                    }
                </div>
            </div>
        );
    };

    // Hàm xóa tất cả sự kiện
    const clearAllEvents = useCallback(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.removeAllEvents();
            console.log('All events cleared from calendar');
        }
    }, []);

    // Xóa tất cả dữ liệu lưu trữ của FullCalendar
    const clearFullCalendarStorage = useCallback(() => {
        // Xóa bất kỳ dữ liệu lịch nào có thể được lưu trong localStorage
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                key.includes('event') || key.includes('schedule')) {
                console.log('Removing from localStorage:', key);
                localStorage.removeItem(key);
            }
        });
        
        // Xóa bất kỳ dữ liệu nào được lưu trữ trong sessionStorage
        const sessionStorageKeys = Object.keys(sessionStorage);
        sessionStorageKeys.forEach(key => {
            if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                key.includes('event') || key.includes('schedule')) {
                console.log('Removing from sessionStorage:', key);
                sessionStorage.removeItem(key);
            }
        });
    }, []);

    // Xử lý chuyển đến ngày hôm nay
    const handleTodayClick = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.today();
        }
    };

    // Xử lý chuyển tháng trước
    const handlePrevClick = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.prev();
        }
    };

    // Xử lý chuyển tháng sau
    const handleNextClick = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.next();
        }
    };

    // Xử lý thay đổi view
    const handleViewChange = (newView) => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(newView);
            setView(newView);
        }
    };

    // Custom toolbar
    const renderToolbar = () => {
        return {
            left: '',
            center: 'title',
            right: ''
        };
    };

    // Xóa tất cả sự kiện khi component mount
    useEffect(() => {
        clearAllEvents();
        clearFullCalendarStorage();
        
        // Thêm một timeout để đảm bảo FullCalendar đã được khởi tạo đầy đủ
        const timer = setTimeout(() => {
            clearAllEvents();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [clearAllEvents, clearFullCalendarStorage]);

    // Xóa và cập nhật lại sự kiện khi events thay đổi
    useEffect(() => {
        console.log('Events changed, updating calendar with:', validEvents.length, 'events');
        
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            
            // Xóa tất cả sự kiện hiện tại
            calendarApi.removeAllEvents();
            
            // Chỉ thêm sự kiện mới nếu có dữ liệu hợp lệ
            if (hasEvents) {
                console.log('Adding events to calendar:', calendarEvents.length);
                calendarApi.addEventSource(calendarEvents);
            } else {
                console.log('No events to add to calendar');
            }
        }
    }, [events, hasEvents, calendarEvents]);

    return (
        <div className="calendar-container">
            <div className="calendar-controls mb-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <button className="calendar-nav-button" onClick={handlePrevClick}>
                        <BsChevronLeft />
                    </button>
                    <button className="today-button" onClick={handleTodayClick}>
                        Hôm nay
                    </button>
                    <button className="calendar-nav-button" onClick={handleNextClick}>
                        <BsChevronRight />
                    </button>
                </div>
                
                <div className="view-toggle-container">
                    <button 
                        className={`view-toggle-button ${view === 'dayGridMonth' ? 'active' : ''}`}
                        onClick={() => handleViewChange('dayGridMonth')}
                    >
                        Tháng
                    </button>
                    <button 
                        className={`view-toggle-button ${view === 'timeGridWeek' ? 'active' : ''}`}
                        onClick={() => handleViewChange('timeGridWeek')}
                    >
                        Tuần
                    </button>
                    <button 
                        className={`view-toggle-button ${view === 'timeGridDay' ? 'active' : ''}`}
                        onClick={() => handleViewChange('timeGridDay')}
                    >
                        Ngày
                    </button>
                </div>
            </div>

            <div className="calendar-wrapper">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                    initialView="dayGridMonth"
                    headerToolbar={renderToolbar()}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    events={[]} // Bắt đầu với mảng rỗng, sẽ thêm sự kiện qua API
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventContent={eventContent}
                    height="auto"
                    locale={viLocale}
                    themeSystem="bootstrap5"
                    dayCellDidMount={dayCellDidMount}
                    viewDidMount={(info) => setView(info.view.type)}
                    businessHours={{
                        daysOfWeek: [1, 2, 3, 4, 5, 6], // Thứ 2 đến thứ 7
                        startTime: '08:00',
                        endTime: '17:00',
                    }}
                />
            </div>

            {!hasEvents && (
                <div className="text-center my-4 p-3 bg-light rounded">
                    <p className="mb-0">Không có lịch làm việc nào. Hãy thêm lịch mới.</p>
                </div>
            )}
        </div>
    );
};

export default Calendar;
