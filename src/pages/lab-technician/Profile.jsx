import React, { useState } from 'react';
import { Card, Row, Col, Avatar, Typography, Form, Input, Button, message } from 'antd';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { AuthContext } from '../../components/context/AuthContext';

const { Title, Text } = Typography;

const LabTechnicianProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [editableUser, setEditableUser] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (editableUser.password && editableUser.password !== editableUser.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    // Giả lập cập nhật, thực tế nên gọi API
    setTimeout(() => {
      const updatedUser = { ...user, ...editableUser };
      delete updatedUser.password;
      delete updatedUser.confirmPassword;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      message.success('Cập nhật thông tin thành công!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar
              icon={<UserOutlined />}
              size={120}
              style={{ border: '2px solid #1890ff' }}
            />
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
              onChange={e => setEditableUser({ ...editableUser, fullName: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={editableUser.email}
              onChange={e => setEditableUser({ ...editableUser, email: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Số điện thoại">
            <Input
              value={editableUser.phoneNumber}
              onChange={e => setEditableUser({ ...editableUser, phoneNumber: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Địa chỉ">
            <Input
              value={editableUser.address}
              onChange={e => setEditableUser({ ...editableUser, address: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Mật khẩu mới">
            <Input.Password
              value={editableUser.password}
              onChange={e => setEditableUser({ ...editableUser, password: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới">
            <Input.Password
              value={editableUser.confirmPassword}
              onChange={e => setEditableUser({ ...editableUser, confirmPassword: e.target.value })}
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