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
  BellOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import appLogo from '../../assets/appLogo.png';
import '../../styles/client/AppHeader.css';
import { AuthContext } from '../context/AuthContext';
import { logoutAPI } from '../../services/api.service';
import {
  getNotificationsByUserId,
  updateNotification
} from '../../services/notification.service';
import dayjs from 'dayjs';

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
        console.error("Lỗi khi polling:", error);
      }
    };

    if (user?.id) {
      intervalId = setInterval(pollNotifications, 10000);
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

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await updateNotification(notification.id, { ...notification, isRead: true });
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
  };

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

  const handleMenuClick = (scrollTo) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        scrollToSection(scrollTo);
      }, 100);
    } else {
      scrollToSection(scrollTo);
    }
  };

  const mapMenuItems = (items) =>
    items.map((item) => ({
      key: item.key,
      label: item.scrollTo ? (
        <a onClick={() => handleMenuClick(item.scrollTo)}>{item.label}</a>
      ) : (
        <Link to={item.path} onClick={() => window.scrollTo(0, 0)}>
          {item.label}
        </Link>
      )
    }));

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
          onClick={({ key }) => {
            const clickedItem = topMenuItems.find(item => item.key === key);
            if (clickedItem?.scrollTo) {
              setActiveSection(key);
              handleMenuClick(clickedItem.scrollTo);
            }
          }}
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
                      dataSource={[...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                      locale={{ emptyText: 'Không có thông báo' }}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            background: item.read ? '#fff' : '#f0faff',
                            padding: 12,
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                          }}
                          onClick={() => handleNotificationClick(item)}
                          className="notification-item"
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <BellOutlined style={{ color: '#1890ff' }} />
                                <Text strong>{item.title}</Text>
                              </Space>
                            }
                            description={
                              <div style={{ fontSize: 13, color: '#595959' }}>
                                <div>{item.message}</div>
                                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                                  {dayjs(item.createdAt).format('HH:mm - DD/MM/YYYY')}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                      style={{ width: 320, maxHeight: 400, overflow: 'auto' }}
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
            <Space size="small" className="auth-buttons">
              <Link to="/login">
                <Button
                  icon={<UserOutlined style={{ fontSize: '18px' }} />}
                  type='text'
                >
                  Đăng nhập
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  icon={<UserAddOutlined style={{ fontSize: '18px' }} />}
                  className='btn-sign-up'
                >
                  Đăng ký
                </Button>
              </Link>
            </Space>


          )}
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
