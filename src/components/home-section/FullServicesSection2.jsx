import { 
    Link 
} from 'react-router-dom';
import '../../styles/home-section/FullServicesSection2.css';

const FullServicesSection2 = () => {
    return (<div className="container" id="services-section">
        <div className="header">
            <h1>Dịch vụ chăm sóc HIV toàn diện</h1>
            <p>Chúng tôi cung cấp đầy đủ các dịch vụ tư vấn, điều trị đến chăm sóc tâm lý cho người nhiễm HIV và người có nguy cơ cao với tiêu chuẩn quốc tế.</p>
        </div>
        <div className="card-container">
            <div className="card">
                <h3>Đặt lịch khám</h3>
                <p>Lên lịch khám với bác sĩ chuyên khoa HIV nhanh chóng và tiện lợi qua nền tảng trực tuyến.</p>
                <div className="in-card">
                    <ul>
                        <li>Hỗ trợ 24/7, mọi lúc mọi nơi</li>
                        <li>Xác nhận tự thi</li>
                        <li>Nhắc lịch tự động</li>
                    </ul>
                    <Link
                        to="/booking?type=Khám"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                        <button className="button">Sử dụng dịch vụ &rarr;</button>
                    </Link>
                </div>
            </div>
            <div className="card">
                <h3>Đặt lịch tái khám</h3>
                <p>Duy trì hiệu quả điều trị HIV với lộ trình khoa học, giám sát chặt chẽ theo chuẩn quốc tế.</p>
                <div className="in-card">
                    <ul>
                        <li>Phác đồ điều trị tối ưu</li>
                        <li>Theo dõi tiến trình điều trị</li>
                        <li>Tư vấn chuyên môn định kỳ</li>
                    </ul>
                    <Link
                        to="/booking?type=Tái khám"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                        <button className="button">Sử dụng dịch vụ &rarr;</button>
                    </Link>
                </div>
            </div>
            <div className="card">
                <h3>Đặt lịch tư vấn</h3>
                <p>Tư vấn sức khỏe cá nhân hóa, giải đáp thắc mắc và hỗ trợ điều trị HIV từ chuyên gia.</p>
                <div className="in-card">
                    <ul>
                        <li>Lộ trình điều trị phù hợp từng cá nhân</li>
                        <li>Tư vấn dinh dưỡng & tâm lý</li>
                        <li>Đồng hành lâu dài trong điều trị</li>
                    </ul>
                    <Link
                        to="/booking?type=Tư vấn"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                        <button className="button">Sử dụng dịch vụ &rarr;</button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
    );
};
export default FullServicesSection2;
