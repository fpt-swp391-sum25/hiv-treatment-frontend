import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../components/context/auth.context"
import { fetchAllPatientScheduleAPI, fetchUserInfoAPI } from "../../services/api.service"
import { Layout, message, Spin, Table, Button, Popconfirm, Segmented, Card, Descriptions, Form, Input, Row, Col, Select, DatePicker } from "antd"


const { Content } = Layout;

const ProfileDetail = () => {

    const { user } = useContext(AuthContext)
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(false);
    const [activeSegment, setActiveSegment] = useState('Thông tin cá nhân');
    const [editMode, setEditMode] = useState(false)
    const [userInfo, setUserInfo] = useState({})

    const [form] = Form.useForm()


    const typeMapping = {
        APPOINTMENT: 'Đặt khám',
        FOLLOW_UP: 'Tái khám',
        CONSULTATION: 'Tư vấn',
    };

    const statusMapping = {
        PENDING: 'Chờ thanh toán',
        PENDING_PAYMENT_CONFIRMED: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        AVAILABLE: 'Hủy',
        FAILED: 'Thanh toán thất bại',
    };

    useEffect(() => {
        loadAllSchedule()
        loadUserInfo()
    }, [])

    const initializeForm = (data) => {
        console.log('Initializing form with:', data);
        form.setFieldsValue({
            fullName: data?.fullName || '',
            address: data?.address || '',
            phoneNumber: data?.phoneNumber || '',
            email: data?.email || '',
            gender: data?.gender || '',
            dateOfBirth: data?.dateOfBirth ? moment(data.dateOfBirth, 'YYYY-MM-DD') : null,
        });
    };

    const loadUserInfo = async () => {
        const response = await fetchUserInfoAPI(user.id)
        if (response.data) {
            setUserInfo(response.data)
        }
    }

    const loadAllSchedule = async () => {
        setLoading(true)
        try {
            if (!user?.id) {
                throw new Error('Không tìm thấy thông tin bệnh nhân');
            }
            const response = await fetchAllPatientScheduleAPI(user.id);
            setSchedule(response.data.map(item => ({
                ...item,
                doctorName: item.doctor?.fullName || 'Không xác định',
                type: item.type || null,
                status: item.status || null,
            })));
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải lịch hẹn');
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = () => {
        if (user) {
            initializeForm(user);
        } else {
            console.warn('No patientInfo available for form initialization');
            form.resetFields();
        }
        setEditMode(true);
        console.log('Edit mode enabled, form values:', form.getFieldsValue());
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        form.setFieldsValue({
            fullName: user?.fullName,
            phone: user?.phone,
            email: user?.email,
        });
    };

    const handleSave = async () => {
        try {
            await form.validateFields();
            setLoading(true);
            const values = form.getFieldsValue();
            const updatedUser = await apiService.updateUser(user.id, values);
            setPatientInfo(updatedUser);
            setEditMode(false);
            message.success('Cập nhật thông tin thành công');
        } catch (error) {
            if (error.response?.status !== 401) {
                message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSchedule = (scheduleId) => {

    };

    const columns = [
        {
            title: 'Tên bác sĩ',
            dataIndex: 'doctorName',
            key: 'doctorName',
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date) => date,
        },
        {
            title: 'Khung giờ',
            dataIndex: 'slot',
            key: 'slot',
        },
        {
            title: 'Loại lịch hẹn',
            dataIndex: 'type',
            key: 'type',
            render: (type) => typeMapping[type] || type,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => statusMapping[status] || status,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                ['PENDING', 'PENDING_PAYMENT_CONFIRMED', 'Đang hoạt động'].includes(record.status) ? (
                    <Popconfirm
                        title="Hủy lịch hẹn"
                        description="Bạn có chắc muốn hủy lịch hẹn này?"
                        onConfirm={() => { }}
                        okText="Có"
                        cancelText="Không"
                        placement="left"
                    >
                        <Button
                            type="primary"
                            onClick={() => handleCancelSchedule(record.id)}
                            disabled={loading}
                            danger
                        >
                            Hủy
                        </Button>
                    </Popconfirm>
                ) : null
            ),
        },

    ];
    const [userType, setUserType] = useState('detail')

    return (
        <Layout>
            <Content style={{ minHeight: "500px", padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Segmented
                        options={['Thông tin cá nhân', 'Lịch hẹn']}
                        value={activeSegment}
                        onChange={setActiveSegment}
                        style={{ marginBottom: '20px' }}
                    />
                </div>
                <h2>Lịch hẹn của bạn</h2>
                {loading ? (
                    <Spin tip="Đang tải..." />
                ) : (
                    <Card>
                        {activeSegment === 'Thông tin cá nhân' ? (
                            user ? (
                                <Form form={form} layout="vertical" style={{ padding: '20px' }}>
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Họ và tên"
                                                name="fullName"
                                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                            >
                                                {editMode ? (
                                                    <Input size="large" />
                                                ) : (
                                                    <span>{userInfo.fullName || 'N/A'}</span>
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Địa chỉ"
                                                name="address"
                                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                                            >
                                                {editMode ? (
                                                    <Input size="large" />
                                                ) : (
                                                    <span>{userInfo.address || 'N/A'}</span>
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Số điện thoại"
                                                name="phoneNumber"
                                                rules={[{ pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }]}
                                            >
                                                {editMode ? (
                                                    <Input size="large" />
                                                ) : (
                                                    <span>{userInfo.phoneNumber || 'N/A'}</span>
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                                            >
                                                {editMode ? (
                                                    <Input size="large" />
                                                ) : (
                                                    <span>{userInfo.email || 'N/A'}</span>
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Giới tính"
                                                name="gender"
                                                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                                            >
                                                {editMode ? (
                                                    <Select size="large">
                                                        <Option value="MALE">Nam</Option>
                                                        <Option value="FEMALE">Nữ</Option>
                                                    </Select>
                                                ) : (
                                                    <span>{userInfo.gender === 'MALE' ? 'Nam' : userInfo.gender === 'FEMALE' ? 'Nữ' : 'N/A'}</span>
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Ngày sinh"
                                                name="dateOfBirth"
                                                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                                            >
                                                {editMode ? (
                                                    <DatePicker size="large" format="YYYY-MM-DD" style={{ width: '100%' }} />
                                                ) : (
                                                    <span>{userInfo.dateOfBirth || 'N/A'}</span>
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Trạng thái tài khoản">
                                                <span>{userInfo.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'N/A'}</span>
                                            </Form.Item>
                                            <Form.Item label="Ngày tạo tài khoản">
                                                <span>{userInfo.createdAt || 'N/A'}</span>
                                            </Form.Item>
                                            <Form.Item label="Vai trò">
                                                <span>{userInfo.role === 'PATIENT' ? 'Bệnh nhân' : 'N/A'}</span>
                                            </Form.Item>
                                            <Form.Item label="Trạng thái xác minh">
                                                <span>{userInfo.verified ? 'Đã xác minh' : 'Chưa xác minh'}</span>
                                            </Form.Item>
                                            <Form.Item label="Mã bệnh nhân">
                                                <span>{userInfo.displayId || 'N/A'}</span>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Form.Item style={{ marginTop: '20px' }}>
                                        {editMode ? (
                                            <div>
                                                <Button
                                                    type="primary"
                                                    onClick={handleSave}
                                                    loading={loading}
                                                    size="large"
                                                    style={{ marginRight: '8px' }}
                                                >
                                                    Lưu
                                                </Button>
                                                <Button onClick={handleCancelEdit} size="large">
                                                    Hủy
                                                </Button>

                                            </div>

                                        ) : (
                                            <Button type="primary" onClick={handleEdit}>
                                                Chỉnh sửa
                                            </Button>
                                        )}
                                    </Form.Item>
                                </Form>
                            ) : (
                                <p>Không có thông tin bệnh nhân</p>
                            )
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={schedule}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                locale={{ emptyText: 'Chưa có lịch hẹn nào' }}
                            />
                        )}
                    </Card>



                )}
            </Content>
        </Layout>
    )
}

export default ProfileDetail