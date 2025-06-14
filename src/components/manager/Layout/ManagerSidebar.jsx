import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaChartBar, FaUserMd, FaUsers, FaCalendarAlt, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
    <div className="manager-sidebar bg-dark text-white p-3" style={{ minHeight: '100vh', width: '250px' }}>
      <Nav className="flex-column">
        {menuItems.map((item, index) => (
          <Nav.Link 
            key={index}
            className="text-white mb-3 d-flex align-items-center"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="me-2" />
            {item.text}
          </Nav.Link>
        ))}
        <Nav.Link 
          className="text-white mb-3 d-flex align-items-center mt-auto"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" />
          Đăng xuất
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default ManagerSidebar;
