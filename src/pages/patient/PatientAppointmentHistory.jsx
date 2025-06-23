import React, { useState, useEffect, useContext } from 'react';
import { getSchedulesByPatientAPI } from '../../services/api.service';
import { AuthContext } from '../../components/context/AuthContext';

export default function PatientAppointmentHistory() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !user.id) {
        setRecords([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await getSchedulesByPatientAPI(user.id);
        if (response && response.data) {
          setRecords(response.data);
        } else {
          setRecords([]);
        }
      } catch (error) {
        console.error('Error fetching patient schedules:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  if (loading) return <div>Đang tải lịch sử khám...</div>;

  // Thống kê tổng quan
  const total = records.length;

  // Lọc theo tìm kiếm bác sĩ và loại lịch
  const filteredRecords = records.filter(record => {
    // Tìm kiếm bác sĩ
    const doctorMatch = !searchDoctor || 
      (record.doctor && record.doctor.fullName && 
       record.doctor.fullName.toLowerCase().includes(searchDoctor.toLowerCase()));
    
    // Lọc theo loại lịch
    const typeMatch = selectedType === 'all' || (record.type && record.type.trim() === selectedType);
    
    return doctorMatch && typeMatch;
  });

  const filteredTotal = filteredRecords.length;

  // Tính thống kê theo loại
  const typeStats = {
    'Khám': records.filter(r => r.type && r.type.trim() === 'Khám').length,
    'Tái khám': records.filter(r => r.type && r.type.trim() === 'Tái khám').length,
    'Tư vấn': records.filter(r => r.type && r.type.trim() === 'Tư vấn').length
  };

  return (
    <div style={{ padding: 32, background: '#f7f8fa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 0 }}>Lịch sử khám bệnh</h1>
      <div style={{ textAlign: 'center', color: '#666', marginBottom: 32 }}>
        Theo dõi toàn bộ quá trình điều trị và chăm sóc
      </div>
      
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, background: '#f4f8ff', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#2954d6' }}>{filteredTotal}</div>
          <div style={{ color: '#2954d6', marginTop: 4 }}>
            {filteredTotal === total ? 'Tổng lượt khám' : 'Kết quả tìm kiếm'}
          </div>
        </div>
        {(searchDoctor || selectedType !== 'all') && (
          <div style={{ flex: 1, background: '#fff3cd', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#856404' }}>{total}</div>
            <div style={{ color: '#856404', marginTop: 4 }}>Tổng lượt khám</div>
          </div>
        )}
      </div>

      {/* Thống kê theo loại lịch */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#1976d2' }}>{typeStats['Khám']}</div>
          <div style={{ color: '#666', fontSize: 14 }}>Khám</div>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#2e7d32' }}>{typeStats['Tái khám']}</div>
          <div style={{ color: '#666', fontSize: 14 }}>Tái khám</div>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#ed6c02' }}>{typeStats['Tư vấn']}</div>
          <div style={{ color: '#666', fontSize: 14 }}>Tư vấn</div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label>
            <b>Tìm kiếm bác sĩ: </b>
            <input
              type="text"
              value={searchDoctor}
              onChange={e => setSearchDoctor(e.target.value)}
              placeholder="Nhập tên bác sĩ..."
              style={{ 
                padding: 8, 
                borderRadius: 6, 
                marginLeft: 8, 
                border: '1px solid #ddd',
                width: 250
              }}
            />
            {searchDoctor && (
              <button
                onClick={() => setSearchDoctor('')}
                style={{
                  marginLeft: 8,
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #ddd',
                  background: '#f5f5f5',
                  cursor: 'pointer'
                }}
              >
                Xóa
              </button>
            )}
          </label>
        </div>
        
        <div>
          <b>Lọc theo loại lịch: </b>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setSelectedType('all')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #ddd',
                background: selectedType === 'all' ? '#1976d2' : '#fff',
                color: selectedType === 'all' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: selectedType === 'all' ? 600 : 400
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedType('Khám')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #ddd',
                background: selectedType === 'Khám' ? '#1976d2' : '#fff',
                color: selectedType === 'Khám' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: selectedType === 'Khám' ? 600 : 400
              }}
            >
              Khám ({typeStats['Khám']})
            </button>
            <button
              onClick={() => setSelectedType('Tái khám')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #ddd',
                background: selectedType === 'Tái khám' ? '#2e7d32' : '#fff',
                color: selectedType === 'Tái khám' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: selectedType === 'Tái khám' ? 600 : 400
              }}
            >
              Tái khám ({typeStats['Tái khám']})
            </button>
            <button
              onClick={() => setSelectedType('Tư vấn')}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #ddd',
                background: selectedType === 'Tư vấn' ? '#ed6c02' : '#fff',
                color: selectedType === 'Tư vấn' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: selectedType === 'Tư vấn' ? 600 : 400
              }}
            >
              Tư vấn ({typeStats['Tư vấn']})
            </button>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          background: '#fff', 
          borderRadius: 12, 
          color: '#666',
          border: '1px solid #ddd'
        }}>
          {searchDoctor || selectedType !== 'all'
            ? `Không tìm thấy lịch khám${searchDoctor ? ` với bác sĩ "${searchDoctor}"` : ''}${selectedType !== 'all' ? ` loại "${selectedType}"` : ''}`
            : 'Chưa có lịch khám nào'
          }
        </div>
      ) : (
        filteredRecords.map(record => (
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
                <b>Bác sĩ</b>
                <div>{record.doctor ? record.doctor.fullName : 'Không rõ bác sĩ'}</div>
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
        ))
      )}
    </div>
  );
}