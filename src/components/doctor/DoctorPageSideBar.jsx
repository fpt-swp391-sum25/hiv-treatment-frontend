import React from 'react';
import { UserOutlined, ScheduleOutlined, UnorderedListOutlined, FileTextOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Sider } = Layout

const icons = [ScheduleOutlined, UnorderedListOutlined, UnorderedListOutlined, UserOutlined, FileTextOutlined];
const labels = ['Lịch làm việc', 'Danh sách bệnh nhân', 'Danh sách phác đồ', 'Hồ sơ cá nhân', 'Quản lý document'];
const paths = ['/doctor', '/doctor/patients', '/doctor/regimens', '/doctor/profile', '/doctor/documents'];

const items = icons.map(
  (icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: <Link to={paths[index]}>{labels[index]}</Link>,
  }),
)

const DoctorPageSideBar = () => {
  const location = useLocation()
  const getSelectedKey = () => {
    const sortedPaths = [...paths].sort((a, b) => b.length - a.length);
    const matchIndex = sortedPaths.findIndex(path => location.pathname.startsWith(path));
    if (matchIndex === -1) return ['1'];
    const realIndex = paths.findIndex(path => path === sortedPaths[matchIndex]);
    return [String(realIndex + 1)];
  }

  return (
    <Sider
      width={13 + 'vw'}
      breakpoint="md"
      collapsedWidth="60"
      style={{ background: "white" }}
    >
      <Menu theme="light" mode="inline" defaultSelectedKeys={['4']} items={items}
        selectedKeys={getSelectedKey()} style={{ minHeight: '100vh' }} />
    </Sider>
  )
}
export default DoctorPageSideBar