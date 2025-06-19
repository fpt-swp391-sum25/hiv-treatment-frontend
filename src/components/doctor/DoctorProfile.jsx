import React, { useState, lazy, Suspense } from 'react';
import { Card, Row, Col, Nav } from 'react-bootstrap';
import '../../styles/doctor/DoctorProfile.css';

// Assets
import doctorProfileImage from '../../assets/doctorProfile.png';

// Lazy loading components
const PersonalInfo = lazy(() => import('./PersonalInfo'));
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

// Doctor data
const mockDoctorData = {
  id: 1,
  name: 'Bs. Trần Tấn Phát',
  specialty: 'Chuyên khoa HIV/AIDS',
  email: 'doctor@fpt.edu.vn',
  phoneNumber: '0987654323',
  degree: 'Tiến sĩ Y khoa',
  experience: 10,
  certificates: ['Chứng chỉ hành nghề bác sĩ', 'Chuyên khoa HIV/AIDS'],
  bio: 'Là bác sĩ với hơn 10 năm kinh nghiệm trong lĩnh vực điều trị HIV/AIDS. Chuyên môn sâu về quản lý và điều trị các bệnh liên quan đến HIV.',
  imageUrl: doctorProfileImage
};

const DoctorProfile = () => {
  const [doctorData] = useState(mockDoctorData);
  const [loading] = useState(false);
  const [error] = useState(null);
  const [activeTab, setActiveTab] = useState('personal-info');

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
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

      <div className="custom-tabs-container">
        <div className="custom-tabs">
          <div 
            className={`custom-tab ${activeTab === 'personal-info' ? 'active' : ''}`}
            onClick={() => handleTabChange('personal-info')}
          >
            Thông tin cá nhân
          </div>
          <div 
            className={`custom-tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => handleTabChange('statistics')}
          >
            Thống kê
          </div>
        </div>

        <div className="tab-content-area">
          {activeTab === 'personal-info' && (
            <Suspense fallback={<TabContentSkeleton />}>
              <PersonalInfo doctorData={doctorData} />
            </Suspense>
          )}
          
          {activeTab === 'statistics' && (
            <Suspense fallback={<TabContentSkeleton />}>
              <Statistics />
            </Suspense>
          )}
        </div>
      </div>
    </div> 
  );
};

export default DoctorProfile;
