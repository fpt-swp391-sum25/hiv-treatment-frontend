import { Layout, message } from "antd";
import { Outlet } from 'react-router-dom';
import AdminHeader from "../../components/client/PageHeader";
import LabTechnicianSideBar from '../../components/lab-technician/LabTechnicianSideBar';
import { AuthContext } from "../../components/context/AuthContext";
import { useContext, useEffect } from "react";
import { fetchAccountAPI, fetchUserInfoAPI } from "../../services/api.service";

const { Content } = Layout;

const LabTechnicianHomePage = () => {
    const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext)
    useEffect(() => {
        fetchUserInfo()
    }, [])

    const fetchUserInfo = async () => {
        try {
            const response = await fetchAccountAPI()
            if (response.data) {
                setUser(response.data)
                setIsAppLoading(false)
            }
        } catch (error) {
            if (error.response?.status === 401 && error.response?.data?.message === 'JWT token has expired') {
                localStorage.removeItem('token');
                message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.")
            }
        }
    }

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