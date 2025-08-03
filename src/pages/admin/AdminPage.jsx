import {
    Breadcrumb,
    Layout,
    message,
    theme
} from 'antd';
import PageHeader from '../../components/client/PageHeader';
import AdminSidebar from '../../components/admin/AdminSideBar';
import {
    Link,
    Outlet,
    useLocation
} from 'react-router-dom';
import {
    useContext,
    useEffect
} from 'react';
import {
    AuthContext
} from '../../components/context/AuthContext';
import {
    HomeOutlined
} from '@ant-design/icons';
import {
    fetchAccountAPI
} from '../../services/auth.service';
const { Content } = Layout;

const Admin = () => {
    const { token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()
    const { setUser, setAuthUser, setIsAppLoading } = useContext(AuthContext)

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
                localStorage.removeItem('token')
                message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.")
            }
        }
    }

    const location = useLocation()
    const pathSnippets = location.pathname.split('/').filter(i => i)
    const breadcrumbNameMap = {
        '/admin/managers': 'Quản lí',
        '/admin/doctors': 'Bác sĩ',
        '/admin/lab-technicians': 'Kỹ thuật viên',
        '/admin/cashiers': 'Thu ngân',
        '/admin/patients': 'Bệnh nhân',
        '/admin/test-types': 'Loại xét nghiệm',
        '/admin/system-config': 'Cài đặt hệ thống',
    }

    const breadcrumbItems = [
        {
            title: <Link to="/admin"><HomeOutlined /></Link>,
            key: 'home',
        },
        ...pathSnippets.map((_, idx) => {
            const url = `/${pathSnippets.slice(0, idx + 1).join('/')}`
            if (url === '/admin') return null // avoid duplicating Home
            return {
                title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
                key: url,
            }
        }).filter(Boolean),
    ]

    return (
        <Layout>
            <PageHeader />
            <Layout>
                <AdminSidebar />
                <Layout style={{ padding: '15px' }}>
                    <Breadcrumb
                        style={{ marginBottom: 16 }}
                        items={
                            breadcrumbItems
                        }
                    />
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
    )
}
export default Admin