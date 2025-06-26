import { Layout, message, theme } from 'antd';
import PageHeader from '../../components/client/PageHeader';
import AdminSidebar from '../../components/admin/AdminSideBar';
import { Outlet } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import { fetchAccountAPI } from '../../services/api.service';
const { Content } = Layout;

const Admin = () => {
    const { token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const { setUser, setAuthUser, isAppLoading, setIsAppLoading } = useContext(AuthContext)

    useEffect(() => {
        fetchUserInfo()
    }, [])

    const fetchUserInfo = async () => {
        try {
            const response = await fetchAccountAPI()
            if (response.data) {
                setUser(response.data)
                setAuthUser(response.data)
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
            <PageHeader />
            <Layout>
                <AdminSidebar />
                <Layout style={{ padding: '15px' }}>
                    <Content
                        style={{
                            padding: 15,
                            minHeight: 1080,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};
export default Admin;