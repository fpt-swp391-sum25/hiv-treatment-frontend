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
import CashierSideBar from "../../components/cashier/CashierSideBar";

const { Content } = Layout;

const CashierHomePage = () => {
    const { setUser, setIsAppLoading } = useContext(AuthContext);
    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter(i => i);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await fetchAccountAPI();
            if (response.data) {
                setUser(response.data);
                setIsAppLoading(false);
            }
        } catch (error) {
            if (error.response?.status === 401 && error.response?.data?.message === 'JWT token has expired') {
                localStorage.removeItem('token');
                message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
            }
        }
    };

    const breadcrumbNameMap = {
        '/cashier/test-payment': 'Thanh toán xét nghiệm',
        '/cashier/transaction-lookup': 'Tra cứu giao dịch',
        '/cashier/profile': 'Thông tin cá nhân'
    };


    const isCashierRoot = location.pathname === '/cashier';
    const breadcrumbItems = isCashierRoot
        ? [
            {
                title: (
                    <>
                        <HomeOutlined style={{ marginRight: 6 }} />
                        <span>Thanh toán lịch khám</span>
                    </>
                ),
                key: 'cashier-home'
            }
        ]
        : [
            {
                title: <Link to='/cashier'><HomeOutlined /></Link>,
                key: 'home'
            },
            ...pathSnippets.map((_, idx) => {
                const url = `/${pathSnippets.slice(0, idx + 1).join('/')}`;
                if (url === '/cashier') return null;
                if (breadcrumbNameMap[url]) {
                    return {
                        title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
                        key: url
                    };
                }
                return null;
            }).filter(Boolean)
        ];


    return (
        <Layout>
            <AdminHeader />
            <Layout>
                <CashierSideBar />
                <Layout style={{ padding: '15px' }}>
                    <Breadcrumb items={breadcrumbItems} />
                    <Content>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};
export default CashierHomePage;
