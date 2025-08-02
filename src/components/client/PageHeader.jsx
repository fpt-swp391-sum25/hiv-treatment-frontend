import {
    Layout,
    Button,
    Avatar,
    Typography,
    theme,
    Popover,
    Tooltip,
    Popconfirm,
    Badge,
    List,
    Spin,
    notification,
    message
} from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    BellOutlined
} from "@ant-design/icons";
import {
    useContext,
    useEffect,
    useState
} from "react";
import {
    AuthContext
} from "../context/AuthContext";
import {
    logoutAPI
} from "../../services/auth.service";
import {
    useNavigate
} from "react-router-dom";
import appLogo from '../../assets/appLogo.png'
import {
    getNotificationsByUserId,
    updateNotification
} from "../../services/notification.service";
import '../../styles/manager/ManagerHeader.css';

const { Header } = Layout
const { Text } = Typography

const PageHeader = () => {
    const { user, setUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        let intervalId;

        // Poll notifications every 5 second
        const pollNotifications = async () => {
            try {
                const res = await getNotificationsByUserId(user.id);
                const latest = res.data.map(n => ({
                    ...n,
                    isRead: n.read,
                }));

                const hasNew = latest.some(
                    (n) => !notifications.some((old) => old.id === n.id)
                );

                if (hasNew) {
                    setNotifications(latest);
                }
            } catch (error) {
                message.error("Lỗi khi tải thông báo:", error);
            }
        };

        if (user?.id) {
            intervalId = setInterval(pollNotifications, 5000);
        }

        return () => clearInterval(intervalId);
    }, [user?.id, notifications]);

    const loadNotifications = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await getNotificationsByUserId(user.id);
            setNotifications((res.data || []).map(n => ({
                ...n,
                isRead: n.read
            })));
        } finally {
            setLoading(false);
        }
    };

    const handlePopoverOpenChange = (open) => {
        setPopoverOpen(open);
        if (open) loadNotifications();
    };

    // Change notification display when it's clicked
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await updateNotification(notification.id, { ...notification, isRead: true });
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                )
            );
            loadNotifications()
        }
    };

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

            notification.success({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Đăng xuất thành công'
            });
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
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Header
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colorBgContainer,
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                width: '100%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: '80px'
            }}>
            <div>
                <img
                    src={appLogo}
                    alt="Logo"
                    className="app-logo"
                    onClick={handleLogoClick}
                />
            </div>
            <div className="header-right" style={{ cursor: 'pointer' }}>
                <Popover
                    content={
                        <Spin spinning={loading}>
                            <List
                                dataSource={[...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                                locale={{ emptyText: "Không có thông báo" }}
                                renderItem={item => (
                                    <List.Item
                                        style={{
                                            background: item.isRead ? "#fff" : "#e6f7ff",
                                            fontWeight: item.isRead ? "normal" : "bold",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => handleNotificationClick(item)}
                                    >
                                        <div>
                                            <span>{item.title}</span>
                                            <div style={{ fontSize: 12, color: "#888" }}>{item.message}</div>
                                            <div style={{ fontSize: 10, color: "#aaa" }}>{item.createdAt}</div>
                                        </div>
                                    </List.Item>
                                )}
                                style={{ width: 320, maxHeight: 400, overflow: "auto" }}
                            />
                        </Spin>
                    }
                    trigger="click"
                    open={popoverOpen}
                    onOpenChange={handlePopoverOpenChange}
                    placement="bottomRight"
                >
                    <Badge count={unreadCount}>
                        <BellOutlined style={{ fontSize: 22, marginRight: 16, cursor: "pointer" }} />
                    </Badge>
                </Popover>
                {/* Existing user info and logout button */}
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