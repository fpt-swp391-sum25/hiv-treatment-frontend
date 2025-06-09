import { Layout, Button, Avatar, Typography, message } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { AuthContext } from "../../context/auth.context";
import { logoutAPI } from "../../../services/api.service";
import { useNavigate } from "react-router-dom";

const { Header } = Layout
const { Text } = Typography

const AdminHeader = () => {

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
            message.success("Đăng xuất thành công")
            navigate("/login")
        }
    };
    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Avatar icon={<UserOutlined />} />
                <Text style={{ color: '#fff', marginLeft: 4, marginRight: 4, color: "white" }}>{user.username}</Text>
            </div>
            <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout} danger>
                Đăng xuất
            </Button>
        </Header>
    )
}

export default AdminHeader