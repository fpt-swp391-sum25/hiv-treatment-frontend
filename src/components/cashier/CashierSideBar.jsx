import React from 'react';
import {
  DollarOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  FileSearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const icons = [
  DollarOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  UserOutlined,
];

const labels = [
  'Thanh toán lịch khám',
  'Thanh toán xét nghiệm',
  'Tra cứu giao dịch',
  'Hồ sơ cá nhân',
];

const paths = [
  '/cashier',
  '/cashier/test-payment',
  '/cashier/transaction-lookup',
  '/cashier/profile',
];

const items = icons.map((icon, index) => ({
  key: String(index + 1),
  icon: React.createElement(icon),
  label: <Link to={paths[index]}>{labels[index]}</Link>,
}));

const CashierSideBar = () => {
  const location = useLocation();

  const getSelectedKey = () => {
    const sortedPaths = [...paths].sort((a, b) => b.length - a.length);
    const matchIndex = sortedPaths.findIndex(path =>
      location.pathname.startsWith(path)
    );
    if (matchIndex === -1) return ['1'];
    const realIndex = paths.findIndex(path => path === sortedPaths[matchIndex]);
    return [String(realIndex + 1)];
  };

  return (
    <Sider
      width="13vw"
      breakpoint="md"
      collapsedWidth="60"
      style={{ background: 'white' }}
    >
      <Menu
        theme="light"
        mode="inline"
        items={items}
        selectedKeys={getSelectedKey()}
        style={{ minHeight: '100vh' }}
      />
    </Sider>
  );
};

export default CashierSideBar;
