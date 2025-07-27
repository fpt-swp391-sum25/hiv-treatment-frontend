import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Button,
  Space,
  message,
  Tooltip,
  Popconfirm,
  Badge,
  List,
  Popover,
  Spin
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';
import {
  useState,
  useEffect,
  useContext
} from 'react';

import appLogo from '../../assets/appLogo.png';
import '../../styles/client/AppHeader.css';
import { AuthContext } from '../context/AuthContext';

import {
  getNotificationsByUserId,
  updateNotification
} from '../../services/notification.service';
import { logoutAPI } from '../../services/auth.service';
import '../../styles/global.css'

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState('home');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'care-section', key: 'home' },
        { id: 'why-services-section', key: 'services' },
        { id: 'doctor-section', key: 'doctors' },
        { id: 'document-section', key: 'resources' }
      ];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section.key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let intervalId;

    // Poll notifications every 5 second
    const pollNotifications = async () => {
      try {
        const res = await getNotificationsByUserId(user.id);
        const latest = res.data.map(n => ({
          ...n,
          isRead: n.read,
        }));

        const hasNew = latest.some(
          (n) => !notifications.some((old) => old.id === n.id)
        );

        if (hasNew) {
          setNotifications(latest);
        }
      } catch (error) {
        message.error("Lỗi khi cập nhật thông báo:", error);
      }
    };

    if (user?.id) {
      intervalId = setInterval(pollNotifications, 5000);
    }

    return () => clearInterval(intervalId);
  }, [user?.id, notifications]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotificationsByUserId(user.id);
      setNotifications(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  // Change notification display when it's clicked
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await updateNotification(notification.id, { ...notification, isRead: true });
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
  };

  // Scroll the menu to chosen option
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 120;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const topMenuItems = [
    { key: 'home', label: 'Trang chủ', scrollTo: 'care-section' },
    { key: 'services', label: 'Dịch vụ', scrollTo: 'why-services-section' },
    { key: 'doctors', label: 'Bác sĩ', scrollTo: 'doctor-section' },
    { key: 'resources', label: 'Tài liệu', scrollTo: 'document-section' },
    { key: 'booking', label: 'Đặt lịch khám', path: '/booking' },
    { key: 'appointments', label: 'Lịch hẹn', path: '/appointment' },
  ];

  // Naviagte to right menu option when it's clicked
  const handleMenuClick = (scrollTo, key) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        setActiveSection(key);
        scrollToSection(scrollTo);
      }, 100);
    } else {
      setActiveSection(key);
      scrollToSection(scrollTo);
    }
  };

  const mapMenuItems = (items) =>
    items.map((item) => ({
      key: item.key,
      label: item.scrollTo ? (
        <a onClick={() => handleMenuClick(item.scrollTo, item.key)}>{item.label}</a>
      ) : (
        <Link to={item.path} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {item.label}
        </Link>
      )
    }));

  // Change display of active menu option
  const getActiveMenu = (items) => {
    return (
      items.find(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/')
      )?.key || ''
    );
  };

  const selectedMenuKey = location.pathname === '/' ? activeSection : getActiveMenu(topMenuItems);

  const handleLogout = async () => {
    const response = await logoutAPI();
    if (response.data) {
      localStorage.removeItem('access_token');
      setUser({ id: '', username: '', email: '', fullName: '', status: '', role: '' });
      message.success('Đăng xuất thành công');
      navigate('/');
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
          selectedKeys={[selectedMenuKey]}
          items={mapMenuItems(topMenuItems)}
          className="main-menu"
        />

        <div className="auth-section">
          {user.username ? (
            <Space align="center" size={8} className="user-actions">
              <Popover
                content={
                  <Spin spinning={loading}>
                    <List
                      // Only display first 10 notifications
                      dataSource={
                        [...notifications]
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .slice(0, 10)
                      }
                      locale={{ emptyText: 'Không có thông báo' }}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            background: item.read ? '#fff' : '#e6f7ff',
                            fontWeight: item.read ? 'normal' : 'bold',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleNotificationClick(item)}
                        >
                          <div>
                            <span>{item.title}</span>
                            <div style={{ fontSize: 12, color: '#888' }}>{item.message}</div>
                            <div style={{ fontSize: 10, color: '#aaa' }}>{item.createdAt}</div>
                          </div>
                        </List.Item>
                      )}
                      style={{ width: 300, maxHeight: 400, overflow: 'auto' }}
                    />
                  </Spin>
                }
                trigger="click"
                open={popoverOpen}
                onOpenChange={(open) => {
                  setPopoverOpen(open);
                  if (open) loadNotifications();
                }}
                placement="bottomRight"
              >
                <Badge count={unreadCount}>
                  <BellOutlined style={{ fontSize: 22, color: 'white', cursor: 'pointer' }} />
                </Badge>
              </Popover>

              <Link to='/profile'>
                <Tooltip title={user.fullName}>
                  <Text style={{ color: 'white' }}>{user.fullName}</Text>
                  <Avatar
                    src={user.avatar || null}
                    icon={!user.avatar ? <UserOutlined /> : null}
                    style={{ margin: '0 8px' }}
                  />
                  <SettingOutlined style={{ color: 'white' }} />
                </Tooltip>
              </Link>

              <Popconfirm
                title="Đăng xuất"
                description="Bạn có chắc chắn muốn đăng xuất?"
                onConfirm={handleLogout}
                okText="Có"
                cancelText="Không"
                placement="left"
              >
                <Button type="primary" icon={<LogoutOutlined />} danger>
                  Đăng xuất
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Space size="middle" className="auth-buttons">
              <Link to="/login">
                <Button type='text'>Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button className='btn-sign-up'>Đăng ký</Button>
              </Link>
            </Space>
          )}
        </div>
      </div>
    </Header>
  );
};
export default AppHeader;
