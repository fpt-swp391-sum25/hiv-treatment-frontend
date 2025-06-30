import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import ManagerSidebar from '../../components/manager/Layout/ManagerSidebar';
import ManagerHeader from '../../components/manager/Layout/ManagerHeader';
import './ManagerPage.css';

const { Content } = Layout;

const ManagerPage = () => {
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
