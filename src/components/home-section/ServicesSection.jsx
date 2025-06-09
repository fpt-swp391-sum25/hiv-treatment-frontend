import React from 'react';
import './ServicesSection.css'; // Đảm bảo bạn có file CSS để tùy chỉnh kiểu dáng

const ServicesSection = () => {
  const services = [
    {
      title: "Tư vấn chuyên sâu",
      description: "Cung cấp thông tin và hỗ trợ từ các chuyên gia hàng đầu về HIV.",
      icon: "🗣️",
    },
    {
      title: "Khám bệnh định kỳ",
      description: "Đảm bảo theo dõi và kiểm tra sức khỏe liên tục cho bệnh nhân.",
      icon: "🏥",
    },
    {
      title: "Hỗ trợ tâm lý",
      description: "Giúp người bệnh vượt qua áp lực và khó khăn về tâm lý.",
      icon: "💬",
    },
    {
      title: "Giáo dục sức khỏe",
      description: "Cung cấp kiến thức và thông tin giáo dục về HIV/AIDS.",
      icon: "📚",
    },
  ];

  return (
    <section className="services-section">
      <h2>Tại sao chọn dịch vụ của chúng tôi?</h2>
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
