import React from 'react';
import './FullServicesSection2.css';

const FullServicesSection2 = () => {
    return (        <div className="container" id="services-section">
            <div className="header">
                <h1>Dịch vụ chăm sóc HIV toàn diện</h1>
                <p>Chúng tôi cung cấp đầy đủ các dịch vụ tư vấn, điều trị đến chăm sóc tâm lý cho người nhiễm HIV và người có nguy cơ cao với tiêu chuẩn quốc tế.</p>
            </div>
            <div className="card-container">
                <div className="card">
                    <h3>Đặt lịch khám</h3>
                    <p>Đặt lịch khám với bác sĩ chuyên khoa HIV một cách dễ dàng và nhanh chóng qua hệ thống trực tuyến.</p>
                    <div className="in-card">
                    <ul>
                        <li>Đặt lịch 24/7</li>
                        <li>Xác nhận tự thi</li>
                        <li>Nhắc lịch tự động</li>
                    </ul>
                    <button className="button">Sử dụng dịch vụ &rarr;</button>
                    </div>
                </div>
                <div className="card">
                    <h3>Khám và điều trị</h3>
                    <p>Khám sức khỏe định kỳ và điều trị HIV với phác đồ cập nhật theo tiêu chuẩn quốc tế.</p>
                    <div className="in-card">
                    <ul>
                        <li>Phác đồ hiện đại</li>
                        <li>Theo dõi chặt chẽ</li>
                        <li>Tư vấn chuyên sâu</li>
                    </ul>
                    <button className="button">Sử dụng dịch vụ &rarr;</button>
                    </div>
                </div>
                <div className="card">
                    <h3>Xét nghiệm</h3>
                    <p>Xét nghiệm HIV và các chỉ số liên quan với công nghệ tiên tiến, kết quả chính xác.</p>
                    <div className="in-card">
                    <ul>
                        <li>Kết quả nhanh</li>
                        <li>Độ chính xác cao</li>
                        <li>Bảo mật tuyệt đối</li>
                    </ul>
                    <button className="button">Sử dụng dịch vụ &rarr;</button>
                    </div>
                </div>
                <div className="card">
                    <h3>Theo dõi điều trị</h3>
                    <p>Theo dõi quá trình điều trị và đánh giá hiệu quả của phác đồ một cách khoa học.</p>
                    <div className="in-card">
                    <ul>
                        <li>Báo cáo chi tiết</li>
                        <li>Đối tác trực quan</li>
                        <li>Cảnh báo thông minh</li>
                    </ul>
                    <button className="button">Sử dụng dịch vụ &rarr;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullServicesSection2;
