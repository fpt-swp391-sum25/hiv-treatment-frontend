import { Outlet } from 'react-router-dom';
import { Layout, message } from 'antd';
import { useContext, useEffect } from 'react';
import ManagerSidebar from '../../components/manager/Layout/ManagerSidebar';
import ManagerHeader from '../../components/manager/Layout/ManagerHeader';
import { AuthContext } from '../../components/context/AuthContext';
import { fetchAccountAPI } from '../../services/api.service';
import './ManagerPage.css';

const { Content } = Layout;

const ManagerPage = () => {
  const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetchAccountAPI();
      if (response.data) {
        setUser(response.data);
        setIsAppLoading(false);
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.message === 'JWT token has expired') {
        localStorage.removeItem('access_token');
        message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
      }
      setIsAppLoading(false);
    }
  };

  return (
    <Layout className="manager-layout">
      <ManagerHeader />
      <Layout className="manager-content-layout">
        <ManagerSidebar />
        <Layout className="main-content-layout">
          <Content className="main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ManagerPage;
