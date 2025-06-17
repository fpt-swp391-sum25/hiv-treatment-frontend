import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import viLocale from '@fullcalendar/core/locales/vi';
import moment from 'moment';
import './Calendar.css';
import { ScheduleStatus } from '../../../types/schedule.types';

const Calendar = ({ events, onDateSelect, onEventSelect }) => {
    const [view, setView] = useState('dayGridMonth');
    
    const handleDateSelect = (selectInfo) => {
        // Vẫn cho phép chọn ngày quá khứ, nhưng component cha sẽ xử lý logic cảnh báo
        onDateSelect(selectInfo.start);
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

    // Render content cho ngày quá khứ
    const dayCellDidMount = (info) => {
        const date = info.date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date < today) {
            // Thêm class cho ngày đã qua
            info.el.classList.add('fc-day-past');
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

    const renderToolbar = () => {
        return {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        };
    };

    return (
        <div className="calendar-wrapper">
            <FullCalendar
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
                viewDidMount={setView}
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5, 6], // Thứ 2 đến thứ 7
                    startTime: '08:00',
                    endTime: '17:00',
                }}
            />
        </div>
    );
};

export default Calendar;
