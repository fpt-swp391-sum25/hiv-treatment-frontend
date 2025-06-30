import React from 'react';
import { Layout, Avatar, Typography, Space, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import appLogo from '../../../assets/appLogo.png';
import './ManagerHeader.css';

const { Header } = Layout;
const { Title } = Typography;

const ManagerHeader = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login');
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
        Chào mừng Quản lí
      </Title>

      <div className="header-right">
        <Avatar 
          icon={<UserOutlined />}
          size={46} 
          className="user-avatar"
        />
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </div>
    </Header>
  );
};

export default ManagerHeader;
