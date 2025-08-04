import { 
  NavLink, 
  useLocation 
} from 'react-router-dom';
import '../../styles/admin/AdminSideBar.css';
import { 
  Layout, 
  Menu, 
  theme 
} from 'antd';
import { 
  BarChartOutlined, 
  TeamOutlined, 
  SettingOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { Sider } = Layout

const AdminSidebar = () => {
  const location = useLocation();
  const items = [
    {
      key: '1',
      label: <NavLink to='/admin'>Tổng quan</NavLink>,
      icon: <BarChartOutlined />,
      path: '/admin'
    },
    {
      key: '2',
      label: 'Quản lí người dùng',
      icon: <TeamOutlined />,
      children: [
        {
          key: '3',
          label: <NavLink to='/admin/managers'>Quản lí</NavLink>,
          path: '/admin/managers'
        },
        {
          key: '4',
          label: <NavLink to='/admin/doctors'>Bác sĩ</NavLink>,
          path: '/admin/doctors'
        },
        {
          key: '5',
          label: <NavLink to='/admin/lab-technicians'>Kỹ thuật viên</NavLink>,
          path: '/admin/lab-technicians'
        },
        {
          key: '6',
          label: <NavLink to='/admin/cashiers'>Thu ngân</NavLink>,
          path: '/admin/cashiers'
        },
        {
          key: '7',
          label: <NavLink to='/admin/patients'>Bệnh nhân</NavLink>,
          path: '/admin/patients'
        },
      ],
    },
    {
      key: '8',
      label: <NavLink to='/admin/test-types'>Loại xét nghiệm</NavLink>,
      icon: <ExperimentOutlined />,
      path: '/admin/test-types'
    },
    {
      key: '9',
      label: <NavLink to='/admin/system-config'>Cài đặt hệ thống</NavLink>,
      icon: < SettingOutlined />,
      path: '/admin/system-config'
    }
  ];

  // Function to keep the chosen sidebar option stay active
  const findActiveMenu = () => {
    const activeItem = items.find(item =>
      location.pathname === item.path
    );
    if (activeItem) return activeItem.key;
    for (const item of items) {
      if (item.children) {
        const activeChild = item.children.find(child =>
          location.pathname === child.path ||
          (child.path && location.pathname.startsWith(child.path))
        );
        if (activeChild) return activeChild.key;
      }
    }
    return '';
  };

  const selectedKeys = findActiveMenu();

  // Set basic white theme for the sidebar
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Sider width={250} style={{ background: colorBgContainer, padding: '10px' }}>
      <Menu
        mode="inline"
        selectedKeys={[selectedKeys]}
        defaultOpenKeys={["2"]}
        style={{ height: '100%', borderRight: 0 }}
        items={items}
      />
    </Sider>
  )
}
export default AdminSidebar