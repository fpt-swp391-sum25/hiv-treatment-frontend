import { 
    Layout, 
    theme 
} from 'antd'
import { 
    Outlet 
} from 'react-router-dom'
import AppFooter from '../../components/client/AppFooter'
import AppHeader from '../../components/client/AppHeader'
import DoumentBanner from '../../components/document/DoumentBanner'
import DoumentSearchPage from '../../components/document/DoumentSearchPage'

const { Content } = Layout

const Resources = () => { 
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()
    
    return (
        <Layout>
            <AppHeader />
            <DoumentBanner />
            <Content style={{ padding: '15px' }}>
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 1080,
                        padding: 24,
                        borderRadius: borderRadiusLG,
                    }}
                >                    
                    <DoumentSearchPage />
                </div>
                <Outlet />
            </Content>
            <AppFooter />         
        </Layout>
    )
}
export default Resources