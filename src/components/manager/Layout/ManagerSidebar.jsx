import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  BarChartOutlined, 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  FileOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const ManagerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    {
      key: '/manager/dashboard',
      icon: <BarChartOutlined />,
      label: 'Thống kê',
    },
    {
      key: '/manager/doctors',
      icon: <UserOutlined />,
      label: 'Bác sĩ',
    },
    {
      key: '/manager/lab-technicians',
      icon: <TeamOutlined />,
      label: 'Nhân viên',
    },
    {
      key: '/manager/schedule',
      icon: <CalendarOutlined />,
      label: 'Quản lí lịch',
    },
    {
      key: '/manager/reports',
      icon: <FileOutlined />,
      label: 'Báo cáo',
    },
  ];

  // Custom styles cho menu items
  const getMenuItemStyle = (isSelected) => {
    return {
      backgroundColor: isSelected ? '#f0f7ff' : 'transparent', // Màu nền nhẹ khi được chọn
      color: isSelected ? '#2056df' : '#555', // Màu chữ xanh khi được chọn, xám khi không
      margin: '4px 0',
      borderRadius: '4px',
      fontWeight: isSelected ? '500' : 'normal',
    };
  };

  return (
    <Sider
      width={230}
      style={{
        background: '#ffffff', // Đổi từ xanh dương sang trắng
        height: '100%',
        position: 'fixed',
        left: 0,
        overflow: 'auto',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)', // Shadow nhẹ hơn
        borderRight: '1px solid #f0f0f0', // Thêm viền phải
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 8px' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ 
            background: '#ffffff', // Đổi từ xanh dương sang trắng
            borderRight: 0,
            marginTop: '20px',
          }}
          items={menuItems.map(item => ({
            ...item,
            style: getMenuItemStyle(location.pathname === item.key),
            icon: React.cloneElement(item.icon, { 
              style: { 
                color: location.pathname === item.key ? '#2056df' : '#555' 
              } 
            }),
          }))}
          onClick={({ key }) => navigate(key)}
        />
      </div>
    </Sider>
  );
};

export default ManagerSidebar;
