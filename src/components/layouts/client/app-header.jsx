// src/components/layout/AppHeader.jsx
import { Layout, Menu, theme, Avatar, Dropdown, Typography, Button, Space, message } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined, CalendarOutlined, FileSearchOutlined, HistoryOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import appLogo from '../../../assets/appLogo.png';
import './app-header.css';
import { AuthContext } from '../../context/auth.context';
import { useContext } from 'react';
import { logoutAPI } from '../../../services/api.service';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { user, setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const location = useLocation();

  const menuItems = [
    { key: 'home', label: 'Trang chủ', path: '/' },
    { key: 'services', label: 'Dịch vụ', path: '/services' },
    { key: 'doctors', label: 'Bác sĩ', path: '/doctors' },
    { key: 'resources', label: 'Tài liệu & Blog', path: '/resources' },
    {
      key: 'booking',
      label: 'Đặt lịch khám',
      path: '/booking',
      icon: <CalendarOutlined />
    },
    {
      key: 'test-results',
      label: 'Tra cứu XN',
      path: '/test-results',
      icon: <FileSearchOutlined />
    },
    {
      key: 'history',
      label: 'Lịch sử khám',
      path: '/history',
      icon: <HistoryOutlined />
    },
  ];

  const mapMenuItems = (items) => items.map(item => ({
    key: item.key,
    icon: item.icon,
    label: <Link to={item.path}>{item.label}</Link>,
  }));

  const getActiveMenu = (items) => {
    return items.find(
      item =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + '/')
    )?.key;
  };

  const userMenu = (
    <Menu
      items={[
        { key: 'profile', label: 'Profile' },
        { key: 'settings', label: 'Settings' },
      ]}
      onClick={({ key }) => {
        console.log(`Clicked on ${key}`);
      }}
    />
  );

  const handleLogout = async () => {
    const response = await logoutAPI()
    if (response.data) {
      localStorage.removeItem("access_token")
      setUser({
        id: '',
        username: '',
        email: '',
        fullName: '',
        status: '',
        role: ''
      })
      message.success("Đăng xuất thành công")
      navigate("/")
    }
  };

  return (
    <Header className="app-header">
      <div className="header-content">
        <div className="app-logo">
          <Link to="/">
            <img src={appLogo} alt="logo" />
          </Link>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[getActiveMenu(menuItems)]}
          items={mapMenuItems(menuItems)}
          className="main-menu"
        />

        {user.id ? (
          <Space align="center" size={8} style={{ cursor: 'default' }}>
            <Dropdown menu={userMenu} placement="bottomLeft" arrow>
              <Space style={{ cursor: 'pointer' }} align="center">
                <Avatar icon={<UserOutlined />} />
                <Text style={{ marginLeft: 4, marginRight: 4, color: 'white' }}>{user.username}</Text>
                <DownOutlined />
              </Space>
            </Dropdown>
            <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout} danger>
              Đăng xuất
            </Button>
          </Space>
        ) : (
          <Space size="middle" className="auth-buttons">
            <Link to="/login">
              <Button type="primary">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button>Đăng kí</Button>
            </Link>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;
