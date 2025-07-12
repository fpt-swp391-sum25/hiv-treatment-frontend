import React, { useContext } from 'react';
import { Layout, Avatar, Typography, Space, Button, Popconfirm } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import appLogo from '../../../assets/appLogo.png';
import './ManagerHeader.css';
import { AuthContext } from '../../context/AuthContext';
import { logoutAPI } from '../../../services/api.service';

const { Header } = Layout;
const { Title, Text } = Typography;

const ManagerHeader = () => {
  const { user, setUser } = useContext(AuthContext)
  const navigate = useNavigate();

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
      localStorage.setItem('auth_error', 'Đăng xuất thành công');
      navigate("/login")
    }
  };

  return (
    <Header className="manager-header-fixed">
      <div className="header-left">
        <div className="logo-container">
          <img
            src={appLogo}
            alt="Logo"
            className="app-logo"
            onClick={() => navigate('/manager/dashboard')}
          />
        </div>
      </div>

      <Title
        level={4}
        className="header-title"
      >
      </Title>

      <div className="header-right">
        <Text style={{ color: 'black' }}>{user.fullName}</Text>
        <Avatar
          src={user.avatar || null}
          icon={!user.avatar ? <UserOutlined /> : null}
          style={{ margin: '0 8px' }}
        />
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
      </div>
    </Header>
  );
};

export default ManagerHeader;
