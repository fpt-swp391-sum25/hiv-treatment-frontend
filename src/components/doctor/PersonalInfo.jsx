import React from 'react';
import { Card } from 'react-bootstrap';
import '../../styles/doctor/PersonalInfo.css';

const PersonalInfo = ({ doctorData }) => {
  if (!doctorData) return null;

  return (
    <div className="personal-info-container">
      <div className="info-section">
        <h5 className="section-title">Thông tin cá nhân</h5>
        <div className="info-content">
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

      <div className="info-section">
        <h5 className="section-title">Trình độ chuyên môn</h5>
        <div className="info-content">
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
              {doctorData.certificates.map((cert, index) => (
                <span key={index} className="certificate-item">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h5 className="section-title">Giới thiệu</h5>
        <div className="info-content">
          <p className="bio-text">{doctorData.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo; 