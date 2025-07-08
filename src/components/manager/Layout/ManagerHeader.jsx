import React, { useContext } from 'react';
import { Layout, Avatar, Typography, Space, Button } from 'antd';
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
      message.success("Đăng xuất thành công")
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
        <Text style={{ color: 'black', marginLeft: 4, marginRight: 4 }}>{user.fullName}</Text>
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
