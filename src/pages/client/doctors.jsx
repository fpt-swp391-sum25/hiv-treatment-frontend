import React from 'react'
import AppHeader from '../../components/layouts/client/app-header'
import ResourcesBanner from '../../components/resources/resources-banner'
import AppFooter from '../../components/layouts/client/app-footer'
import { Layout, theme } from 'antd'
import { Content } from 'antd/es/layout/layout'
import { Outlet } from 'react-router-dom'
import DoctorsBanner from '../../components/doctors/doctors-banner'
import DoctorsSearchPage from '../../components/doctors/doctors-search-page'




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