import React from 'react';
import { Layout, Avatar, Typography, Space, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import appLogo from '../../../assets/appLogo.png';

const { Header } = Layout;
const { Title } = Typography;

const ManagerHeader = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login');
  };

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        background: '#ffffff',
        height: 80,
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src={appLogo} 
          alt="Logo" 
          style={{ 
            height: 55,
            objectFit: 'contain',
            cursor: 'pointer',
          }} 
          onClick={() => navigate('/manager/dashboard')}
        />
      </div>

      <Title 
        level={4} 
        style={{ 
          margin: 0, 
          color: '#333333',
          fontWeight: 600,
        }}
      >
        Chào mừng Quản lí
      </Title>

      <Space>
        <Avatar 
          icon={<UserOutlined />}
          size={46} 
          style={{ 
            background: '#2056df',
            color: '#ffffff',
          }}
        />
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </Space>
    </Header>
  );
};

export default ManagerHeader;
