import React, { useState, Suspense } from 'react';
import { Card, Row, Col, Tabs, Skeleton, Avatar, Typography } from 'antd';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import DoctorPersonalProfile from '../../components/doctor/DoctorPersonalProfile';
import DoctorStatistic from '../../components/doctor/DoctorStatistic';
import doctorProfileImage from '../../assets/doctorProfile.png';
import { useOutletContext } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TabContentSkeleton = () => (
  <Skeleton active paragraph={{ rows: 6 }} />
);

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState('personal-info');

  const { user } = useOutletContext();

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar
              src={user?.avatar || doctorProfileImage}
              size={120}
              style={{ border: '2px solid #1890ff' }}
            />
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
                  <DoctorPersonalProfile/>
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
