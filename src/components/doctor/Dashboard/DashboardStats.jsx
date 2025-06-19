import React from 'react';

export default function DashboardStats() {
  // Dữ liệu mẫu, sau này có thể truyền qua props hoặc lấy từ API
  const stats = [
    { title: 'Hôm nay', value: 4, subtitle: 'Lịch hẹn', note: '3 đã xác nhận', color: 'blue' },
    { title: 'Tuần này', value: 32, subtitle: 'Bệnh nhân', note: '+12% so với tuần trước', color: 'green' },
    { title: 'Chờ kết quả', value: 8, subtitle: 'Xét nghiệm', note: '3 sẽ có kết quả hôm nay', color: 'orange' },
    { title: 'Cần theo dõi', value: 3, subtitle: 'Bệnh nhân', note: 'Cần chú ý đặc biệt', color: 'purple' },
  ];
  return (
    <div className="dashboard-stats">
      {stats.map((item, idx) => (
        <div className={`dashboard-stat-box dashboard-stat-${item.color}`} key={idx}>
          <div className="stat-title">{item.title}</div>
          <div className="stat-value">{item.value}</div>
          <div className="stat-subtitle">{item.subtitle}</div>
          <div className="stat-note">{item.note}</div>
        </div>
      ))}
    </div>
  );
} 