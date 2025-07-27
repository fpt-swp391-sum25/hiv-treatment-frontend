import {
    Breadcrumb,
    Layout,
    message
} from "antd";
import {
    Link,
    Outlet,
    useLocation
} from 'react-router-dom';
import AdminHeader from "../../components/client/PageHeader";
import LabTechnicianSideBar from '../../components/lab-technician/LabTechnicianSideBar';
import {
    AuthContext
} from "../../components/context/AuthContext";
import {
    useContext,
    useEffect
} from "react";
import {
    HomeOutlined
} from "@ant-design/icons";
import {
    fetchAccountAPI
} from "../../services/auth.service";

const { Content } = Layout

const LabTechnicianHomePage = () => {
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
            if (error.response?.status === 401 && error.response?.data?.message === 'JWT token has expired') {
                localStorage.removeItem('token')
                message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.")
            }
        }
    }

    const breadcrumbNameMap = {
        '/lab-technician/profile': 'Thông tin cá nhân'
    }

    const breadcrumbItems = [
        {
            title: <Link to='/lab-technician'><HomeOutlined /></Link>,
            key: 'home'
        },
        ...pathSnippets.map((_, idx) => {
            const url = `/${pathSnippets.slice(0, idx + 1).join('/')}`
            if (url === '/lab-technician') return null
            if (
                pathSnippets.length >= 3 &&
                pathSnippets[0] === 'lab-technician' &&
                pathSnippets[1] === 'patient-detail' &&
                idx === 2
            ) {
                return {
                    title: 'Chi tiết bệnh nhân',
                    key: url
                }
            }
            if (breadcrumbNameMap[url])
                return {
                    title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
                    key: url,
                }
        }).filter(Boolean),
    ]

    return (
        <Layout>
            <AdminHeader />
            <Layout>
                <LabTechnicianSideBar />
                <Layout style={{ padding: '15px' }}>
                    <Breadcrumb items={breadcrumbItems} />
                    <Content>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}
export default LabTechnicianHomePage