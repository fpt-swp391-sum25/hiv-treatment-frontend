import React from 'react';
import './DoctorLayout.css';

export default function DoctorHeader() {
  return (
    <header className="doctor-header">
      <div>
        <h1 className="header-title">Chào mừng, Bác sĩ</h1>
        <div className="header-subtitle">Chuyên khoa HIV/AIDS</div>
      </div>
      <div className="header-profile">
        <span className="header-avatar">👨‍⚕️</span>
        <span className="header-name">Bác sĩ</span>
      </div>
    </header>
  );
} 