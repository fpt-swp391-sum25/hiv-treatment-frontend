import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Tab } from 'react-bootstrap';
import './DoctorProfile.css';

// Components
import PersonalInfo from './PersonalInfo';
import Schedule from './Schedule';
import Feedback from './Feedback';
import Statistics from './Statistics';

// Data giả tạm thời
const mockDoctorData = {
  id: 1,
  name: 'Bs. Nguyễn Văn A',
  specialty: 'Chuyên khoa HIV/AIDS',
  email: 'doctor@example.com',
  phoneNumber: '0987654321',
  degree: 'Tiến sĩ Y khoa',
  experience: 10,
  certificates: ['Chứng chỉ hành nghề bác sĩ', 'Chuyên khoa HIV/AIDS'],
  bio: 'Là bác sĩ với hơn 10 năm kinh nghiệm trong lĩnh vực điều trị HIV/AIDS. Chuyên môn sâu về quản lý và điều trị các bệnh nhiễm trùng cơ hội liên quan đến HIV.',
  imageUrl: 'https://via.placeholder.com/150'
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="doctor-profile-container">
      <Card className="profile-card">
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="profile-image-section">
                <img 
                  src={doctorData?.imageUrl || '/default-doctor.png'} 
                  alt="Doctor profile" 
                  className="profile-image"
                />
                <h3 className="doctor-name">{doctorData?.name}</h3>
                <p className="doctor-specialty">{doctorData?.specialty}</p>
              </div>
            </Col>
            <Col md={9}>
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
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorProfile; 