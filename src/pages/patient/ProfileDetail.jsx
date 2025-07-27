import {
    useContext,
    useState,
    useRef
} from "react";
import {
    Layout,
    message,
    Card,
    Row,
    Col,
    Avatar,
    Button,
    Input,
    Select,
    DatePicker,
    Popconfirm,
    Descriptions,
    notification,
    Spin,
} from "antd";
import dayjs from "dayjs";
import {
    AuthContext
} from "../../components/context/AuthContext";
import {
    DeleteOutlined,
    SaveOutlined,
    UploadOutlined,
    UserOutlined
} from "@ant-design/icons";
import {
    validateField
} from "../../utils/validate";
import {
    updateProfileAPI
} from "../../services/user.service";

const { Content } = Layout;

const ProfileDetail = () => {
    const { user, setUser } = useContext(AuthContext);
    const [avatarUrl, setAvatarUrl] = useState(user.avatar);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        const updatedUser = { ...user, [field]: value };
        setUser(updatedUser);
        const error = validateField(field, value, newPassword);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleUpdateProfile = async () => {
        const fieldsToValidate = ["fullName", "email", "phoneNumber", "address", "gender", "dateOfBirth"];
        const newErrors = {};
        fieldsToValidate.forEach(field => {
            const value = field === "dateOfBirth" ? user.dateOfBirth : user[field];
            const error = validateField(field, value, newPassword);
            if (error) newErrors[field] = error;
        });

        if (newPassword && newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

        }
        if (Object.keys(newErrors).length > 0) {
            return setErrors(newErrors);
        }

        setLoading(true);
        const response = await updateProfileAPI({
            ...user,
            password: newPassword || undefined
        });

        if (response.data) {
            notification.success({
                message: "Hệ thống",
                description: "Cập nhật thành công",
            });
            setNewPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            const base64 = e.target.result;
            setAvatarUrl(base64);
            setUser(prev => ({ ...prev, avatar: base64 }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <Layout>
            <Content style={{ padding: 24, minHeight: "500px" }}>
                {loading ? (
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <Spin tip="Đang tải..." />
                    </div>
                ) : (
                    <Card
                        title="Thông tin cá nhân"
                        bordered={false}
                        style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    >
                        <Row gutter={32}>
                            <Col xs={24} md={6} style={{ textAlign: "center" }}>
                                <Avatar
                                    size={128}
                                    src={avatarUrl || null}
                                    icon={!avatarUrl && <UserOutlined />}
                                    style={{ border: "2px solid #089BAB", margin: 16, cursor: "pointer" }}
                                    onClick={() => fileInputRef.current.click()}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    style={{ display: "none" }}
                                />
                                <div>
                                    <Button
                                        type="primary"
                                        onClick={() => fileInputRef.current.click()}
                                        icon={<UploadOutlined />}
                                    >
                                        Chọn ảnh
                                    </Button>
                                    {avatarUrl && (
                                        <Button
                                            className="custom-delete-btn"
                                            icon={<DeleteOutlined />}
                                            type="link"
                                            onClick={() => {
                                                setAvatarUrl("");
                                                setUser((prev) => ({ ...prev, avatar: "" }));
                                            }}
                                        >
                                            Xoá ảnh
                                        </Button>
                                    )}
                                </div>
                            </Col >

                            <Col xs={24} md={18}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>Họ và tên</label>
                                        <Input
                                            value={user.fullName || ""}
                                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                                            size="large"
                                            status={errors.fullName ? "error" : ""}
                                        />
                                        {errors.fullName && <div style={{ color: 'red' }}>{errors.fullName}</div>}
                                    </Col>

                                    <Col span={12}>
                                        <label>Email</label>
                                        <Input
                                            value={user.email || ""}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            size="large"
                                            status={errors.email ? "error" : ""}
                                        />
                                        {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
                                    </Col>

                                    <Col span={12}>
                                        <label>Số điện thoại</label>
                                        <Input
                                            value={user.phoneNumber || ""}
                                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                            size="large"
                                            status={errors.phoneNumber ? "error" : ""}
                                        />
                                        {errors.phoneNumber && <div style={{ color: 'red' }}>{errors.phoneNumber}</div>}
                                    </Col>

                                    <Col span={12}>
                                        <label>Địa chỉ</label>
                                        <Input
                                            value={user.address || ""}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                            size="large"
                                            status={errors.address ? "error" : ""}
                                        />
                                        {errors.address && <div style={{ color: 'red' }}>{errors.address}</div>}
                                    </Col>

                                    <Col span={12}>
                                        <label>Giới tính</label>
                                        <Select
                                            value={user.gender || ""}
                                            onChange={(value) => handleInputChange("gender", value)}
                                            size="large"
                                            style={{ width: "100%" }}
                                            status={errors.gender ? "error" : ""}
                                        >
                                            <Option value="Nam">Nam</Option>
                                            <Option value="Nữ">Nữ</Option>
                                            <Option value="Khác">Khác</Option>
                                        </Select>
                                        {errors.gender && <div style={{ color: 'red' }}>{errors.gender}</div>}
                                    </Col>

                                    <Col span={12}>
                                        <label>Ngày sinh</label>
                                        <DatePicker
                                            value={user.dateOfBirth ? dayjs(user.dateOfBirth) : null}
                                            onChange={(date) => handleInputChange("dateOfBirth", date)}
                                            format="DD-MM-YYYY"
                                            size="large"
                                            style={{ width: "100%" }}
                                            status={errors.dateOfBirth ? "error" : ""}
                                        />
                                        {errors.dateOfBirth && <div style={{ color: 'red' }}>{errors.dateOfBirth}</div>}
                                    </Col>

                                    <Col span={12}>
                                        <label>Mật khẩu mới</label>
                                        <Input.Password
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setErrors(prev => ({
                                                    ...prev,
                                                    confirmPassword: validateField("confirmPassword", confirmPassword, e.target.value)
                                                }));
                                            }}
                                            size="large"
                                            placeholder="Để trống nếu không đổi"
                                        />
                                    </Col>

                                    <Col span={12}>
                                        <label>Xác nhận mật khẩu</label>
                                        <Input.Password
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setConfirmPassword(val);
                                                setErrors(prev => ({
                                                    ...prev,
                                                    confirmPassword: validateField("confirmPassword", val, newPassword)
                                                }));
                                            }}
                                            size="large"
                                            placeholder="Nhập lại mật khẩu"
                                            status={errors.confirmPassword ? "error" : ""}
                                        />
                                        {errors.confirmPassword && (
                                            <div style={{ color: 'red' }}>{errors.confirmPassword}</div>
                                        )}
                                    </Col>
                                </Row>

                                <hr style={{ margin: "24px 0" }} />

                                <Descriptions
                                    title=""
                                    column={1}
                                    size="small"
                                    layout="vertical"
                                >
                                    <Descriptions.Item label="Mã bệnh nhân">
                                        {user.displayId || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo tài khoản">
                                        {dayjs(user.createdAt).format('DD-MM-YYYY') || "N/A"}
                                    </Descriptions.Item>

                                </Descriptions>

                                <div style={{ textAlign: "right", marginTop: 24 }}>
                                    <Popconfirm
                                        title="Cập nhật thông tin?"
                                        onConfirm={handleUpdateProfile}
                                        okText="Có"
                                        cancelText="Không"
                                        placement="left"
                                    >
                                        <Button
                                            type="primary"
                                            loading={loading}
                                            icon={<SaveOutlined />}
                                        >
                                            Lưu thay đổi
                                        </Button>
                                    </Popconfirm>
                                </div >
                            </Col >
                        </Row >
                    </Card >
                )}
            </Content >
        </Layout >
    );
};
export default ProfileDetail;
