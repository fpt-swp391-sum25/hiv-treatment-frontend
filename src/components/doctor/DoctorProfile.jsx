import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Tab } from 'react-bootstrap';
import '../../styles/doctor/DoctorProfile.css';

// Components
import PersonalInfo from './PersonalInfo';
import Schedule from './Schedule';
import Feedback from './Feedback';
import Statistics from './Statistics';

// Assets
import appLogo from '../../assets/appLogo.png';
import doctorProfileImage from '../../assets/doctorProfile.png';

// Data giả tạm thời
const mockDoctorData = {
  id: 1,
  name: 'Bs. Trần Tấn Phát',
  specialty: 'Chuyên khoa HIV/AIDS',
  email: 'doctor@fpt.edu.vn',
  phoneNumber: '0987654321',
  degree: 'Tiến sĩ Y khoa',
  experience: 10,
  certificates: ['Chứng chỉ hành nghề bác sĩ', ' Chuyên khoa HIV/AIDS'],
  bio: 'Là bác sĩ với hơn 10 năm kinh nghiệm trong lĩnh vực điều trị HIV/AIDS. Chuyên môn sâu về quản lý và điều trị các bệnh liên quan đến HIV.',
  imageUrl: doctorProfileImage
};

const DoctorData = {
  id: 1,
  name: 'Bs. Trần Tấn Phát',
  specialty: 'Chuyên khoa HIV/AIDS',
  email: 'doctor@fpt.edu.vn',
  phoneNumber: '0987654321',
  degree: 'Tiến sĩ Y khoa',
  experience: 10,
  certificates: ['Chứng chỉ hành nghề bác sĩ', ' Chuyên khoa HIV/AIDS'],
  bio: 'Là bác sĩ với hơn 10 năm kinh nghiệm trong lĩnh vực điều trị HIV/AIDS. Chuyên môn sâu về quản lý và điều trị các bệnh liên quan đến HIV.',
  imageUrl: doctorProfileImage
};


const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Fetch doctor profile data
    const fetchDoctorProfile = async () => {
      try {
        // Giả lập API call
        setTimeout(() => {
          setDoctorData(mockDoctorData);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to fetch doctor profile');
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    </div>
  );

  return (
    <div className="doctor-profile-container">
      <img src={appLogo} alt="App Logo" className="app-logo" />
      <div className="profile-content">
        <Card className="profile-card">
          <div className="profile-header">
            <div className="profile-image-section">
              <img 
                src={doctorData?.imageUrl} 
                alt="Doctor profile" 
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';
                }}
              />
            </div>
            <div className="profile-basic-info">
              <h2 className="doctor-name">{doctorData?.name}</h2>
              <p className="doctor-specialty">{doctorData?.specialty}</p>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>{doctorData?.email}</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>{doctorData?.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultActiveKey="personal-info" className="profile-tabs">
            <Tab eventKey="personal-info" title="Thông tin cá nhân">
              <PersonalInfo doctorData={doctorData} />
            </Tab>
            <Tab eventKey="schedule" title="Lịch làm việc">
              <Schedule doctorId={doctorData?.id} />
            </Tab>
            <Tab eventKey="feedback" title="Đánh giá">
              <Feedback doctorId={doctorData?.id} />
            </Tab>
            <Tab eventKey="statistics" title="Thống kê">
              <Statistics doctorId={doctorData?.id} />
            </Tab>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default DoctorProfile; 