import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/vi'; // Import locale tiếng Việt
import './Calendar.css';

const Calendar = ({ viewMode, selectedDoctor, selectedStatus, onScheduleClick }) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [schedules, setSchedules] = useState([]);

  // Thiết lập locale tiếng Việt cho moment
  moment.locale('vi');

  useEffect(() => {
    // TODO: Fetch schedules based on viewMode, selectedDoctor, selectedStatus
    // fetchSchedules();
  }, [viewMode, selectedDoctor, selectedStatus, currentDate]);

  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={() => setCurrentDate(moment(currentDate).subtract(1, viewMode))}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>{currentDate.format('MMMM YYYY')}</h2>
          <button onClick={() => setCurrentDate(moment(currentDate).add(1, viewMode))}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        <button className="today-button" onClick={() => setCurrentDate(moment())}>
          Hôm nay
        </button>
      </div>
    );
  };

  const renderMonthView = () => {
    const startDay = moment(currentDate).startOf('month').startOf('week');
    const endDay = moment(currentDate).endOf('month').endOf('week');
    const weeks = [];
    let days = [];
    let day = startDay;

    // Render weekday headers - sử dụng tên ngày tiếng Việt
    const weekDays = moment.weekdaysShort().map(day => (
      <div key={day} className="calendar-cell weekday">{day}</div>
    ));

    // Render calendar days
    while (day <= endDay) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = moment(day);
        days.push(
          <div
            key={day.format('YYYY-MM-DD')}
            className={`calendar-cell ${
              day.month() !== currentDate.month() ? 'other-month' : ''
            } ${day.isSame(moment(), 'day') ? 'today' : ''}`}
          >
            <div className="day-number">{day.format('D')}</div>
            <div className="day-schedules">
              {/* Render schedules for this day */}
              {schedules
                .filter(schedule => moment(schedule.date).isSame(day, 'day'))
                .map(schedule => (
                  <div
                    key={schedule.id}
                    className={`schedule-item status-${schedule.status}`}
                    onClick={() => onScheduleClick(schedule)}
                  >
                    {schedule.title}
                  </div>
                ))}
            </div>
          </div>
        );
        day = moment(day).add(1, 'day');
      }
      weeks.push(
        <div key={`week-${weeks.length}`} className="calendar-week">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="calendar-grid month-view">
        <div className="calendar-weekdays">{weekDays}</div>
        <div className="calendar-days">{weeks}</div>
      </div>
    );
  };

  const renderWeekView = () => {
    // TODO: Implement week view
    return <div className="calendar-grid week-view">Chế độ xem theo tuần sẽ sớm ra mắt...</div>;
  };

  const renderDayView = () => {
    // TODO: Implement day view
    return <div className="calendar-grid day-view">Chế độ xem theo ngày sẽ sớm ra mắt...</div>;
  };

  return (
    <div className="calendar">
      {renderHeader()}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};

export default Calendar;
