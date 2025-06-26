import React from 'react';
import { UserOutlined, ScheduleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Layout, Menu, theme, Typography } from 'antd';
import { Link, Outlet } from 'react-router-dom';


const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const icons = [ScheduleOutlined, UnorderedListOutlined, UnorderedListOutlined, UserOutlined];
const labels = ['Lịch làm việc', 'Danh sách bệnh nhân', 'Danh sách phác đồ', 'Hồ sơ cá nhân']
const paths = ['/doctor/schedule', '/doctor/patients', '/doctor/regimens', '/doctor/profile'];
const items = icons.map(
  (icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: <Link to={paths[index]}>{labels[index]}</Link>,
  }),
);


const DoctorPageSideBar = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Sider
      width={13 + 'vw'}
      breakpoint="md"
      collapsedWidth="60"
      style={{ background: "white" }}
    >
      <Menu theme="light" mode="inline" defaultSelectedKeys={['4']} items={items}
        selectedKeys={[location.pathname]} style={{ minHeight: '100vh' }} />
    </Sider>
  );
};
export default DoctorPageSideBar;