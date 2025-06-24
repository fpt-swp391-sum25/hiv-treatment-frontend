import { Outlet } from "react-router-dom";
import AdminHeader from "../../components/client/PageHeader";
import DoctorPageSideBar from "../../components/doctor/DoctorPageSideBar";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";

const DoctorHome = () => {
    return (
        <Layout style = {{ minHeight: '100vh'}}>
            <AdminHeader/>
            <Layout>
                <DoctorPageSideBar/>
                <Layout>
                    <Content>
                        <Outlet/>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}
export default DoctorHome;