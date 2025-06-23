import { Outlet } from "react-router-dom";
import AdminHeader from "../../components/client/PageHeader";
import DoctorPageSideBar from "../../components/doctor/DoctorPageSideBar";
import { Layout } from "antd";

const DoctorHomePage = () => {
    return (
        <Layout>
            <AdminHeader/>
            <Layout>
                <DoctorPageSideBar/>
            </Layout>
        </Layout>
    )
}
export default DoctorHomePage;