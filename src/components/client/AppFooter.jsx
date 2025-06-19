import { Layout } from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import '../../styles/client/AppFooter.css';


const { Footer } = Layout;


const AppFooter = () => {
     return (
    <Footer className="custom-footer">
      <div className="footer-content">
        <div className="footer-columns">
          <div className="footer-column">
            <h3> HIV Care Center</h3>
            <p>
              Trung tâm cung cấp dịch vụ khám, tư vấn và điều trị HIV bằng các phương pháp phù hợp, hiện đại. Chúng tôi cam kết đồng hành cùng người bệnh trong quá trình chăm sóc sức khỏe, đảm bảo môi trường thân thiện, riêng tư và tôn trọng.
            </p>
          </div>

          <div className="footer-column">
            <h4>Thông tin liên hệ</h4>
            <p><EnvironmentOutlined /> 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, HCM</p>
            <p><PhoneOutlined /> Hotline: 1900-1234</p>
            <p><MailOutlined /> info@hivcare.vn</p>
            <p><ClockCircleOutlined /> Thứ 2 - Thứ 7: 8:00–16:30</p>
          </div>

          <div className="footer-column">
            <h4>Liên kết nhanh</h4>
            <p><a href="#">Chính sách bảo mật</a></p>
            <p><a href="#">Điều khoản sử dụng</a></p>
            <p><a href="#">Quy định website</a></p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 HIV Care Center. Tất cả quyền được bảo lưu.</p>
      </div>
    </Footer>
    );
};


export default AppFooter;