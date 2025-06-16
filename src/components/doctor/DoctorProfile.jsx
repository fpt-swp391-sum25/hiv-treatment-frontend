import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, Row, Col, Tabs, Tab, Spinner } from 'react-bootstrap';
import '../../styles/doctor/DoctorProfile.css';

// Assets
import appLogo from '../../assets/appLogo.png';
import doctorProfileImage from '../../assets/doctorProfile.png';

// Lazy loading components
const PersonalInfo = lazy(() => import('./PersonalInfo'));
const Schedule = lazy(() => import('./Schedule'));
const Statistics = lazy(() => import('./Statistics'));

// Loading Skeleton component
const TabContentSkeleton = () => (
  <div className="skeleton-container">
    <div className="skeleton-row"></div>
    <div className="skeleton-row"></div>
    <div className="skeleton-row"></div>
    <div className="skeleton-row"></div>
    <div className="skeleton-row"></div>
  </div>
);

// Mock data
const mockDoctorData = {
  id: 1,
  name: 'Bs. Trần Tấn Phát',
  specialty: 'Chuyên khoa HIV/AIDS',
  email: 'doctor@fpt.edu.vn',
  phoneNumber: '0987654323',
  degree: 'Tiến sĩ Y khoa',
  experience: 10,
  certificates: ['Chứng chỉ hành nghề bác sĩ', ' Chuyên khoa HIV/AIDS'],
  bio: 'Là bác sĩ với hơn 10 năm kinh nghiệm trong lĩnh vực điều trị HIV/AIDS. Chuyên môn sâu về quản lý và điều trị các bệnh liên quan đến HIV.',
  imageUrl: doctorProfileImage
};



const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(mockDoctorData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal-info');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-container">
      <img src={appLogo} alt="App Logo" className="app-logo" />
      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-header">
            <div className="profile-image-section">
              <img
                src={doctorData?.imageUrl}
                alt={doctorData?.name}
                className="profile-image"
              />
            </div>
            <div className="profile-basic-info">
              <h1 className="doctor-name">{doctorData?.name}</h1>
              <div className="doctor-specialty">{doctorData?.specialty}</div>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  {doctorData?.email}
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  {doctorData?.phoneNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-tabs">
            <Tabs
              activeKey={activeTab}
              onSelect={handleTabChange}
              className="mb-3"
            >
              <Tab eventKey="personal-info" title="Thông tin cá nhân">
                <Suspense fallback={<TabContentSkeleton />}>
                  <PersonalInfo doctorData={doctorData} />
                </Suspense>
              </Tab>
              {/* <Tab eventKey="schedule" title="Lịch làm việc">
                <Suspense fallback={<TabContentSkeleton />}>
                  <Schedule />
                </Suspense>
              </Tab> */}
              <Tab eventKey="statistics" title="Thống kê">
                <Suspense fallback={<TabContentSkeleton />}>
                  <Statistics />
                </Suspense>
              </Tab>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorProfile;