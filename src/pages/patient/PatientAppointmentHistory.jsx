import React, { useState, useEffect, useContext } from 'react';
import { scheduleService } from '../../services/schedule.service';
import { AuthContext } from '../../components/context/AuthContext';

export default function PatientAppointmentHistory() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !user.id) {
        setRecords([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await scheduleService.getSchedulesByPatient(user.id);
      setRecords(data);
      console.log(data);
      setLoading(false);
    };
    fetchAppointments();
  }, [user]);

  if (loading) return <div>Đang tải lịch sử khám...</div>;

  // Thống kê tổng quan
  const total = records.length;
  const today = new Date();
  const upcoming = records.filter(r => {
    const d = new Date(r.date);
    return d >= today;
  }).length;

  return (
    <div style={{ padding: 32, background: '#f7f8fa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 0 }}>Lịch sử khám bệnh</h1>
      <div style={{ textAlign: 'center', color: '#666', marginBottom: 32 }}>
        Theo dõi toàn bộ quá trình điều trị và chăm sóc
      </div>
      
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, background: '#f4f8ff', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#2954d6' }}>{total}</div>
          <div style={{ color: '#2954d6', marginTop: 4 }}>Tổng lượt khám</div>
        </div>
        <div style={{ flex: 1, background: '#fffbe6', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#b8860b' }}>{upcoming}</div>
          <div style={{ color: '#b8860b', marginTop: 4 }}>Lịch sắp tới</div>
        </div>
      </div>
      {records.map(record => (
        <div key={record.id} style={{
          background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px #0001'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <span style={{
              background: '#e6f0ff', color: '#1976d2', borderRadius: '50%', padding: 10, fontSize: 24
            }}>📄</span>
            <span style={{
              background: '#e3fcec', color: '#34a853', borderRadius: 8, padding: '2px 10px', fontSize: 14, marginRight: 8
            }}>{record.type}</span>
            <span style={{
              background: '#e3fcec', color: '#34a853', borderRadius: 8, padding: '2px 10px', fontSize: 14
            }}>{record.status}</span>
            <span style={{ marginLeft: 'auto', color: '#1976d2', fontWeight: 500 }}>
              <span role="img" aria-label="calendar">📅</span> {record.date}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ flex: 1 }}>
              <b>Khung giờ</b>
              <div>{record.slot}</div>
            </div>
            <div style={{ flex: 1 }}>
              <b>Loại lịch</b>
              <div>{record.type}</div>
            </div>
            <div style={{ flex: 1 }}>
              <b>Trạng thái</b>
              <div>{record.status}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}