import React, { useContext, useEffect, useState } from "react"

import { cancelBookingAPI, fetchAllPatientScheduleAPI, fetchHealthRecordByScheduleIdAPI, fetchUserInfoAPI, updateProfileAPI } from "../../services/api.service"
import { Layout, message, Spin, Table, Button, Popconfirm, Segmented, Card, Descriptions, Form, Input, Row, Col, Select, DatePicker, notification, Typography, Modal, Avatar } from "antd"
import dayjs from "dayjs";
import { AuthContext } from "../../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";



const { Content } = Layout;
const { Text } = Typography

const ProfileDetail = () => {

    const { user, setUser } = useContext(AuthContext)
    const [avatarUrl, setAvatarUrl] = useState(user.avatar);
    const fileInputRef = React.useRef('');
    const [loading, setLoading] = useState(false);



    const handlePatientInputChange = (field, value) => {
        try {
            setLoading(true);
            const updatedPatientInfo = { ...user, [field]: value };
            setUser(updatedPatientInfo);
        } catch (error) {
            console.error('Update patient error:', error.response || error);
            if (error.response?.status !== 401) {
                message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin cá nhân');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        // user = { ...user, avatarUrl }
        const response = await updateProfileAPI(user)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Cập nhật thành công'
            })
        }
    }

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;

            setAvatarUrl(base64String);
            setUser((prev) => ({
                ...prev, avatar: base64String
            }))
        };
        reader.readAsDataURL(file);
    };


    return (
        <Layout>
            <Content style={{ minHeight: "500px", padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                </div>
                {loading ? (
                    <div style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}>
                        <Spin tip="Đang tải..." />
                    </div>

                ) : (
                    <Card>

                        <Card
                            title="Thông tin cá nhân"
                            style={{ marginTop: '5vh', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        >
                            {user && Object.keys(user).length > 0 ? (
                                <div style={{ padding: '20px' }}>
                                    <Row gutter={16}>
                                        <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Avatar
                                                    src={user.avatar !== '' ? user.avatar : null}
                                                    icon={user.avatar === '' ? <UserOutlined /> : null}
                                                    size={120}
                                                    style={{ border: '2px solid #1890ff', cursor: 'pointer' }}
                                                    onClick={() => fileInputRef.current.click()}
                                                />
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={handleAvatarChange}
                                                />
                                                {avatarUrl && (
                                                    <Button
                                                        danger
                                                        type="link"
                                                        style={{ marginTop: 8 }}
                                                        onClick={() => {
                                                            setAvatarUrl('');
                                                            setUser((prev) => ({
                                                                ...prev, avatar: '',
                                                            }))
                                                        }}
                                                    >
                                                        Xóa ảnh
                                                    </Button>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>


                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Họ và tên</label>
                                                <Input
                                                    size="large"
                                                    value={user.fullName || ''}
                                                    onChange={(e) => handlePatientInputChange('fullName', e.target.value)}
                                                />
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Địa chỉ</label>
                                                <Input
                                                    size="large"
                                                    value={user.address || ''}
                                                    onChange={(e) => handlePatientInputChange('address', e.target.value)}
                                                />
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại</label>
                                                <Input
                                                    size="large"
                                                    value={user.phoneNumber || ''}
                                                    onChange={(e) => handlePatientInputChange('phoneNumber', e.target.value)}
                                                />
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                                                <Input
                                                    size="large"
                                                    value={user.email || ''}
                                                    onChange={(e) => handlePatientInputChange('email', e.target.value)}
                                                />
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Giới tính</label>
                                                <Select
                                                    size="large"
                                                    value={user.gender || ''}
                                                    onChange={(value) => handlePatientInputChange('gender', value)}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Option value="MALE">Nam</Option>
                                                    <Option value="FEMALE">Nữ</Option>
                                                </Select>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày sinh</label>
                                                <DatePicker
                                                    size="large"
                                                    defaultValue={user.dateOfBirth ? dayjs(user.dateOfBirth, 'YYYY-MM-DD') : null}
                                                    format="YYYY-MM-DD"
                                                    style={{ width: '100%' }}
                                                    onChange={(date) => handlePatientInputChange('dateOfBirth', date)}
                                                />
                                            </div>
                                        </Col>

                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày tạo tài khoản</label>
                                                <span>{user.createdAt || 'N/A'}</span>
                                            </div>
                                        </Col>


                                        <Col span={12}>
                                            <div style={{ marginBottom: '16px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã bệnh nhân</label>
                                                <span>{user.displayId || 'N/A'}</span>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div>
                                                <Popconfirm
                                                    title="Cập nhật"
                                                    description="Bạn có chắc muốn cập nhật thông tin?"
                                                    onConfirm={handleUpdateProfile}
                                                    okText="Có"
                                                    cancelText="Không"
                                                    placement="left"
                                                >
                                                    <Button type="primary" >Lưu</Button>
                                                </Popconfirm>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            ) : (
                                <p style={{ padding: '20px' }}>Không có thông tin bệnh nhân</p>
                            )}
                        </Card>
                    </Card>
                )}
            </Content>
        </Layout>
    )
}

export default ProfileDetail