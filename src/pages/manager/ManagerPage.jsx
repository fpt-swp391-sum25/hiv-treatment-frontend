import { Link, Outlet, useLocation } from 'react-router-dom';
import { Breadcrumb, Layout, message } from 'antd';
import { useContext, useEffect } from 'react';
import ManagerSidebar from '../../components/manager/Layout/ManagerSidebar';
import ManagerHeader from '../../components/manager/Layout/ManagerHeader';
import { AuthContext } from '../../components/context/AuthContext';
import { fetchAccountAPI } from '../../services/api.service';
import './ManagerPage.css';

const { Content } = Layout;

const ManagerPage = () => {
  const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext);
  const location = useLocation()
  const pathSnippets = location.pathname.split('/').filter(i => i)

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

  const breadcrumbNameMap = {
    '/manager/doctors': 'Bác sĩ',
    '/manager/lab-technicians': 'Kĩ thuật viên',
    '/manager/schedule': 'Quản lí lịch',
    '/manager/default-regimen': 'Phác đồ mặc định',
    '/manager/reports': 'Báo cáo',
    '/manager/profile': 'Thông tin cá nhân'
  }

  const breadcrumbItems = [
    ...pathSnippets.map((_, idx) => {
      const url = `/${pathSnippets.slice(0, idx + 1).join('/')}`
      if (url === '/manager') return null
      return {
        title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
        key: url

      }
    }).filter(Boolean)
  ]

  return (
    <Layout className="manager-layout">
      <ManagerHeader />
      <Layout className="manager-content-layout">
        <ManagerSidebar />
        <Layout className="main-content-layout" style={{ padding: '15px' }}>
          <Breadcrumb items={breadcrumbItems} />
          <Content className="main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ManagerPage;
