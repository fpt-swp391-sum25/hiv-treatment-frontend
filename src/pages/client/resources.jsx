
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import AppFooter from '../../components/layouts/client/app-footer';
import AppHeader from '../../components/layouts/client/app-header';
import ResourcesBanner from '../../components/resources/resources-banner';
const { Content } = Layout;

const Resources = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Layout>
            <AppHeader />
             <ResourcesBanner />
            <Content style={{ padding: '15px' }}>
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 1080,
                        padding: 24,
                        borderRadius: borderRadiusLG,
                    }}
                >
                   
                </div>
                <Outlet />
            </Content>
            <AppFooter />         
        </Layout>
    );
};
export default Resources;