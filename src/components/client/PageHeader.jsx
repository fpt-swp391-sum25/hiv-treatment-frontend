import { Layout, Button, Avatar, Typography, message, theme } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { logoutAPI } from "../../services/api.service";
import { useNavigate } from "react-router-dom";
import appLogo from '../../assets/appLogo.png'

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
                />
            </div>
            <div>
                <Text style={{ color: 'black', marginLeft: 4, marginRight: 4 }}>{user.username}</Text>
                <Avatar icon={<UserOutlined />} />
            </div>
            <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout} danger>
                Đăng xuất
            </Button>
        </Header>
    )
}

export default PageHeader