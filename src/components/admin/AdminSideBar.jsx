import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/admin/AdminSideBar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);  
  };

  return (
    <div className="sidebar">
      <Link 
        to="/manager/dashboard" 
        className={`sidebar-item ${isActive('/manager/dashboard') ? 'active' : ''}`}
      >
        <i className="fas fa-tachometer-alt"></i>
        Dashboard
      </Link>

      <Link 
        to="/manager/schedule" 
        className={`sidebar-item ${isActive('/manager/schedule') ? 'active' : ''}`}
      >
        <i className="fas fa-calendar-alt"></i>
        Quản lý lịch
      </Link>

      <Link 
        to="/manager/doctors" 
        className={`sidebar-item ${isActive('/manager/doctors') ? 'active' : ''}`}
      >
        <i className="fas fa-user-md"></i>
        Quản lý bác sĩ
      </Link>

      <Link 
        to="/manager/lab-technician" 
        className={`sidebar-item ${isActive('/manager/lab-technician') ? 'active' : ''}`}
      >
        <i className="fas fa-users"></i>
        Quản lý nhân viên
      </Link>

      <Link 
        to="/manager/reports" 
        className={`sidebar-item ${isActive('/manager/reports') ? 'active' : ''}`}
      >
        <i className="fas fa-chart-bar"></i>
        Báo cáo
      </Link>
    </div>
  );
};

export default AdminSidebar