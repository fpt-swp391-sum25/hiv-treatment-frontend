import AppHeader from '../../components/client/AppHeader'
import AppFooter from '../../components/client/AppFooter'
import { Layout, theme } from 'antd'
import { Content } from 'antd/es/layout/layout'
import { Outlet } from 'react-router-dom'
import DoctorsBanner from '../../components/doctor-profile/DoctorProfileBanner'
import DoctorsSearchPage from '../../components/doctor-profile/DoctorProfileSearchPage'




const Doctors= () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
  return (
    <Layout>
            <AppHeader />
            <DoctorsBanner />
            <Content style={{ padding: '15px' }}>
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 1080,
                        padding: 24,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <DoctorsSearchPage />
                </div>
                <Outlet />
            </Content>
            <AppFooter />         
        </Layout>
  )
}
export default Doctors;