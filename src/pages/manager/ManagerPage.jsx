import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import ManagerSidebar from '../../components/manager/Layout/ManagerSidebar';
import ManagerHeader from '../../components/manager/Layout/ManagerHeader';

const { Content } = Layout;

const ManagerPage = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <ManagerHeader />
      <Layout>
        <ManagerSidebar />
        <Layout style={{ marginLeft: 230, transition: 'all 0.2s' }}>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: '#fff',
              borderRadius: 8,
              overflow: 'auto',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ManagerPage;
