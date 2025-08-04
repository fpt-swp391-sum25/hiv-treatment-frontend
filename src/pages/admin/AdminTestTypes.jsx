import {
  useEffect,
  useState
} from "react"
import {
  Card,
  Table,
  Button,
  Spin,
  notification,
  Popconfirm,
  Space,
  Modal,
  Form,
  Input,
  InputNumber
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import {
  fetchTestTypesAPI,
  createTestTypeAPI,
  updateTestTypeAPI,
  deleteTestTypeAPI,
  checkTestTypeDeletableAPI
} from "../../services/testtype.service";
import "../../styles/admin/AdminDashboard.css";

const AdminTestTypes = () => {
  const [testTypes, setTestTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTestType, setEditingTestType] = useState(null)
  const [form] = Form.useForm()

  const loadTestTypes = async () => {
    setLoading(true)
    try {
      const res = await fetchTestTypesAPI()
      setTestTypes(res.data || [])
    } catch {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách loại xét nghiệm.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTestTypes()
  }, [])



  const showCreateModal = () => {
    setEditingTestType(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (record) => {
    setEditingTestType(record)
    form.setFieldsValue({
      testTypeName: record.testTypeName,
      testTypePrice: record.testTypePrice
    })
    setIsModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      if (editingTestType) {
        // Update existing test type
        await updateTestTypeAPI(editingTestType.id, values)
        notification.success({
          message: "Cập nhật thành công",
          description: "Loại xét nghiệm đã được cập nhật.",
        })
      } else {
        // Create new test type
        await createTestTypeAPI(values)
        notification.success({
          message: "Tạo thành công",
          description: "Loại xét nghiệm mới đã được tạo.",
        })
      }

      setIsModalVisible(false)
      form.resetFields()
      loadTestTypes()
    } catch (error) {
      console.error('Form validation failed:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const result = await checkTestTypeDeletableAPI(id);
      // Kiểm tra nếu result có chứa thông báo lỗi về constraint violation
      if (result.data.message.includes('TEST TYPE ALREADY IN USED')) {
        notification.error({
          message: "Không thể xóa",
          description: "Không thể xóa loại xét nghiệm vì đang được sử dụng.",
        })
        return // Dừng lại, không thực hiện xóa
      }

      await deleteTestTypeAPI(id)
      notification.success({
        message: "Xóa thành công",
        description: "Loại xét nghiệm đã được xóa.",
      })
      loadTestTypes()
    } catch (error) {
      // Nếu deleteTestTypeAPI trả về lỗi 400, có nghĩa là test type đang được sử dụng
      if (error.response?.status === 400) {
        notification.error({
          message: "Không thể xóa",
          description: "Không thể xóa loại xét nghiệm vì đang được sử dụng.",
        })
        return // Dừng lại, không thực hiện xóa
      }

      // Các lỗi khác
      notification.error({
        message: "Lỗi xóa",
        description: "Có lỗi khi xóa loại xét nghiệm.",
      })
    }
  }

  const columns = [
    {
      title: "Tên loại xét nghiệm",
      dataIndex: "testTypeName",
      key: "testTypeName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "testTypePrice",
      key: "testTypePrice",
      render: (text) => (
        <span>
          {text ? text.toLocaleString('vi-VN') : 0} VNĐ
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa loại xét nghiệm"
            description="Bạn có chắc chắn muốn xóa loại xét nghiệm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", margin: "100px auto" }}
      />
    )
  }

  return (
    <>
      <Card
        title="Quản lý loại xét nghiệm"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Thêm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={testTypes}
          rowKey="id"
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      <Modal
        title={editingTestType ? "Sửa loại xét nghiệm" : "Thêm loại xét nghiệm mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        okText={editingTestType ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="testTypeName"
            label="Tên loại xét nghiệm"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại xét nghiệm" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự" }
            ]}
          >
            <Input placeholder="Nhập tên loại xét nghiệm" />
          </Form.Item>

          <Form.Item
            name="testTypePrice"
            label="Giá (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              { type: "number", min: 0, message: "Giá phải lớn hơn 0" }
            ]}
          >
            <InputNumber
              placeholder="Nhập giá"
              addonAfter="VNĐ"
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default AdminTestTypes 