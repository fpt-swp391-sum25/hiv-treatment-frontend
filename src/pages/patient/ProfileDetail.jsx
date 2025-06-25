import { useContext, useEffect, useState } from "react"

import { cancelBookingAPI, fetchAllPatientScheduleAPI, fetchHealthRecordByScheduleIdAPI, fetchUserInfoAPI, updateProfileAPI } from "../../services/api.service"
import { Layout, message, Spin, Table, Button, Popconfirm, Segmented, Card, Descriptions, Form, Input, Row, Col, Select, DatePicker, notification, Typography, Modal } from "antd"
import dayjs from "dayjs";
import { AuthContext } from "../../components/context/AuthContext";
import { useNavigate } from "react-router-dom";



const { Content } = Layout;
const { Text } = Typography

const ProfileDetail = () => {

    const { user } = useContext(AuthContext)
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(false);
    const [activeSegment, setActiveSegment] = useState('Thông tin cá nhân');
    const [userInfo, setUserInfo] = useState({})
    const navigate = useNavigate()
    const [monthFilter, setMonthFilter] = useState(null);
    const [healthRecordData, setHealthRecordData] = useState()


    const typeMapping = {
        APPOINTMENT: 'Đặt khám',
        FOLLOW_UP: 'Tái khám',
        CONSULTATION: 'Tư vấn',
    };

    const statusMapping = {
        PENDING: 'Chờ thanh toán',
        PENDING_PAYMENT_CONFIRMED: 'Đã thanh toán',
        CONFIRMED: 'Đã xác nhận',
        AVAILABLE: 'Hủy',
        FAILED: 'Thanh toán thất bại',
        'Đang hoạt động': 'Đã thanh toán',
    };

    useEffect(() => {
        loadAllSchedule()
        loadUserInfo()
    }, [])



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
            const sortedSchedules = response.data
                .map(item => ({
                    ...item,
                    doctorName: item.doctor?.fullName || 'Không xác định',
                    type: item.type || null,
                    status: item.status || null,
                }))
                .sort((a, b) => {
                    const dateA = dayjs(`${a.date} ${a.slot}`, 'YYYY-MM-DD HH:mm');
                    const dateB = dayjs(`${b.date} ${b.slot}`, 'YYYY-MM-DD HH:mm');
                    return dateB - dateA; // Mới nhất lên trên
                });
            setSchedule(sortedSchedules);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải lịch hẹn');
        } finally {
            setLoading(false);
        }
    }



    const handlePatientInputChange = async (field, value) => {
        try {
            setLoading(true);
            const updatedPatientInfo = { ...userInfo, [field]: value };
            setUserInfo(updatedPatientInfo);
        } catch (error) {
            console.error('Update patient error:', error.response || error);
            if (error.response?.status !== 401) {
                message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin cá nhân');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        const response = await updateProfileAPI(userInfo)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                description: 'Cập nhật thành công'
            })
        }
    }


    const handleMonthFilterChange = (date) => {
        setMonthFilter(date ? date.format('YYYY-MM') : null);
    };

    const filteredSchedules = monthFilter
        ? schedule.filter(s => dayjs(s.date).format('YYYY-MM') === monthFilter)
        : schedule;




    const handleCancelSchedule = async (scheduleId) => {
        setLoading(true)
        try {
            const response = await cancelBookingAPI(scheduleId, user.id)
            if (response.data) {
                notification.success({
                    message: 'Hệ thống',
                    description: 'Hủy lịch hẹn thành công'
                })
                loadAllSchedule()
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                notification.error({
                    message: 'Hệ thống',
                    description: error.message
                })
            }
        }
        setLoading(false)
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
                <>
                    <Button
                        type="link"
                        onClick={() => navigate(`/appointment-result/${record.id}`)}
                    >
                        Chi tiết
                    </Button>
                    {['PENDING', 'PENDING_PAYMENT_CONFIRMED', 'Đang hoạt động'].includes(record.status) ? (
                        <Popconfirm
                            title="Hủy lịch hẹn"
                            description="Bạn có chắc muốn hủy lịch hẹn này?"
                            onConfirm={() => { handleCancelSchedule(record.id) }}
                            okText="Có"
                            cancelText="Không"
                            placement="left"
                        >
                            <Button
                                type="primary"
                                disabled={loading}
                                danger
                            >
                                Hủy
                            </Button>
                        </Popconfirm>
                    ) : null}
                </>
            ),
        },

    ];


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
                {loading ? (
                    <div style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}>
                        <Spin tip="Đang tải..." />
                    </div>

                ) : (
                    <Card>
                        {activeSegment === 'Thông tin cá nhân' && (
                            <Card
                                title="Thông tin cá nhân"
                                style={{ marginTop: '5vh', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            >
                                {userInfo && Object.keys(userInfo).length > 0 ? (
                                    <div style={{ padding: '20px' }}>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Họ và tên</label>
                                                    <Input
                                                        size="large"
                                                        value={userInfo.fullName || ''}
                                                        onChange={(e) => handlePatientInputChange('fullName', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Địa chỉ</label>
                                                    <Input
                                                        size="large"
                                                        value={userInfo.address || ''}
                                                        onChange={(e) => handlePatientInputChange('address', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại</label>
                                                    <Input
                                                        size="large"
                                                        value={userInfo.phoneNumber || ''}
                                                        onChange={(e) => handlePatientInputChange('phoneNumber', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                                                    <Input
                                                        size="large"
                                                        value={userInfo.email || ''}
                                                        onChange={(e) => handlePatientInputChange('email', e.target.value)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Giới tính</label>
                                                    <Select
                                                        size="large"
                                                        value={userInfo.gender || ''}
                                                        onChange={(value) => handlePatientInputChange('gender', value)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <Option value="MALE">Nam</Option>
                                                        <Option value="FEMALE">Nữ</Option>
                                                    </Select>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày sinh</label>
                                                    <DatePicker
                                                        size="large"
                                                        defaultValue={userInfo.dateOfBirth ? dayjs(userInfo.dateOfBirth, 'YYYY-MM-DD') : null}
                                                        format="YYYY-MM-DD"
                                                        style={{ width: '100%' }}
                                                        onChange={(date) => handlePatientInputChange('dateOfBirth', date)}
                                                    />
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Trạng thái tài khoản</label>
                                                    <span>{userInfo.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'N/A'}</span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày tạo tài khoản</label>
                                                    <span>{userInfo.createdAt || 'N/A'}</span>
                                                </div>
                                            </Col>

                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Trạng thái xác minh</label>
                                                    <span>{userInfo.verified ? 'Đã xác minh' : 'Chưa xác minh'}</span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã bệnh nhân</label>
                                                    <span>{userInfo.displayId || 'N/A'}</span>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div>
                                                    <Popconfirm
                                                        title="Cập nhật"
                                                        description="Bạn có chắc muốn cập nhật thông tin?"
                                                        onConfirm={() => { handleUpdateProfile() }}
                                                        okText="Có"
                                                        cancelText="Không"
                                                        placement="left"
                                                    >
                                                        <Button type="primary" >Lưu</Button>
                                                    </Popconfirm>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                    <p style={{ padding: '20px' }}>Không có thông tin bệnh nhân</p>
                                )}
                            </Card>


                        )}

                        {activeSegment === 'Lịch hẹn' && (
                            <Card title="Lịch hẹn"
                                style={{ marginTop: '5vh', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Text style={{ marginRight: '8px' }}>Lọc theo tháng:</Text>
                                        <DatePicker.MonthPicker
                                            format="MM/YYYY"
                                            onChange={handleMonthFilterChange}
                                            style={{ width: '150px' }}
                                            allowClear
                                            placeholder="Chọn tháng"
                                        />
                                    </div>
                                    <Table
                                        columns={columns}
                                        dataSource={filteredSchedules}
                                        rowKey="id"
                                        locale={{ emptyText: 'Chưa có lịch hẹn nào' }}
                                        pagination={{ pageSize: 10 }}
                                    />
                                </div>
                            </Card>
                        )}
                    </Card>
                )}
            </Content>
        </Layout>
    )
}

export default ProfileDetail