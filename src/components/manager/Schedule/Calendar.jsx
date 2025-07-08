import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import listPlugin from '@fullcalendar/list'; // Thêm plugin hiển thị dạng danh sách
import viLocale from '@fullcalendar/core/locales/vi';
import moment from 'moment';
import { BsChevronLeft, BsChevronRight, BsCalendarWeek, BsCalendarMonth, BsListUl } from 'react-icons/bs';
import './Calendar.css';
import './CustomButtons.css';
import { ScheduleStatus, SlotTimes } from '../../../types/schedule.types';

const Calendar = ({ events = [], onDateSelect, onEventSelect }) => {
    // Thay đổi view mặc định thành dayGridMonth
    const [view, setView] = useState('dayGridMonth');
    const calendarRef = React.useRef(null);
    const [calendarKey, setCalendarKey] = useState(Date.now()); // Thêm key để force re-render
    const [currentWeekDays, setCurrentWeekDays] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarTitle, setCalendarTitle] = useState('');
    
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
    
    // Cập nhật danh sách các ngày trong tuần hiện tại
    useEffect(() => {
        if (view === 'listWeek') {
            const weekStart = moment(currentDate).startOf('week').add(1, 'days'); // Bắt đầu từ thứ 2
            
            const days = [];
            for (let i = 0; i < 6; i++) { // Thứ 2 đến thứ 7
                days.push(moment(weekStart).add(i, 'days').format('YYYY-MM-DD'));
            }
            
            setCurrentWeekDays(days);
            console.log('Current week days:', days);
        }
    }, [view, currentDate]);
    
    // Cập nhật currentDate khi calendar thay đổi
    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            setCurrentDate(calendarApi.getDate());
        }
    }, [calendarKey]);

    // Cập nhật title khi calendar thay đổi
    useEffect(() => {
        if (calendarRef.current && view === 'dayGridMonth') {
            // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
            requestAnimationFrame(() => {
                if (calendarRef.current) {
                    const title = calendarRef.current.getApi().view.title;
                    setCalendarTitle(title);
                }
            });
        }
    }, [view, calendarKey, currentDate]);
    
    const handleDateSelect = (selectInfo) => {
        const selectedDate = selectInfo.start;
        const dayOfWeek = moment(selectedDate).day();
        
        // Kiểm tra xem ngày được chọn có phải là Chủ nhật không
        if (dayOfWeek === 0) {
            // Nếu là Chủ nhật, hiển thị thông báo hoặc vô hiệu hóa
            alert('Chủ nhật là ngày nghỉ. Vui lòng chọn ngày khác từ thứ Hai đến thứ Bảy.');
            return;
        }
        
        // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
        requestAnimationFrame(() => {
            // Vẫn cho phép chọn ngày quá khứ, nhưng component cha sẽ xử lý logic cảnh báo
            onDateSelect(selectedDate);
        });
    };

    const handleEventClick = (clickInfo) => {
        // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
        requestAnimationFrame(() => {
            // Khi click vào sự kiện, truyền thông tin sự kiện lên component cha
            onEventSelect(clickInfo.event.extendedProps);
        });
    };

    // Hàm xử lý khi click vào sự kiện trong chế độ xem tuần
    const handleWeekEventClick = (event) => {
        // Sử dụng setTimeout để tránh FlushSync error
        setTimeout(() => {
            onEventSelect(event);
        }, 0);
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
            
            // Tạo đối tượng date từ date và slot
            const eventDate = event.date;
            const eventTime = event.slot || '08:00:00';
            
            // Kết hợp ngày và giờ để tạo datetime đầy đủ
            const startDateTime = `${eventDate}T${eventTime}`;
            
            // Tính thời gian kết thúc (30 phút sau giờ bắt đầu)
            const startMoment = moment(startDateTime);
            const endMoment = moment(startDateTime).add(30, 'minutes');
            const endDateTime = endMoment.format('YYYY-MM-DDTHH:mm:ss');
            
            return {
                id: event.id,
                title: event.title || 'Không xác định',
                start: startDateTime,
                end: endDateTime,
                color: getStatusColor(event.status),
                extendedProps: {
                    ...event
                },
                allDay: false // Đặt allDay thành false để hiển thị đúng trong chế độ tuần
            };
        });
    }, [validEvents, hasEvents]);

    // Render content cho ngày quá khứ và Chủ nhật
    const dayCellDidMount = (info) => {
        const date = info.date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
        requestAnimationFrame(() => {
            if (date < today) {
                // Thêm class cho ngày đã qua
                info.el.classList.add('fc-day-past');
            }
            
            // Nếu là Chủ nhật, thêm class để hiển thị khác
            if (date.getDay() === 0) {
                info.el.classList.add('fc-day-sunday');
                // Không thêm fc-day-disabled nữa để không hiển thị gạch ngang
            }
        });
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
        
        // Lấy màu sắc theo trạng thái
        const statusColor = getStatusColor(eventData.status);
        
        // Kiểm tra loại view hiện tại
        const viewType = eventInfo.view.type;
        
        // Hiển thị theo từng loại view
        if (viewType === 'dayGridMonth') {
            // Hiển thị cho chế độ xem tháng - cập nhật để giống với chế độ xem tuần
            return (
                <div className="week-day-event">
                    <div className="week-event-time">
                        {slotTime}
                    </div>
                    <div className="week-event-content">
                        <div className="week-event-title">
                            {eventData.doctorName || 'Không có tên'}
                        </div>
                        {roomInfo && (
                            <div className="week-event-room">
                                {roomInfo}
                            </div>
                        )}
                    </div>
                </div>
            );
        } else if (viewType === 'listWeek') {
            // Hiển thị cho chế độ xem danh sách tuần
            return (
                <div className="list-event-content">
                    <div className="list-event-title">{eventData.doctorName || 'Không có tên'}</div>
                    <div className="list-event-info">
                        {slotTime && <span className="list-event-time">{slotTime}</span>}
                        {roomInfo && <span className="list-event-room">{roomInfo}</span>}
                    </div>
                </div>
            );
        } else {
            // Hiển thị cho các chế độ xem khác (timeGridWeek)
            return (
                <div className="time-event-content">
                    <div className="time-event-title">{eventData.doctorName || 'Không có tên'}</div>
                    {roomInfo && <div className="time-event-room">{roomInfo}</div>}
                </div>
            );
        }
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
        // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
        requestAnimationFrame(() => {
            try {
                // Xóa bất kỳ dữ liệu lịch nào có thể được lưu trong localStorage
                const clearLocalStorage = () => {
                    const localStorageKeys = Object.keys(localStorage);
                    localStorageKeys.forEach(key => {
                        if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                            key.includes('event') || key.includes('schedule')) {
                            console.log('Removing from localStorage:', key);
                            localStorage.removeItem(key);
                        }
                    });
                    
                    // Xóa các key cụ thể
                    localStorage.removeItem('fc-event-sources');
                    localStorage.removeItem('fc-view-state');
                };
                
                // Xóa bất kỳ dữ liệu nào được lưu trữ trong sessionStorage
                const clearSessionStorage = () => {
                    const sessionStorageKeys = Object.keys(sessionStorage);
                    sessionStorageKeys.forEach(key => {
                        if (key.includes('fullcalendar') || key.includes('fc-') || key.includes('calendar') || 
                            key.includes('event') || key.includes('schedule')) {
                            console.log('Removing from sessionStorage:', key);
                            sessionStorage.removeItem(key);
                        }
                    });
                    
                    // Xóa các key cụ thể
                    sessionStorage.removeItem('fc-event-sources');
                    sessionStorage.removeItem('fc-view-state');
                };
                
                // Thực hiện xóa
                clearLocalStorage();
                clearSessionStorage();
                
                console.log('All FullCalendar storage cleared');
            } catch (error) {
                console.error('Error clearing storage:', error);
            }
        });
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
        setCurrentDate(new Date());
        
        if (calendarRef.current && view === 'dayGridMonth') {
            // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
            requestAnimationFrame(() => {
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    calendarApi.today();
                }
            });
        }
    };

    // Xử lý chuyển tháng/tuần trước
    const handlePrevClick = () => {
        // Tính toán ngày mới dựa trên view hiện tại
        const newDate = moment(currentDate);
        if (view === 'dayGridMonth') {
            newDate.subtract(1, 'month');
        } else {
            newDate.subtract(1, 'week');
        }
        setCurrentDate(newDate.toDate());
        
        if (calendarRef.current && view === 'dayGridMonth') {
            // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
            requestAnimationFrame(() => {
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    calendarApi.prev();
                }
            });
        }
        
        // Force re-render cho chế độ xem tuần
        if (view === 'listWeek') {
            forceRerender();
        }
    };

    // Xử lý chuyển tháng/tuần sau
    const handleNextClick = () => {
        // Tính toán ngày mới dựa trên view hiện tại
        const newDate = moment(currentDate);
        if (view === 'dayGridMonth') {
            newDate.add(1, 'month');
        } else {
            newDate.add(1, 'week');
        }
        setCurrentDate(newDate.toDate());
        
        if (calendarRef.current && view === 'dayGridMonth') {
            // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
            requestAnimationFrame(() => {
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    calendarApi.next();
                }
            });
        }
        
        // Force re-render cho chế độ xem tuần
        if (view === 'listWeek') {
            forceRerender();
        }
    };

    // Xử lý thay đổi view
    const handleViewChange = (newView) => {
        setView(newView);
        
        // Force re-render khi chuyển view
        if (newView === 'dayGridMonth') {
            // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
            requestAnimationFrame(() => {
                // Đặt lại key để force re-render calendar
                setCalendarKey(Date.now());
            });
        }
    };

    // Xóa tất cả sự kiện khi component mount
    useEffect(() => {
        // Xóa storage khi component mount
        setTimeout(() => {
            clearFullCalendarStorage();
        }, 0);
        
        // Cleanup khi component unmount
        return () => {
            setTimeout(() => {
                clearFullCalendarStorage();
            }, 0);
        };
    }, [clearFullCalendarStorage]);

    // Xử lý cập nhật sự kiện khi calendar được khởi tạo và khi events thay đổi
    useEffect(() => {
        if (calendarRef.current && view === 'dayGridMonth') {
            // Thay vì xóa và thêm lại sự kiện, hãy để FullCalendar tự quản lý việc cập nhật
            // Chỉ cần force re-render nếu cần
            setCalendarKey(Date.now());
        }
    }, [calendarEvents.length]);

    // Tách logic xử lý dữ liệu ra khỏi hàm render
    const processWeekEvents = useCallback(() => {
        if (view !== 'listWeek' || currentWeekDays.length === 0) return null;
        
        // Lọc sự kiện theo từng ngày trong tuần
        const eventsByDay = {};
        currentWeekDays.forEach(day => {
            eventsByDay[day] = validEvents.filter(event => event.date === day);
        });
        
        // Lấy tiêu đề cho tuần hiện tại
        const weekStart = moment(currentWeekDays[0]).format('DD/MM/YYYY');
        const weekEnd = moment(currentWeekDays[currentWeekDays.length - 1]).format('DD/MM/YYYY');
        const weekTitle = `${weekStart} - ${weekEnd}`;
        
        return { eventsByDay, weekTitle };
    }, [view, currentWeekDays, validEvents]);

    // Tạo một component con để xử lý việc render danh sách tuần
    const WeekDaysList = React.memo(({ currentWeekDays, eventsByDay, weekTitle, onDateSelect, onEventSelect }) => {
        // Hàm xử lý khi click vào ngày trong chế độ xem tuần
        const handleWeekDayClick = useCallback((date) => {
            // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
            requestAnimationFrame(() => {
                onDateSelect(date);
            });
        }, [onDateSelect]);

        // Hàm xử lý khi click vào sự kiện trong chế độ xem tuần
        const handleWeekEventClick = useCallback((event, e) => {
            e.stopPropagation();
            // Sử dụng requestAnimationFrame thay vì setTimeout để tránh FlushSync error
            requestAnimationFrame(() => {
                onEventSelect(event);
            });
        }, [onEventSelect]);

        // Chuyển đổi tên ngày sang tiếng Việt
        const getVietnameseDayName = useCallback((date) => {
            const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
            return dayNames[moment(date).day()];
        }, []);

        return (
            <div className="week-view-container">
                <div className="week-title">{weekTitle}</div>
                <div className="week-days-list">
                    {currentWeekDays.map((day, index) => {
                        const dayEvents = eventsByDay[day] || [];
                        const dayName = getVietnameseDayName(day);
                        const dayNumber = moment(day).format('DD/MM');
                        const isToday = moment(day).isSame(moment(), 'day');
                        
                        return (
                            <div 
                                key={day} 
                                className={`week-day-item ${isToday ? 'today' : ''} ${dayEvents.length === 0 ? 'no-events' : ''}`}
                                onClick={() => handleWeekDayClick(new Date(day))}
                            >
                                <div className="week-day-header">
                                    <div className="week-day-name">{dayName}</div>
                                    <div className="week-day-number">{dayNumber}</div>
                                </div>
                                
                                <div className="week-day-events">
                                    {dayEvents.length > 0 ? (
                                        dayEvents.map(event => (
                                            <div 
                                                key={event.id} 
                                                className="week-day-event"
                                                onClick={(e) => handleWeekEventClick(event, e)}
                                            >
                                                <div className="week-event-time">
                                                    {event.slot ? event.slot.substring(0, 5) : '08:00'}
                                                </div>
                                                <div className="week-event-content">
                                                    <div className="week-event-title">
                                                        {event.doctorName || 'Không có tên'}
                                                    </div>
                                                    {event.roomCode && (
                                                        <div className="week-event-room">
                                                            P.{event.roomCode}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-events-day">Không có lịch</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    });

    // Trong component Calendar, thay đổi cách xử lý renderWeekDaysList
    const renderWeekDaysList = () => {
        const processedData = processWeekEvents();
        if (!processedData) return null;
        
        const { eventsByDay, weekTitle } = processedData;
        
        return (
            <WeekDaysList 
                currentWeekDays={currentWeekDays}
                eventsByDay={eventsByDay}
                weekTitle={weekTitle}
                onDateSelect={onDateSelect}
                onEventSelect={onEventSelect}
            />
        );
    };

    // Hiển thị tiêu đề lịch dựa trên view hiện tại
    const renderCalendarTitle = () => {
        const getVietnameseMonthName = (month) => {
            const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
                                "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
            return monthNames[month];
        };
        
        if (view === 'dayGridMonth') {
            return <h3>{calendarTitle}</h3>;
        } else if (view === 'listWeek' && currentWeekDays.length > 0) {
            const weekStart = moment(currentWeekDays[0]);
            const weekEnd = moment(currentWeekDays[currentWeekDays.length - 1]);
            
            // Định dạng ngày tháng theo tiếng Việt
            const startDay = weekStart.format('DD');
            const startMonth = getVietnameseMonthName(weekStart.month());
            const endDay = weekEnd.format('DD');
            const endMonth = getVietnameseMonthName(weekEnd.month());
            const year = weekEnd.format('YYYY');
            
            // Nếu cùng tháng
            if (weekStart.month() === weekEnd.month()) {
                return <h3>{startDay} - {endDay} {endMonth}, {year}</h3>;
            } else {
                return <h3>{startDay} {startMonth} - {endDay} {endMonth}, {year}</h3>;
            }
        }
        
        // Mặc định nếu không có view nào phù hợp
        const currentMonth = getVietnameseMonthName(moment(currentDate).month());
        const currentYear = moment(currentDate).format('YYYY');
        return <h3>{currentMonth}, {currentYear}</h3>;
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <div className="btn-group-nav">
                        <button className="btn-group-item btn-prev" onClick={handlePrevClick} title="Tháng trước">
                            <BsChevronLeft />
                        </button>
                        <button className="btn-group-item btn-today" onClick={handleTodayClick}>
                            Hôm nay
                        </button>
                        <button className="btn-group-item btn-next" onClick={handleNextClick} title="Tháng sau">
                            <BsChevronRight />
                        </button>
                    </div>
                </div>
                <div className="calendar-title">
                    {renderCalendarTitle()}
                </div>
                <div className="calendar-view-buttons">
                    <button 
                        className={`btn-calendar-view ${view === 'dayGridMonth' ? 'active' : ''}`} 
                        onClick={() => handleViewChange('dayGridMonth')}
                        title="Xem theo tháng"
                    >
                        <BsCalendarMonth className="view-icon" />
                        <span className="view-text">Tháng</span>
                    </button>
                    <button 
                        className={`btn-calendar-view ${view === 'listWeek' ? 'active' : ''}`} 
                        onClick={() => handleViewChange('listWeek')}
                        title="Xem danh sách theo tuần"
                    >
                        <BsListUl className="view-icon" />
                        <span className="view-text">Tuần</span>
                    </button>
                </div>
            </div>
            
            <div className="calendar-main">
                {view === 'listWeek' ? (
                    renderWeekDaysList()
                ) : (
                    <FullCalendar
                        ref={calendarRef}
                        key={calendarKey}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin, listPlugin]}
                        initialView="dayGridMonth"
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
                        views={{
                            dayGridMonth: {
                                titleFormat: { year: 'numeric', month: 'long' }
                            },
                            listWeek: {
                                titleFormat: { year: 'numeric', month: 'short', day: '2-digit' },
                                listDayFormat: { weekday: 'long', month: 'short', day: '2-digit' },
                                listDaySideFormat: { weekday: 'short' }
                            }
                        }}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }}
                        noEventsContent={() => (
                            <div className="no-events-message">
                                <p>Không có lịch làm việc nào trong khoảng thời gian này</p>
                            </div>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default Calendar;
