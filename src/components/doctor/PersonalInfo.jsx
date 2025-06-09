import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import './PersonalInfo.css';

const PersonalInfo = ({ doctorData }) => {
  if (!doctorData) return null;

  return (
    <div className="personal-info-container">
      <Row>
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <h4 className="section-title">Thông tin cá nhân</h4>
              <div className="info-item">
                <span className="info-label">Họ và tên:</span>
                <span className="info-value">{doctorData.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chuyên khoa:</span>
                <span className="info-value">{doctorData.specialty}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{doctorData.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Số điện thoại:</span>
                <span className="info-value">{doctorData.phoneNumber}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <h4 className="section-title">Thông tin chuyên môn</h4>
              <div className="info-item">
                <span className="info-label">Bằng cấp:</span>
                <span className="info-value">{doctorData.degree}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Kinh nghiệm:</span>
                <span className="info-value">{doctorData.experience} năm</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chứng chỉ:</span>
                <div className="certificates-list">
                  {doctorData.certificates?.map((cert, index) => (
                    <div key={index} className="certificate-item">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={12}>
          <Card className="info-card">
            <Card.Body>
              <h4 className="section-title">Giới thiệu</h4>
              <p className="bio-text">{doctorData.bio}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PersonalInfo; 