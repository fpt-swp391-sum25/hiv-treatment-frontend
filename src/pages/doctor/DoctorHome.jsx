import {
    Link,
    Outlet,
    useLocation
} from "react-router-dom";
import AdminHeader from "../../components/client/PageHeader";
import DoctorPageSideBar from "../../components/doctor/DoctorPageSideBar";
import {
    Breadcrumb,
    Layout,
    message
} from "antd";
import {
    useContext, useEffect
} from "react";
import {
    AuthContext
} from "../../components/context/AuthContext";
import {
    HomeOutlined
} from "@ant-design/icons";
import {
    fetchAccountAPI
} from "../../services/auth.service";

const { Content } = Layout

const DoctorHome = () => {
    const { setUser, setIsAppLoading } = useContext(AuthContext)
    const location = useLocation()
    const pathSnippets = location.pathname.split('/').filter(i => i)
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
            if (error.response?.status === 401
                && error.response?.data?.message === 'JWT token has expired') {
                localStorage.removeItem('token')
                message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.")
            }
        }
    }

    const breadCrumbNameMap = {
        '/doctor/patients': 'Bệnh nhân',
        '/doctor/regimens': 'Phác đồ ARV',
        '/doctor/profile': 'Hồ sơ cá nhân',
        '/doctor/documents': 'Bài viết về HIV',
    }

    const breadcrumbItems = [
        {
            title: <Link to='/doctor'><HomeOutlined /></Link>
        },
        ...pathSnippets.map((_, idx) => {
            const url = `/${pathSnippets.slice(0, idx + 1).join('/')}`
            if (url === '/doctor') return null
            if (
                pathSnippets.length >= 3
                && pathSnippets[0] === 'doctor'
                && pathSnippets[1] === 'patients'
                && idx === 2
            ) {
                return {
                    title: 'Chi tiết bệnh nhân',
                    key: url
                }
            }
            return {
                title: <Link to={url}>{breadCrumbNameMap[url]}</Link>,
                key: url,
            }
        }).filter(Boolean)
    ]

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <AdminHeader />
            <Layout>
                <DoctorPageSideBar />
                <Layout style={{ padding: "16px" }}>
                    <Breadcrumb
                        style={{ marginBottom: 16 }}
                        items={
                            breadcrumbItems
                        }
                    />
                    <Content>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}
export default DoctorHome
