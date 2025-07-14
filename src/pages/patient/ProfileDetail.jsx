import React, { useContext, useState, useRef } from "react";
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
import { AuthContext } from "../../components/context/AuthContext";
import { DeleteOutlined, SaveOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { updateProfileAPI } from "../../services/api.service";

const { Content } = Layout;

const ProfileDetail = () => {
    const { user, setUser } = useContext(AuthContext);
    const [avatarUrl, setAvatarUrl] = useState(user.avatar);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handlePatientInputChange = (field, value) => {
        try {
            setLoading(true);
            const updatedPatientInfo = { ...user, [field]: value };
            setUser(updatedPatientInfo);
        } catch (error) {
            console.error("Update patient error:", error.response || error);
            if (error.response?.status !== 401) {
                message.error(
                    error.response?.data?.message || "Lỗi khi cập nhật thông tin cá nhân"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        const dataUpdate = {
            ...user, password: newPassword
        }
        const response = await updateProfileAPI(dataUpdate);
        setNewPassword('')
        setConfirmPassword('')
        if (response.data) {
            notification.success({
                message: "Hệ thống",
                showProgress: true,
                pauseOnHover: true,
                description: "Cập nhật thành công",
            });
        }
        setLoading(false);
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;

            setAvatarUrl(base64String);
            setUser((prev) => ({
                ...prev,
                avatar: base64String,
            }));
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
                            {/* Avatar + Chọn/Xoá ảnh */}
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
                                            icon={<DeleteOutlined />}
                                            danger
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
                            </Col>

                            {/* Form thông tin cá nhân */}
                            <Col xs={24} md={18}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label
                                            style={{ display: "block", margin: 8, fontWeight: 500 }}
                                        >
                                            Họ và tên
                                        </label>
                                        <Input
                                            value={user.fullName || ""}
                                            onChange={(e) => handlePatientInputChange("fullName", e.target.value)}
                                            size="large"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label
                                            style={{ display: "block", margin: 8, fontWeight: 500 }}
                                        >
                                            Email
                                        </label>
                                        <Input
                                            value={user.email || ""}
                                            onChange={(e) => handlePatientInputChange("email", e.target.value)}
                                            size="large"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label
                                            style={{ display: "block", margin: 8, fontWeight: 500 }}
                                        >
                                            Số điện thoại
                                        </label>
                                        <Input
                                            value={user.phoneNumber || ""}
                                            onChange={(e) => handlePatientInputChange("phoneNumber", e.target.value)}
                                            size="large"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label
                                            style={{ display: "block", margin: 8, fontWeight: 500 }}
                                        >
                                            Địa chỉ
                                        </label>
                                        <Input
                                            value={user.address || ""}
                                            onChange={(e) => handlePatientInputChange("address", e.target.value)}
                                            size="large"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label
                                            style={{ display: "block", margin: 8, fontWeight: 500 }}
                                        >
                                            Giới tính
                                        </label>
                                        <Select
                                            value={user.gender || ""}
                                            onChange={(value) => handlePatientInputChange("gender", value)}
                                            size="large"
                                            style={{ width: "100%" }}
                                        >
                                            <Select.Option value="MALE">Nam</Select.Option>
                                            <Select.Option value="FEMALE">Nữ</Select.Option>
                                        </Select>
                                    </Col>
                                    <Col span={12}>
                                        <label
                                            style={{ display: "block", margin: 8, fontWeight: 500 }}
                                        >
                                            Ngày sinh
                                        </label>
                                        <DatePicker
                                            value={user.dateOfBirth ? dayjs(user.dateOfBirth) : null}
                                            format="DD-MM-YYYY"
                                            onChange={(date) => handlePatientInputChange("dateOfBirth", date)}
                                            size="large"
                                            style={{ width: "100%" }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label style={{ display: "block", margin: 8, fontWeight: 500 }}>
                                            Mật khẩu mới
                                        </label>
                                        <Input.Password
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            size="large"
                                            placeholder="Để trống nếu không đổi"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label style={{ display: "block", margin: 8, fontWeight: 500 }}>
                                            Xác nhận mật khẩu
                                        </label>
                                        <Input.Password
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setConfirmPassword(value);
                                                if (newPassword && value !== newPassword) {
                                                    setConfirmPasswordError('Mật khẩu xác nhận không khớp');
                                                } else {
                                                    setConfirmPasswordError('');
                                                }
                                            }}
                                            size="large"
                                            placeholder="Nhập lại mật khẩu"
                                        />
                                        {confirmPasswordError && newPassword && (
                                            <div style={{ color: 'red', marginTop: 4 }}>{confirmPasswordError}</div>
                                        )}
                                    </Col>
                                </Row>

                                <hr style={{ margin: "24px 0" }} />

                                {/* Thông tin hệ thống */}
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
                                </div>
                            </Col>
                        </Row>
                    </Card>
                )}
            </Content>
        </Layout>
    );
};

export default ProfileDetail;
