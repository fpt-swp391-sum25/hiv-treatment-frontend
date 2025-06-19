import React from 'react';
import '../../styles/home-section/ServicesSection.css'; // Đảm bảo bạn có file CSS để tùy chỉnh kiểu dáng

const ServicesSection = () => {
  const services = [
    {
      title: "Tư Đội ngũ chuyên gia ",
      description: "Bác sĩ được đào tạo quốc tế, giàu kinh nghiệm và tận tâm.",
      icon: "👨‍⚕️",
    },
    {
      title: "Tư vấn chuyên sâu",
      description: "Cung cấp thông tin và hỗ trợ từ các chuyên gia hàng đầu về HIV.",
      icon: "🗣️",
    },
    {
      title: " Khám và xét nghiệm",
      description: "Trang thiết bị hiện đại, kết quả nhanh chóng, chính xác.",
      icon: "🏥",
    },
   
  ];
  return (
    <section className="services-section" id="why-services-section">
      <h1>Tại sao chọn dịch vụ của chúng tôi?</h1>
      <div className="services-container">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
