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
} from 'antd';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AuthContext } from '../../components/context/AuthContext';
import { updateUserAPI, fetchAccountAPI } from '../../services/api.service';

const { Title, Text } = Typography;
const { Option } = Select;

const LabTechnicianProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = React.useRef('');

  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (user?.id) {
      setEditableUser({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
      });
      setAvatarUrl(user.avatar || '');
    }
    console.log(user.avatar);
  }, [user]);


  const handleUpdate = async () => {
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

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;

      setAvatarUrl(base64String);
      setEditableUser((prev) => ({
        ...prev,
        avatar: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : undefined}
                icon={!avatarUrl || avatarUrl.trim() === '' ? <UserOutlined /> : null}
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
            <Title level={3}>{user?.fullName || user?.username || 'Lab Technician'}</Title>
            <div style={{ marginTop: 12 }}>
              <Text>
                <MailOutlined style={{ marginRight: 8 }} />
                {user?.email || 'Chưa cập nhật email'}
              </Text>
              <br />
              <Text>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {user?.phoneNumber || 'Chưa cập nhật sđt'}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        <Form layout="vertical" style={{ maxWidth: 500, margin: '0 auto' }}>
          <Form.Item label="Họ tên">
            <Input
              value={editableUser.fullName}
              onChange={(e) =>
                setEditableUser((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={editableUser.email}
              onChange={(e) =>
                setEditableUser((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Số điện thoại">
            <Input
              value={editableUser.phoneNumber}
              onChange={(e) =>
                setEditableUser((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Địa chỉ">
            <Input
              value={editableUser.address}
              onChange={(e) =>
                setEditableUser((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Giới tính">
            <Select
              value={editableUser.gender}
              onChange={(value) =>
                setEditableUser((prev) => ({ ...prev, gender: value }))
              }
              placeholder="Chọn giới tính"
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Ngày sinh">
            <DatePicker
              style={{ width: '100%' }}
              value={
                editableUser.dateOfBirth
                  ? dayjs(editableUser.dateOfBirth)
                  : ''
              }
              format="YYYY-MM-DD"
              onChange={(date) =>
                setEditableUser((prev) => ({
                  ...prev,
                  dateOfBirth: date ? date.toISOString() : '',
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Mật khẩu mới">
            <Input.Password
              value={editableUser.password}
              onChange={(e) =>
                setEditableUser((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới">
            <Input.Password
              value={editableUser.confirmPassword}
              onChange={(e) =>
                setEditableUser((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleUpdate} loading={loading}>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LabTechnicianProfile;
