import { 
    Layout, 
    theme 
} from 'antd'
import CareIntroSection from '../../components/home-section/CareIntroSection'
import ServicesSection from '../../components/home-section/ServicesSection'
import FullServicesSection2 from '../../components/home-section/FullServicesSection2'
import DoctorList from '../../components/home-section/DoctorList'
import DocumentList from '../../components/home-section/DocumentList'
import { 
    Outlet 
} from 'react-router-dom'

const { Content } = Layout

const Home = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()
    
    return (
        <Layout>
            <Content style={{ padding: '15px' }}>
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 1080,
                        padding: 24,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <CareIntroSection />
                    <ServicesSection />
                    <FullServicesSection2 />
                    <DoctorList />
                    <DocumentList />
                </div>
                <Outlet />
            </Content>
        </Layout>
    )
}
export default Home
