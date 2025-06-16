import React, { useState } from 'react';
import Calendar from './Calendar';
import DoctorFilter from './DoctorFilter';
import StatusFilter from './StatusFilter';
import ScheduleDetail from './ScheduleDetail';
import './Schedule.css';

const ManagerSchedule = () => {
  const [viewMode, setViewMode] = useState('month');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const handleDoctorChange = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleDetail(true);
  };

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setShowScheduleDetail(true);
  };

  return (
    <div className="schedule-container">
      <div className="schedule-controls">
        <div className="schedule-filters">
          <DoctorFilter
            selectedDoctor={selectedDoctor}
            onDoctorChange={handleDoctorChange}
          />
          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
          />
        </div>
        
        <div className="schedule-actions">
          <div className="view-toggle-group">
            <button 
              className={`view-toggle-button ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Tháng
            </button>
            <button 
              className={`view-toggle-button ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Tuần
            </button>
            <button 
              className={`view-toggle-button ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Ngày
            </button>
          </div>
          
          <button className="new-schedule-button" onClick={handleCreateSchedule}>
            <i className="fas fa-plus"></i>
            Đặt lịch mới
          </button>
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          viewMode={viewMode}
          selectedDoctor={selectedDoctor}
          selectedStatus={selectedStatus}
          onScheduleClick={handleScheduleClick}
        />
      </div>

      {showScheduleDetail && (
        <ScheduleDetail
          schedule={selectedSchedule}
          onClose={() => setShowScheduleDetail(false)}
        />
      )}
    </div>
  );
};

export default ManagerSchedule;
