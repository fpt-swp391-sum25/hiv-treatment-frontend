import { Outlet } from "react-router-dom";
import AdminHeader from "../../components/client/PageHeader";
import DoctorPageSideBar from "../../components/doctor/DoctorPageSideBar";
import { Layout, message } from "antd";
import { useContext, useEffect } from "react";
import { fetchAccountAPI } from "../../services/api.service";
import { AuthContext } from "../../components/context/AuthContext";

const { Header, Content } = Layout;

const DoctorHome = () => {
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
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ background: "#fff", padding: 0 }}>
                <AdminHeader />
            </Header>
            <Layout>
                <DoctorPageSideBar />
                <Layout style={{ padding: "16px" }}>
                    <Content>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default DoctorHome;
