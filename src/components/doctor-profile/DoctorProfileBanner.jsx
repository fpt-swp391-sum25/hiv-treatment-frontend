import React from 'react';
import '../../styles/doctor-profile/DoctorProfileBanner.css';

const DoctorsBanner = () => {
  return (
    <div className="doctors-banner">
      <div className="doctors-banner-content">
        <h1 className="doctors-banner-title">
          Đội ngũ <span className="highlight">bác sĩ chuyên khoa</span>
        </h1>
        <p className="doctors-banner-subtitle">
          Các bác sĩ của chúng tôi đều là những chuyên gia hàng đầu trong lĩnh vực điều trị HIV với nhiều năm kinh nghiệm và được đào tạo bài bản quốc tế.
        </p>
      </div>
    </div>
  );
};

export default DoctorsBanner;
