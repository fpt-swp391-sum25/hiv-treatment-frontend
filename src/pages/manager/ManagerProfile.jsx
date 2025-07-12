import React, { useState, useContext, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Form,
  Input,
  Button,
  message,
  Select,
  DatePicker,
  Spin,
  Tag,
  Space,
} from 'antd';
import { MailOutlined, PhoneOutlined, UserOutlined, CrownOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AuthContext } from '../../components/context/AuthContext';
import { updateUserAPI, fetchAccountAPI } from '../../services/api.service';

const { Title, Text } = Typography;
const { Option } = Select;

const ManagerProfile = () => {
  const { user, setUser, isAppLoading } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = React.useRef('');

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [editableUser, setEditableUser] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    avatar: '',
  });

  // Fetch user data if not available
  const fetchUserData = async () => {
    try {
      setDataLoading(true);
      const response = await fetchAccountAPI();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin người dùng!');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    // If user data is not available, fetch it
    if (!user?.id && !isAppLoading) {
      fetchUserData();
    } else if (user?.id) {
      setEditableUser({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
      });
      setAvatarUrl(user.avatar || '');
      setDataLoading(false);
    }
  }, [user, isAppLoading]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        setAvatarUrl(base64String);
        setEditableUser((prev) => ({
          ...prev,
          avatar: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (editableUser.password && editableUser.password !== editableUser.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...editableUser,
        dateOfBirth: editableUser.dateOfBirth
          ? dayjs(editableUser.dateOfBirth).format('YYYY-MM-DD')
          : '',
      };

      const res = await updateUserAPI(user.id, payload);

      if (res.data) {
        const updatedUserRes = await fetchAccountAPI();
        if (updatedUserRes.data) {
          setUser(updatedUserRes.data);
          if (updatedUserRes.data.avatar) {
            setAvatarUrl(updatedUserRes.data.avatar);
          }
        }
        message.success('Cập nhật thông tin thành công!');
      } else {
        message.error('Cập nhật không thành công!');
      }
    } catch (error) {
      message.error('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user?.id) {
      setEditableUser({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        password: '',
        confirmPassword: '',
      });
      setAvatarUrl(user.avatar || '');
    }
  };

  // Show loading spinner while data is being fetched
  if (isAppLoading || dataLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Show error if no user data
  if (!user?.id) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column'
      }}>
        <Title level={4}>Không thể tải thông tin người dùng</Title>
        <Button type="primary" onClick={fetchUserData}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Card with Gradient */}
      <Card
        style={{
          marginBottom: 24,
          background: '#089BAB80',
          border: 'none',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Avatar
                  src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : undefined}
                  icon={!avatarUrl || avatarUrl.trim() === '' ? <UserOutlined /> : null}
                  size={120}
                  style={{
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => fileInputRef.current.click()}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <EditOutlined style={{ color: '#089BAB', fontSize: '14px' }} />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              {avatarUrl && (
                <Button
                  type="text"
                  style={{
                    marginTop: 12,
                    color: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '4px 16px',
                    fontSize: '12px'
                  }}
                  onClick={() => {
                    setAvatarUrl('');
                    setEditableUser((prev) => ({
                      ...prev,
                      avatar: '',
                    }));
                  }}
                >
                  Xóa ảnh
                </Button>
              )}
            </div>
          </Col>

          <Col xs={24} sm={18}>
            <div style={{ color: 'white' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space align="center">
                  <Title level={2} style={{ color: 'white', margin: 0 }}>
                    {user?.fullName || user?.username || 'Manager'}
                  </Title>
                  <Tag
                    icon={<CrownOutlined />}
                    color="gold"
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      border: 'none'
                    }}
                  >
                    Quản lý
                  </Tag>
                </Space>

                <div style={{ marginTop: 16 }}>
                  <Space direction="vertical" size="small">
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                      <MailOutlined style={{ marginRight: 8 }} />
                      {user?.email || 'Chưa cập nhật email'}
                    </Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      {user?.phoneNumber || 'Chưa cập nhật số điện thoại'}
                    </Text>
                  </Space>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Form Card with Better Styling */}
      <Card
        title={
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#2c3e50',
            borderBottom: '2px solid #089BAB',
            paddingBottom: '8px',
            marginBottom: '8px'
          }}>
            Thông tin cá nhân
          </div>
        }
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e8e8e8'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Form layout="vertical" style={{ maxWidth: 600, margin: '0 auto' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Họ tên</span>}>
                <Input
                  value={editableUser.fullName}
                  onChange={(e) =>
                    setEditableUser((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  style={{
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px'
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Email</span>}>
                <Input
                  value={editableUser.email}
                  onChange={(e) =>
                    setEditableUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  style={{
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Số điện thoại</span>}>
                <Input
                  value={editableUser.phoneNumber}
                  onChange={(e) =>
                    setEditableUser((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  style={{
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px'
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Giới tính</span>}>
                <Select
                  value={editableUser.gender}
                  onChange={(value) =>
                    setEditableUser((prev) => ({ ...prev, gender: value }))
                  }
                  style={{
                    borderRadius: '8px',
                  }}
                >
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Ngày sinh</span>}>
                <DatePicker
                  value={editableUser.dateOfBirth ? dayjs(editableUser.dateOfBirth) : null}
                  onChange={(date) =>
                    setEditableUser((prev) => ({
                      ...prev,
                      dateOfBirth: date ? date.format('YYYY-MM-DD') : '',
                    }))
                  }
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Địa chỉ</span>}>
                <Input
                  value={editableUser.address}
                  onChange={(e) =>
                    setEditableUser((prev) => ({ ...prev, address: e.target.value }))
                  }
                  style={{
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{
            borderTop: '1px solid #e8e8e8',
            paddingTop: '24px',
            marginTop: '24px'
          }}>
            <Title level={5} style={{ color: '#2c3e50', marginBottom: '16px' }}>
              Thay đổi mật khẩu
            </Title>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Mật khẩu mới</span>}>
                  <Input.Password
                    value={editableUser.password}
                    onChange={(e) =>
                      setEditableUser((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Để trống nếu không đổi"
                    style={{
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px'
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: '500', color: '#2c3e50' }}>Xác nhận mật khẩu</span>}>
                  <Input.Password
                    value={editableUser.confirmPassword}
                    onChange={(e) =>
                      setEditableUser((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    style={{
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '14px'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSave}
                style={{
                  padding: '10px 32px',
                  height: 'auto',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Lưu thay đổi
              </Button>
              <Button
                type='primary'
                onClick={handleCancel}
                style={{
                  borderRadius: '8px',
                  padding: '10px 32px',
                  height: 'auto',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                danger
              >
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ManagerProfile;
