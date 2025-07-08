import { Layout, Spin } from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import '../../styles/client/AppFooter.css';
import { useEffect, useState } from 'react';
import { fetchSystemConfigurationsAPI } from '../../services/api.service';

const { Footer } = Layout;

const AppFooter = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const res = await fetchSystemConfigurationsAPI();
        const configMap = {};
        (res.data || []).forEach(item => {
          configMap[item.name] = item.value;
        });
        setConfig(configMap);
      } catch (err) {
        console.error("Lỗi khi tải cấu hình:", err);
      } finally {
        setLoading(false);
      }
    };
    loadConfigs();
  }, []);

  if (loading) {
    return <Spin style={{ display: 'block', margin: '50px auto' }} />;
  }

  return (
    <Footer className="custom-footer">
      <div className="footer-content">
        <div className="footer-columns">
          <div className="footer-column">
            <h3>{config['Tên hệ thống'] || 'HIV Care Center'}</h3>
            <p>{config['Giới thiệu trang']}</p>
          </div>

          <div className="footer-column">
            <h4>Thông tin liên hệ</h4>
            <p><EnvironmentOutlined /> Địa chỉ: {config['Địa chỉ']}</p>
            <p><PhoneOutlined /> Đường dây nóng: {config['Đường dây nóng']}</p>
            <p><MailOutlined /> Email hỗ trợ: {config['Email hỗ trợ']}</p>
            <p><ClockCircleOutlined /> Thời gian làm việc: {config['Thời gian làm việc']}</p>
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
        <p>{config['Chân trang'] || '© 2025 HIV Care Center. Tất cả quyền được bảo lưu.'}</p>
      </div>
    </Footer>
  );
};

export default AppFooter;
