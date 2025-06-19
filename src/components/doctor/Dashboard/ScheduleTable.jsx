import React, { useState, useEffect } from 'react';
import ScheduleRow from './ScheduleRow';
import AddScheduleButton from './AddScheduleButton';
import { fetchAllScheduleAPI, fetchUsersAPI } from '../../../services/api.service';
import './../../../styles/doctor/Dashboard.css';

function mergeSchedules(schedules, users) {
  // Log dữ liệu để debug
  console.log('Schedules:', schedules);
  console.log('Users:', users);
  return schedules.map(item => {
    const user = users.find(u => String(u.id) === String(item.patient.id));
    return {
      ...item,
      patientName: user ? user.fullName : ''
    };
  });
}

export default function ScheduleTable() {  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const doctorId = 1; // TODO: Lấy từ context hoặc props
  useEffect(() => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      fetchAllScheduleAPI(doctorId, { format: () => today }),
      fetchUsersAPI()
    ])
      .then(([scheduleRes, usersRes]) => {
        const users = usersRes.data;
        const schedules = mergeSchedules(scheduleRes.data, users);
        setSchedules(schedules);
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, [doctorId]);

  return (
    <div className="schedule-table-container">
      <div className="schedule-table-header">
        <div>
          <h3>🕑 Lịch hẹn</h3>
          <div className="schedule-table-desc">Quản lý lịch làm việc và cuộc hẹn với bệnh nhân</div>
        </div>        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AddScheduleButton />
        </div>
      </div>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Thời gian</th>
            <th>Bệnh nhân</th>
            <th>Loại khám</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6}>Đang tải...</td></tr>
          ) : schedules.length === 0 ? (
            <tr><td colSpan={6}>Không có lịch hẹn</td></tr>
          ) : (
            schedules.map((item, idx) => (
              <ScheduleRow
                key={item.id || idx}
                date={item.date}
                time={item.slot}
                name={item.patientName || ''}
                type={item.type}
                status={item.status}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 