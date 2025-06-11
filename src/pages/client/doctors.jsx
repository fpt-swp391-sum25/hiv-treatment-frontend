import React from 'react'
import AppHeader from '../../components/layouts/client/app-header'
import ResourcesBanner from '../../components/resources/resources-banner'
import AppFooter from '../../components/layouts/client/app-footer'
import { Layout, theme } from 'antd'
import { Content } from 'antd/es/layout/layout'
import { Outlet } from 'react-router-dom'




const Doctors= () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
  return (
    <Layout>
            <AppHeader />
            <Content style={{ padding: '15px' }}>
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 1080,
                        padding: 24,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <h1> Comming Soon </h1>
                </div>
                <Outlet />
            </Content>
            <AppFooter />         
        </Layout>
  )
}


const Doctors = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Layout>
            <AppHeader />
             <DoctorsBanner/>
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
export default Doctors;