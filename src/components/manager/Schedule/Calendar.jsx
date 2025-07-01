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
    const [calendarKey, setCalendarKey] = useState(Date.now()); // Thêm key để force re-render
    
    // Đảm bảo events là một mảng và lọc bỏ các sự kiện không hợp lệ
    const validEvents = React.useMemo(() => {
        if (!Array.isArray(events)) return [];
        
        return events.filter(event => 
            event && event.id && event.date && event.doctorId
        );
    }, [events]);
    
    // Kiểm tra xem có sự kiện nào không
    const hasEvents = validEvents.length > 0;
    
    // Debug: Ghi log events để kiểm tra
    useEffect(() => {
        console.log('Calendar received events:', validEvents);
    }, [validEvents]);
    
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
            case ScheduleStatus.AVAILABLE:
                return '#28a745'; // success - xanh lá (lịch trống)
            case 'cancelled':
                return '#dc3545'; // danger - đỏ (đã hủy)
            case 'active':
                return '#17a2b8'; // info - xanh dương (đang hoạt động)
            case 'booked':
                return '#ffc107'; // warning - vàng (đang chờ)
            case 'pending_payment':
                return '#fd7e14'; // orange - cam (chờ thanh toán)
            case 'confirmed':
                return '#6f42c1'; // purple - tím (đã thanh toán)
            case 'completed':
                return '#20c997'; // teal - xanh ngọc (hoàn thành)
            default:
                return '#6c757d'; // secondary - xám (khác)
        }
    };

    // Chuẩn bị sự kiện cho Full Calendar
    const calendarEvents = React.useMemo(() => {
        if (!hasEvents) return [];
        
        return validEvents.map(event => {
            // Debug: Ghi log từng sự kiện
            console.log('Processing event:', event);
            
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
    });
    }, [validEvents, hasEvents]);

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
            // Không thêm fc-day-disabled nữa để không hiển thị gạch ngang
        }
    };

    // Tùy chỉnh hiển thị nội dung của sự kiện
    const eventContent = (eventInfo) => {
        const eventData = eventInfo.event.extendedProps;
        
        // Kiểm tra tính hợp lệ của dữ liệu sự kiện
        if (!eventData) {
            console.warn('Invalid event data:', eventData);
            return <div>Lỗi dữ liệu</div>;
        }
        
        // Lấy thông tin phòng nếu có
        const roomInfo = eventData.roomCode ? `P.${eventData.roomCode}` : '';
        
        // Lấy thông tin khung giờ
        const slotTime = eventData.slot ? eventData.slot.substring(0, 5) : '';
        
        // Luôn sử dụng class status-available cho tất cả sự kiện
        return (
            <div className="custom-event-content status-available">
                <div className="event-title">{eventData.doctorName || 'Không có tên'}</div>
                <div className="event-status">
                    {slotTime && `Giờ: ${slotTime}`}
                    {roomInfo && ` - ${roomInfo}`}
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
        try {
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
            
            // Xóa tất cả dữ liệu trong localStorage và sessionStorage
            localStorage.removeItem('fc-event-sources');
            localStorage.removeItem('fc-view-state');
            sessionStorage.removeItem('fc-event-sources');
            sessionStorage.removeItem('fc-view-state');
            
            console.log('All FullCalendar storage cleared');
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }, []);

    // Force re-render calendar - không phụ thuộc vào calendarKey để tránh re-render vô hạn
    const forceRerender = useCallback(() => {
        setCalendarKey(prevKey => {
            const newKey = Date.now();
            console.log('Forcing calendar re-render with new key:', newKey);
            return newKey;
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
        // Chỉ cho phép các view được hỗ trợ: tháng và tuần
        if (newView === 'dayGridMonth' || newView === 'timeGridWeek') {
            if (calendarRef.current) {
                const calendarApi = calendarRef.current.getApi();
                calendarApi.changeView(newView);
                setView(newView);
            }
        }
    };

    // Xóa tất cả sự kiện khi component mount
    useEffect(() => {
        // Xóa storage khi component mount
        clearFullCalendarStorage();
        
        // Cleanup khi component unmount
        return () => {
            clearFullCalendarStorage();
        };
    }, [clearFullCalendarStorage]);

    // Xử lý cập nhật sự kiện khi calendar được khởi tạo và khi events thay đổi
    useEffect(() => {
        // Đảm bảo calendar đã được khởi tạo
        if (!calendarRef.current) return;
        
        const calendarApi = calendarRef.current.getApi();
        
        // Xóa tất cả sự kiện hiện tại
        calendarApi.removeAllEvents();
        
        // Thêm sự kiện mới nếu có
        if (calendarEvents.length > 0) {
            console.log('Adding events to calendar:', calendarEvents.length);
            calendarApi.addEventSource(calendarEvents);
        }
    }, [calendarEvents]);

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button className="btn-calendar-nav" onClick={handlePrevClick}><BsChevronLeft /></button>
                    <button className="btn-calendar-today" onClick={handleTodayClick}>Hôm nay</button>
                    <button className="btn-calendar-nav" onClick={handleNextClick}><BsChevronRight /></button>
                </div>
                <div className="calendar-title">
                    {calendarRef.current && (
                        <h3>{calendarRef.current.getApi().view.title}</h3>
                    )}
                </div>
                <div className="calendar-view-buttons">
                    <button 
                        className={`btn-calendar-view ${view === 'dayGridMonth' ? 'active' : ''}`} 
                        onClick={() => handleViewChange('dayGridMonth')}
                    >
                        Tháng
                    </button>
                    <button 
                        className={`btn-calendar-view ${view === 'timeGridWeek' ? 'active' : ''}`} 
                        onClick={() => handleViewChange('timeGridWeek')}
                    >
                        Tuần
                    </button>
                </div>
            </div>
            
            <div className="calendar-main">
                <FullCalendar
                    ref={calendarRef}
                    key={calendarKey}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                    initialView={view}
                    headerToolbar={false}
                    height="auto"
                    events={calendarEvents}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    locale={viLocale}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    eventContent={eventContent}
                    dayCellDidMount={dayCellDidMount}
                    allDaySlot={false}
                    slotDuration={'00:30:00'}
                    slotLabelInterval={'01:00'}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    firstDay={1}
                />
            </div>
        </div>
    );
};

export default Calendar;
