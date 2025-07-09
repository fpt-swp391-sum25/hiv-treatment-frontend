import { Layout, Button, Avatar, Typography, message, theme, Popover, Tooltip, Popconfirm } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { logoutAPI } from "../../services/api.service";
import { useNavigate } from "react-router-dom";
import appLogo from '../../assets/appLogo.png'
import '../manager/Layout/ManagerHeader.css'

const { Header } = Layout
const { Text } = Typography

const PageHeader = () => {

    const { user, setUser } = useContext(AuthContext)
    const navigate = useNavigate()


    const handleLogout = async () => {
        const response = await logoutAPI()
        if (response.data) {
            localStorage.removeItem("access_token")
            setUser({
                id: '',
                username: '',
                email: '',
                fullName: '',
                status: '',
                role: ''
            })
            localStorage.setItem('auth_error', 'Đăng xuất thành công');
            navigate("/login")
        }
    };

    const handleLogoClick = () => {
        if (user) {
            if (user.role === "ADMIN") {
                navigate('/admin')
            } else if (user.role === "MANAGER") {
                navigate('/manager')
            } else if (user.role === 'LAB_TECHNICIAN') {
                navigate('/lab-technician')
            } else if (user.role === "DOCTOR") {
                navigate('/doctor')
            } else {
                navigate('/')
            }
        }
    }

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colorBgContainer, }}>
            <div>
                <img
                    src={appLogo}
                    alt="Logo"
                    className="app-logo"
                    onClick={handleLogoClick}
                />
            </div>
            <div className="header-right" style={{ cursor: 'pointer' }}>
                <Tooltip title={user.fullName} >
                    <Text style={{ color: 'black', marginLeft: 4, marginRight: 4 }}>{user.fullName}</Text>
                    <Avatar
                        src={user.avatar !== '' ? user.avatar : null}
                        icon={user.avatar === '' ? <UserOutlined /> : null}
                    />
                </Tooltip>

                <Popconfirm
                    title="Đăng xuất"
                    description="Bạn có chắc muốn đăng xuất?"
                    onConfirm={handleLogout}
                    okText="Có"
                    cancelText="Không"
                    placement="left">


                    <Button
                        type="primary"
                        icon={<LogoutOutlined />}
                        danger
                    >
                        Đăng xuất
                    </Button>
                </Popconfirm>
            </div>
        </Header>
    )
}

export default PageHeader