import React, { useState, Suspense, useContext, useRef } from 'react';
import { Card, Row, Col, Tabs, Skeleton, Avatar, Typography, Tooltip } from 'antd';
import { MailOutlined, PhoneOutlined, CameraOutlined } from '@ant-design/icons';
import DoctorPersonalProfile from '../../components/doctor/DoctorPersonalProfile';
import DoctorStatistic from '../../components/doctor/DoctorStatistic';
import doctorProfileImage from '../../assets/doctor.png';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../../components/context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TabContentSkeleton = () => (
  <Skeleton active paragraph={{ rows: 6 }} />
);

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState('personal-info');
  const { user, setUser } = useContext(AuthContext);
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef(null);

  // Đổi avatar
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      setUser({ ...user, avatar: base64String });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Tooltip title="Bấm vào để đổi ảnh đại diện">
              <div
                style={{ display: 'inline-block', position: 'relative' }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                <Avatar
                  src={user?.avatar || doctorProfileImage}
                  size={120}
                  style={{ border: '2px solid #1890ff', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => fileInputRef.current.click()}
                />
                {hover && (
                  <CameraOutlined
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      fontSize: 28,
                      color: '#1890ff',
                      background: '#fff',
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px #0002',
                      padding: 4,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>
            </Tooltip>
          </Col>
          <Col xs={24} sm={18}>
            <Title level={3}>{user?.fullName || 'Tên bác sĩ'}</Title>
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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            {
              key: 'personal-info',
              label: 'Thông tin cá nhân',
              children: (
                <Suspense fallback={<TabContentSkeleton />}>
                  <DoctorPersonalProfile />
                </Suspense>
              )
            },
            {
              key: 'statistics',
              label: 'Thống kê',
              children: (
                <Suspense fallback={<TabContentSkeleton />}>
                  <DoctorStatistic />
                </Suspense>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default DoctorProfile;
