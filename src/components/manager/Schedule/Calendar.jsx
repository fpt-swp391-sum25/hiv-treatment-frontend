import React, { useState } from 'react';
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

const Calendar = ({ events, onDateSelect, onEventSelect }) => {
    const [view, setView] = useState('dayGridMonth');
    const calendarRef = React.useRef(null);
    
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
            case 'in_meeting':
                return '#007bff'; // primary
            default:
                return '#6c757d'; // secondary
        }
    };

    // Chuẩn bị sự kiện cho Full Calendar
    const calendarEvents = events.map(event => {
        return {
            id: event.id,
            title: event.title,
            start: event.date,
            color: getStatusColor(event.status),
            extendedProps: event, // Lưu toàn bộ thông tin sự kiện
            allDay: true
        };
    });

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
        const statusClass = `status-${eventData.status}`;
        
        return (
            <div className={`custom-event-content ${statusClass}`}>
                <div className="event-title">{eventData.doctorName}</div>
                <div className="event-status">
                    {eventData.status === 'available' 
                        ? `Làm việc: ${eventData.morning && eventData.afternoon 
                            ? 'Cả ngày' 
                            : eventData.morning 
                                ? 'Buổi sáng' 
                                : 'Buổi chiều'}`
                        : eventData.status === 'on_leave'
                            ? 'Nghỉ phép'
                            : 'Họp'
                    }
                </div>
            </div>
        );
    };

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
                    events={calendarEvents}
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
        </div>
    );
};

export default Calendar;
