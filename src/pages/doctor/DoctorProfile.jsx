import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Tab } from 'react-bootstrap';
import './DoctorProfile.css';

// Components
import PersonalInfo from '../../components/doctor/PersonalInfo';
import Schedule from '../../components/doctor/Schedule';
import Feedback from '../../components/doctor/Feedback';
import Statistics from '../../components/doctor/Statistics';

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Fetch doctor profile data
    const fetchDoctorProfile = async () => {
      try {
        const response = await fetch('/api/doctor-profile/doctor-id/1'); // Replace 1 with actual doctor ID
        const data = await response.json();
        setDoctorData(data);
        setLoading(false);
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