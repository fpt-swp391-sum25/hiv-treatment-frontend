import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import './PersonalInfo.css';

const PersonalInfo = ({ doctorData }) => {
  if (!doctorData) return null;

  return (
    <div className="personal-info-container">
      <Row>
        <Col md={6}>
          <div className="info-section">
            <h5 className="section-title">Thông tin cá nhân</h5>
            <div className="info-group">
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
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="info-section">
            <h5 className="section-title">Thông tin chuyên môn</h5>
            <div className="info-group">
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
                    <span key={index} className="certificate-badge">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <div className="bio-section">
        <h5 className="bio-title">Giới thiệu</h5>
        <p className="bio-text">{doctorData.bio}</p>
      </div>
    </div>
  );
};

export default PersonalInfo; 