import '../../styles/home-section/CareIntroSection.css';
import { Link } from 'react-router-dom';

function CareIntroSection() {
  return (<section className="care-intro-section" id="care-section">
    <div className="care-grid">
      {/* Cột trái */}
      <div className="care-left">
        <h1>
          Chăm sóc và điều trị <span className="highlight-hiv">HIV</span> an toàn, hiệu quả
        </h1>
        <p className="description">
          Đội ngũ bác sĩ chuyên khoa hàng đầu, công nghệ y tế tiên tiến và phương pháp điều trị theo tiêu chuẩn quốc tế.
          Chúng tôi cam kết mang đến sự chăm sóc tận tâm và bảo mật tuyệt đối.
        </p>

        <div className="feature-grid">
          <div className="feature-card blue">
            <h4>Bảo mật tuyệt đối</h4>
            <p>Thông tin được mã hóa an toàn</p>
          </div>
          <div className="feature-card green">
            <h4>Hỗ trợ 24/7</h4>
            <p>Luôn sẵn sàng chăm sóc bạn</p>
          </div>
          <div className="feature-card purple">
            <h4>Chuyên môn cao</h4>
            <p>Bác sĩ được đào tạo quốc tế</p>
          </div>
          <div className="feature-card orange">
            <h4>Công nghệ tiên tiến</h4>
            <p>Thiết bị y tế hiện đại</p>
          </div>
        </div>
        <Link to="/booking" onClick={() => window.scrollTo(0, 0)}><button className="booking-btn">
          Đặt lịch khám ngay
        </button>
        </Link>

      </div>

      {/* Cột phải */}
      <div className="care-right">
        <div className="service-box">
          <div className="service-header">
            💚 Dịch vụ chăm sóc toàn diện
          </div>
          <ul className="service-list">
            <li>
              <strong>📅 Đặt lịch trực tuyến</strong>
              <p>Hệ thống đặt lịch thông minh 24/7, dễ dàng chọn bác sĩ và thời gian phù hợp.</p>
            </li>
            <li>
              <strong>🧾 Nhận kết quả nhanh chóng, tiện lợi</strong>
              <p>Tối ưu thời gian và thuận tiện trong việc tiếp cận kết quả khám và xét nghiệm.</p>
            </li>
            <li>
              <strong>📈 Theo dõi điều trị</strong>
              <p>Giám sát toàn diện quá trình chữa trị với báo cáo cập nhật liên tục.</p>
            </li>
            <li>
              <strong>📚 Hỗ trợ giáo dục sức khỏe</strong>
              <p>Cung cấp tài liệu, hội thảo nâng cao nhận thức về HIV và sức khỏe.</p>
            </li>
          </ul>
          <Link to="/register" onClick={() => window.scrollTo(0, 0)}><button className="register-btn">Đăng ký tài khoản miễn phí</button></Link>

        </div>
      </div>
    </div>
  </section>
  );
}

export default CareIntroSection;
