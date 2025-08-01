import {
  Layout,
  message,
  Spin
} from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import '../../styles/client/AppFooter.css';
import {
  useEffect,
  useState
} from 'react';
import {
  fetchSystemConfigurationsAPI
} from '../../services/systemConfiguration.service';

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
        message.error("Lỗi khi tải cấu hình:", err);
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
            <h3>{config['Tên hệ thống'] ?? 'Chưa cập nhật'} </h3>
            (Phiên bản {config['Phiên bản'] ?? 'Chưa cập nhật'})
            <p>{config['Giới thiệu trang'] ?? 'Chưa cập nhật'}</p>
          </div>

          <div className="footer-column">
            <h4>Thông tin liên hệ</h4>
            <p><EnvironmentOutlined /> Địa chỉ: {config['Địa chỉ'] ?? 'Chưa cập nhật'} </p>
            <p><PhoneOutlined /> Đường dây nóng: {config['Đường dây nóng'] ?? 'Chưa cập nhật'}</p>
            <p><MailOutlined /> Email hỗ trợ: {config['Email hỗ trợ'] ?? 'Chưa cập nhật'}</p>
            <p><ClockCircleOutlined /> Thời gian làm việc: {config['Thời gian làm việc'] ?? 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{config['Chân trang'] ?? 'Chưa cập nhật'}</p>
      </div>
    </Footer>
  );
};
export default AppFooter;
