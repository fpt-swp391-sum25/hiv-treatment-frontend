import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Space,
  Spin,
  Table,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import UpdateUserModal from '../../components/admin/UpdateUserModal';
import {
  createAccountAPI,
  deleteAccountAPI,
  fetchAccountByRoleAPI,
} from '../../services/user.service';

const { confirm } = Modal;

const AccountPatients = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [role] = useState('PATIENT');
  const [dataUpdate, setDataUpdate] = useState({});
  const [loading, setLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetchAccountByRoleAPI(role);
      setData(response.data);
    } catch (error) {
      notification.error({
        message: 'Hệ thống',
        description: error?.message || 'Lỗi khi tải dữ liệu',
      });
    }
    setLoading(false);
  };

  const handleCreate = async (values) => {
    confirm({
      title: 'Xác nhận tạo tài khoản?',
      icon: <ExclamationCircleFilled />,
      content: `Bạn có chắc chắn muốn tạo tài khoản mới với tên đăng nhập "${values.username}"?`,
      onOk: async () => {
        setLoading(true);
        try {
          const response = await createAccountAPI(
            values.username,
            values.password,
            values.email,
            role
          );
          if (response?.data) {
            notification.success({
              message: 'Thành công',
              description: 'Tạo tài khoản thành công',
            });
            setIsOpenModal(false);
            form.resetFields();
            await loadAccounts();
          } else {
            notification.error({
              message: 'Thất bại',
              description: 'Tạo tài khoản thất bại',
            });
          }
        } catch (error) {
          notification.error({
            message: 'Lỗi',
            description: error?.message || 'Không thể tạo tài khoản',
          });
        }
        setLoading(false);
      },
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await deleteAccountAPI(id);
      if (response?.data) {
        notification.success({
          message: 'Xoá thành công',
          description: 'Tài khoản đã bị xoá',
        });
        await loadAccounts();
      } else {
        notification.error({
          message: 'Thất bại',
          description: 'Không thể xoá tài khoản',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: error?.message || 'Không thể xoá tài khoản',
      });
    }
    setLoading(false);
  };

  const showDeleteModal = (record) => {
    confirm({
      title: 'Bạn có chắc muốn xoá tài khoản này?',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          <p><b>Tên đăng nhập:</b> {record.username}</p>
          <p><b>Email:</b> {record.email}</p>
        </>
      ),
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => handleDelete(record.id),
    });
  };

  const resetAndClose = () => {
    Modal.confirm({
      title: 'Huỷ tạo tài khoản?',
      content: 'Thông tin đã nhập sẽ bị xoá.',
      okText: 'Đồng ý',
      cancelText: 'Tiếp tục nhập',
      onOk: () => {
        form.resetFields();
        setIsOpenModal(false);
      },
    });
  };

  const columns = [
    {
      title: 'Tên đăng nhập',
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
          <Tag color={verified ? 'green' : 'volcano'}>
            {verified ? 'Đã xác minh' : 'Chưa xác minh'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      render: (status) => (
        <Tag color={status === 'Đang hoạt động' ? 'green' : 'volcano'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="large">
          <EditOutlined
            onClick={() => {
              setIsUpdateModalOpen(true);
              setDataUpdate(record);
            }}
            style={{ color: 'orange' }}
          />
          <DeleteOutlined
            onClick={() => showDeleteModal(record)}
            style={{ color: 'red' }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      {loading ? (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '15px',
            }}
          >
            <h2>Tài khoản bệnh nhân</h2>
            <Button onClick={() => setIsOpenModal(true)} type="primary">
              <PlusCircleOutlined /> Tạo mới
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />

          <UpdateUserModal
            isUpdateModalOpen={isUpdateModalOpen}
            setIsUpdateModalOpen={setIsUpdateModalOpen}
            dataUpdate={dataUpdate}
            setDataUpdate={setDataUpdate}
            loadAccounts={loadAccounts}
          />

          <Modal
            title="Tạo tài khoản bệnh nhân"
            open={isOpenModal}
            onCancel={resetAndClose}
            onOk={() => form.submit()}
            okText="Tạo"
            cancelText="Huỷ"
            confirmLoading={loading}
          >
            <Form form={form} layout="vertical" onFinish={handleCreate}>
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </>
  );
};

export default AccountPatients;
