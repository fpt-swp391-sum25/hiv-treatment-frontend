
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Space, message, Tooltip, Popconfirm, notification } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined, CalendarOutlined, FileSearchOutlined, HistoryOutlined, EditOutlined, SettingOutlined, } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import appLogo from '../../assets/appLogo.png';
import '../../styles/client/AppHeader.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { logoutAPI } from '../../services/api.service';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const location = useLocation();
  const [activeSetion, setActiveSection] = useState('home');
  const { user, setUser } = useContext(AuthContext)

  // Thêm event listener để theo dõi scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'care-section', key: 'home' },
        { id: 'why-services-section', key: 'services' },
        { id: 'doctor-section', key: 'doctors' },
        { id: 'document-section', key: 'resources' }
      ]; const scrollPosition = window.scrollY + 200;// Tăng offset để thấy tiêu đề rõ hơn

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
  }, []); const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 120; // Điều chỉnh offset để thấy tiêu đề
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

  const navigate = useNavigate();

  const handleMenuClick = (scrollTo) => {
    // Nếu đang không ở trang chủ, chuyển về trang chủ trước
    if (location.pathname !== '/') {
      navigate('/');
      // Đợi một chút để đảm bảo DOM đã load xong
      setTimeout(() => {
        scrollToSection(scrollTo);
      }, 100);
    } else {
      // Nếu đã ở trang chủ thì chỉ cần scroll
      scrollToSection(scrollTo);
    }
  };

  const mapMenuItems = (items) =>
    items.map((item) => ({
      key: item.key,
      icon: item.icon || null,
      label: item.scrollTo ? (
        <a onClick={() => handleMenuClick(item.scrollTo)} style={{ cursor: 'pointer' }}>
          {item.label}
        </a>
      ) : (
        <Link to={item.path} onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>{item.label}</Link>
      ),
    }));

  // Lấy key menu đang được chọn
  const getActiveMenu = (items) => {
    return (
      items.find(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/')
      )?.key || ''
    );
  };

  // Thêm biến này để xác định key menu cần highlight
  const selectedMenuKey = location.pathname === '/' ? activeSetion : getActiveMenu(topMenuItems);


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
      notification.success({
        message: 'Hệ thống',
        showProgress: true,
        pauseOnHover: true,
        description: 'Đăng xuất thành công'
      });
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

        <div className="app-menu" >
          <Menu

            mode="horizontal"
            selectedKeys={[selectedMenuKey]}
            items={mapMenuItems(topMenuItems)}
            className="main-menu"
          />
        </div>
        <div className="auth-section">
          {user.username ? (
            <Space align="center" size={8} className="user-actions">
              <Link to='/profile' style={{ margin: '10px' }}>
                <Space style={{ cursor: 'pointer' }} align="center">
                  <Tooltip title={user.fullName}>
                    <Text style={{ marginLeft: 4, marginRight: 4, color: "white" }}>{user.fullName} </Text>
                    <Avatar
                      src={user.avatar !== '' ? user.avatar : null}
                      icon={user.avatar === '' ? <UserOutlined /> : null}
                    />
                    <span style={{ color: 'white' }}> <SettingOutlined /></span>
                  </Tooltip>
                </Space>
              </Link>

              <Popconfirm
                title="Đăng xuất"
                description="Bạn có chắc muốn đăng xuất?"
                onConfirm={handleLogout}
                okText="Có"
                cancelText="Không"
                placement="left">


                <Button
                  type="primary"
                  icon={<LogoutOutlined />}
                  danger
                >
                  Đăng xuất
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Space size="middle" className="auth-buttons">
              <Link to="/login">
                <Button  >Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng kí</Button>
              </Link>
            </Space>
          )}
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
