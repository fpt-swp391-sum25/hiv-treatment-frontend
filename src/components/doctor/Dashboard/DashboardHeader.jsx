import React from 'react';

export default function DashboardHeader() {
  // Có thể lấy tên bác sĩ từ context hoặc props nếu cần
  return (
    <div className="dashboard-header">
      <h1>Chào mừng, Bác sĩ</h1>
      <div className="dashboard-subtitle">Chuyên khoa HIV/AIDS</div>
    </div>
  );
} 