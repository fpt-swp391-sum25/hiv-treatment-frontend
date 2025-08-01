import { Layout, Menu } from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileOutlined,
  SolutionOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './ManagerSidebar.css';

const { Sider } = Layout;

const ManagerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/manager',
      icon: <CalendarOutlined />,
      label: 'Quản lí lịch',
    },
    {
      key: '/manager/dashboard',
      icon: <BarChartOutlined />,
      label: 'Thống kê',
    },
    {
      key: '/manager/reports',
      icon: <FileOutlined />,
      label: 'Báo cáo',
    },
    {
      key: '/manager/doctors',
      icon: <UserOutlined />,
      label: 'Bác sĩ',
    },
    {
      key: '/manager/lab-technicians',
      icon: <TeamOutlined />,
      label: 'Kĩ thuật viên',
    },
    {
      key: '/manager/default-regimen',
      icon: <SolutionOutlined />,
      label: 'Phác đồ mặc định',
    },
    {
      key: '/manager/profile',
      icon: <IdcardOutlined />,
      label: 'Hồ sơ cá nhân',
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
      className="manager-sidebar"
    >
      <div className="sidebar-inner">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          className="sidebar-menu"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </div>
    </Sider>
  );
};

export default ManagerSidebar;
