import React from 'react';
import { Card } from 'react-bootstrap';
import '../../styles/doctor/PersonalInfo.css';

const PersonalInfo = ({ doctorData }) => {
  if (!doctorData) return null;

  return (
    <div className="personal-info-container">
      {/* Qualifications Card */}
      <Card className="info-card">
        <Card.Body>
          <h3 className="card-title">Trình độ chuyên môn</h3>
          <div className="qualification-details">
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
              <div className="info-value certificates-list">
                {doctorData.certificates.map((cert, index) => (
                  <div key={index} className="certificate-item">• {cert}</div>
                ))}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Introduction Card */}
      <Card className="info-card">
        <Card.Body>
          <h3 className="card-title">Giới thiệu</h3>
          <p className="introduction-text">{doctorData.bio}</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonalInfo;