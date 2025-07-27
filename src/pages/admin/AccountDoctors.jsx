import {
    useEffect,
    useState
} from 'react';
import {
    Button,
    Input,
    Modal,
    notification,
    Space,
    Spin,
    Table,
    Tag
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import UpdateUserModal from '../../components/admin/UpdateUserModal';
import {
    createAccountAPI,
    deleteAccountAPI,
    fetchAccountByRoleAPI
} from '../../services/user.service';

const AccountDoctors = () => {
    const [data, setData] = useState([])
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("DOCTOR")
    const [dataUpdate, setDataUpdate] = useState({})
    const [loading, setLoading] = useState(false)
    const [isOpenModal, setIsOpenModal] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

    useEffect(() => {
        loadAccounts()
    }, [])

    const loadAccounts = async () => {
        setLoading(true)
        try {
            const response = await fetchAccountByRoleAPI(role)
            setData(response.data)
        } catch (error) {
            notification.error({
                message: 'Hệ thống',
                description: error?.message || 'Lỗi khi tải dữ liệu',
            })
        }
        setLoading(false)
    }

    const handleCreate = async () => {
        setLoading(true)
        try {
            const response = await createAccountAPI(username, password, email, role)
            if (response.data) {
                notification.success({
                    message: 'Hệ thống',
                    description: 'Tạo tài khoản thành công',
                });
                resetAndClose();
                await loadAccounts();
            }
            resetAndClose()
            await loadAccounts()
            setLoading(false)
        } catch (error) {
            notification.error({
                message: 'Hệ thống',
                description: error?.message || 'Lỗi khi tạo tài khoản',
            })
        }
        setLoading(false)
    }

    const showDeleteModal = (record) => {
        Modal.confirm({
            title: "Xoá người dùng",
            content: (
                <div>
                    <div style={{ marginBottom: 12, color: "#888" }}>
                        Bạn có chắc muốn xoá tài khoản sau?
                    </div>
                    <div>
                        <p><b>Tên đăng nhập:</b> {record.username}</p>
                        <p><b>Email:</b> {record.email}</p>
                    </div>
                </div>
            ),
            okText: "Có",
            cancelText: "Không",
            okButtonProps: { loading: loading },
            onOk: () => handleDelete(record.id),
        })
    }

    const handleDelete = async (id) => {
        setLoading(true)
        try {
            const response = await deleteAccountAPI(id)
            if (response.data) {
                notification.success({
                    message: 'Hệ thống',
                    description: 'Xoá tài khoản thành công',
                })
                await loadAccounts()
            } else {
                notification.error({
                    message: 'Hệ thống',
                    description: 'Xoá tài khoản thất bại',
                })
            }
        } catch (error) {
            notification.error({
                message: 'Hệ thống',
                description: error?.message || 'Lỗi khi xoá tài khoản',
            })
        }
        setLoading(false)
    }

    const resetAndClose = () => {
        setIsOpenModal(false)
        setUsername("")
        setEmail("")
        setPassword("")
        setRole("DOCTOR")
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
                let color = accountStatus === 'Đang hoạt động' ? 'green' : 'volcano'
                return (
                    <Tag color={color} key={accountStatus}>
                        {accountStatus}
                    </Tag>
                )
            },
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="large">
                    <EditOutlined
                        onClick={() => {
                            setIsUpdateModalOpen(true)
                            setDataUpdate(record)
                        }}
                        style={{ color: 'orange' }}
                    />

                    <DeleteOutlined
                        style={{ color: 'red' }}
                        onClick={() => showDeleteModal(record)}
                    />
                </Space>
            ),
        },
    ]

    return (
        <>
            {loading ? <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            }}>
                < Spin />
            </div>
                :
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
                        <h2>Tài khoản bác sĩ</h2>
                        <Button onClick={() => setIsOpenModal(true)} type='primary'>
                            <PlusCircleOutlined />Tạo mới
                        </Button>
                    </div>
                    <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
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
                        confirmLoading={loading}
                        okButtonProps={{ disabled: loading }}
                        cancelButtonProps={{ disabled: loading }}
                    >
                        <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                            <div>
                                <span>Tên đăng nhập</span>
                                <Input
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <span>Email</span>
                                <Input
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <span>Mật khẩu</span>
                                <Input.Password
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </Modal>
                </>
            }
        </>
    )
}
export default AccountDoctors
