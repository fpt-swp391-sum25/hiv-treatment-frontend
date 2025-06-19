import React from 'react';
import './DoctorLayout.css';
import appLogo from '../../../assets/appLogo.png';

export default function DoctorSidebar() {
  return (
    <aside className="doctor-sidebar">
      <div className="sidebar-logo">
        <img src={appLogo} alt="Logo" />
      </div>
      <nav className="sidebar-menu">
        <ul>
          <li className="active"><span>📅</span> Lịch làm việc</li>
          <li><span>👤</span> Hồ sơ bệnh nhân</li>
          <li><span>🧪</span> Kết quả xét nghiệm</li>
          <li><span>💊</span> Phác đồ điều trị</li>
        </ul>
      </nav>
      <button className="sidebar-logout">⏻ Đăng xuất</button>
    </aside>
  );
} 