import { Layout, Menu } from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
    CalendarOutlined,
  FileOutlined,
  SolutionOutlined,
  IdcardOutlined,
  DollarOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/manager/ManagerSidebar.css';

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
      icon: <MedicineBoxOutlined />,
      label: 'Kĩ thuật viên',
    },
    {
      key: '/manager/cashier',
      icon: <DollarOutlined  />,
      label: 'Thu ngân',
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
