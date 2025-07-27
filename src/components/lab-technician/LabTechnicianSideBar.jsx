import React from 'react'
import { 
  UnorderedListOutlined, 
  UserOutlined 
} from '@ant-design/icons'
import {
  Layout, 
  Menu 
} from 'antd'
import { 
  Link, 
  useLocation 
} from 'react-router-dom'

const { Sider } = Layout
const icons = [UnorderedListOutlined, UserOutlined];
const labels = ['Danh sách bệnh nhân', 'Hồ sơ cá nhân'];
const paths = ['/lab-technician', '/lab-technician/profile'];
const items = icons.map((icon, index) => ({
  key: paths[index],
  icon: React.createElement(icon),
  label: <Link to={paths[index]}>{labels[index]}</Link>,
}))

const LabTechnicianSideBar = () => {
  const location = useLocation();
  return (
    <Sider
      width={13 + 'vw'}
      breakpoint="md"
      collapsedWidth="60"
      style={{ background: 'white' }}
    >
      <Menu
        theme="light"
        mode="inline"
        items={items}
        selectedKeys={[
          paths
            .slice()
            .sort((a, b) => b.length - a.length)
            .find(p => location.pathname.startsWith(p)) || paths[0]
        ]}
        style={{ minHeight: '100vh' }}
      />
    </Sider>
  )
}
export default LabTechnicianSideBar