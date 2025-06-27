import { Layout } from "antd";
import { Outlet } from 'react-router-dom';
import AdminHeader from "../../components/client/PageHeader";
import LabTechnicianSideBar from '../../components/lab-technician/LabTechnicianSideBar';

const { Content } = Layout;

const LabTechnicianHomePage = () => {
    return (
        <Layout>
            <AdminHeader />
            <Layout>
                <LabTechnicianSideBar />
                <Content>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}
export default LabTechnicianHomePage;