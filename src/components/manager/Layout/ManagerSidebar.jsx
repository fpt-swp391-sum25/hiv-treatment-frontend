import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaChartBar, FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './ManagerSidebar.css';

const ManagerSidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: FaChartBar, text: 'Thống kê', path: '/manager/dashboard' },
    { icon: FaUserMd, text: 'Bác sĩ', path: '/manager/doctors' },
    { icon: FaUsers, text: 'Nhân viên', path: '/manager/staff' },
    { icon: FaCalendarAlt, text: 'Quản lí lịch', path: '/manager/schedule' },
    { icon: FaFileAlt, text: 'Báo cáo', path: '/manager/reports' },
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login');
  };

  return (
    <div className="manager-sidebar bg-dark text-white p-3" style={{ height: '100%', width: '100%' }}>
      <Nav className="flex-column h-100">
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <Nav.Link 
              key={index}
              className="text-white mb-3 d-flex align-items-center sidebar-link"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="me-2" />
              {item.text}
            </Nav.Link>
          ))}
        </div>
        
        <div className="logout-container mt-auto">
          <button 
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Đăng xuất
          </button>
        </div>
      </Nav>
    </div>
  );
};

export default ManagerSidebar;
