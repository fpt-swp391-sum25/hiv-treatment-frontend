import { BarChartOutlined, TeamOutlined } from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { NavLink, useLocation } from "react-router-dom";

const { Sider } = Layout


const items = [
    {
        key: '1',
        label: <NavLink to='/admin'>Tổng quan</NavLink>,
        icon: <BarChartOutlined />,
        path: '/admin'
    },
    {
        key: '2',
        label: 'Quản lí người dùng',
        icon: <TeamOutlined />,
        children: [
            {
                key: '3',
                label: <NavLink to='/admin/managers'>Quản lí</NavLink>,
                path: '/admin/managers'
            },
            {
                key: '4',
                label: <NavLink to='/admin/doctors'>Bác sĩ</NavLink>,
                path: '/admin/doctors'
            },
            {
                key: '5',
                label: <NavLink to='/admin/staff'>Nhân viên</NavLink>,
                path: '/admin/staff'
            },
            {
                key: '6',
                label: <NavLink to='/admin/users'>Bệnh nhân</NavLink>,
                path: '/admin/users'

            },
        ],
    },

];

const AdminSidebar = () => {

    const location = useLocation();

    const findActiveMenu = () => {
        const activeItem = items.find(item =>
            location.pathname === item.path
        );
        if (activeItem) return activeItem.key;
        for (const item of items) {
            if (item.children) {
                const activeChild = item.children.find(child =>
                    location.pathname === child.path ||
                    (child.path && location.pathname.startsWith(child.path))
                );
                if (activeChild) return activeChild.key;
            }
        }
        return '';
    };

    const selectedKeys = findActiveMenu();


    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Sider width={250} style={{ background: colorBgContainer, padding: '10px' }}>
            <Menu
                mode="inline"
                selectedKeys={selectedKeys}
                style={{ height: '100%', borderRight: 0 }}
                items={items}
            />
        </Sider>
    )
}

export default AdminSidebar