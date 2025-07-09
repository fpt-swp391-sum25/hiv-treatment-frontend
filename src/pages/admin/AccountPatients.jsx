import { useEffect, useState } from 'react';
import { Button, Input, Modal, notification, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { createAccountAPI, deleteAccountAPI, fetchAccountByRoleAPI } from '../../services/api.service';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import UpdateUserModal from '../../components/admin/UpdateUserModal';

const AccountPatients = () => {

    const [data, setData] = useState([])
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("PATIENT")
    const [dataUpdate, setDataUpdate] = useState({})

    const [isOpenModal, setIsOpenModal] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

    useEffect(() => {
        loadAccounts()
    }, [])

    const loadAccounts = async () => {
        try {
            const response = await fetchAccountByRoleAPI(role)
            const safeData = Array.isArray(response?.data) ? response.data : [];
            setData(safeData);
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
            setData([]); // Fallback to empty array
            notification.error({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: { error }
            });
        }

    }

    const handleCreate = async () => {
        const response = await createAccountAPI(username, password, email, role)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Tạo tài khoản thành công'
            })
        }
        resetAndClose()
        await loadAccounts()
    }

    const handleDelete = async (id) => {
        const response = await deleteAccountAPI(id)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Xóa tài khoản thành công'
            })
            await loadAccounts()
        } else {
            notification.error({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Xóa tài khoản thất bại'
            })
        }
    }

    const resetAndClose = () => {
        setIsOpenModal(false)
        setUsername("")
        setEmail("")
        setPassword("")
        setRole("PATIENT")
    }

    const columns = [
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (_, { email, verified }) => (
                <Space>
                    <span>{email}</span>
                    <Tag color={verified ? 'green' : 'volcano'} key={verified}>
                        {verified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'accountStatus',
            render: (_, { accountStatus }) => {

                let color = accountStatus === 'Đang hoạt động' ? 'green' : 'volcano';

                return (
                    <Tag color={color} key={accountStatus}>
                        {accountStatus}
                    </Tag>
                );

            },
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    <EditOutlined onClick={() => {
                        setIsUpdateModalOpen(true);
                        setDataUpdate(record)

                    }} style={{ color: 'orange' }} />
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn có chắc muốn xóa tài khoản này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                        placement="left"
                    >
                        <DeleteOutlined style={{ color: 'red' }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
                <h2>Tài khoản bệnh nhân</h2>
                <Button onClick={() => setIsOpenModal(true)} type='primary'>Tạo mới</Button>
            </div>
            <Table columns={columns} dataSource={data} rowKey={data.id} />
            <UpdateUserModal
                isUpdateModalOpen={isUpdateModalOpen}
                setIsUpdateModalOpen={setIsUpdateModalOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadAccounts={loadAccounts}
            />
            <Modal
                title="Tạo tài khoản"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isOpenModal}
                onOk={handleCreate}
                onCancel={resetAndClose}
                okText={"Tạo"}
                cancelText={"Hủy"}
            >
                <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                    <div>
                        <span>Tên đăng nhập</span>
                        <Input value={username} onChange={(event) => { setUsername(event.target.value) }} />
                    </div>
                    <div>
                        <span>Email</span>
                        <Input value={email} onChange={(event) => { setEmail(event.target.value) }} />
                    </div>
                    <div>
                        <span>Mật khẩu</span>
                        <Input.Password value={password} onChange={(event) => { setPassword(event.target.value) }} />
                    </div>

                </div>
            </Modal>

        </>
    )
}
export default AccountPatients;