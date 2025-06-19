import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../components/context/auth.context"
import { fetchAllPatientScheduleAPI, fetchUserInfoAPI, updateProfileAPI } from "../../services/api.service"
import { Layout, message, Spin, Table, Button, Popconfirm, Segmented, Card, Descriptions, Form, Input, Row, Col, Select, DatePicker, notification } from "antd"
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";


const { Content } = Layout;

const ProfileDetail = () => {

    const { user } = useContext(AuthContext)
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(false);
    const [activeSegment, setActiveSegment] = useState('Thông tin cá nhân');
    const [userInfo, setUserInfo] = useState({})



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

    const handlePatientInputChange = async (field, value) => {
        try {
            setLoading(true);
            const updatedPatientInfo = { ...userInfo, [field]: value };

            // const formattedData = {
            //     ...updatedPatientInfo,
            //     dateOfBirth: updatedPatientInfo.dateOfBirth
            //         ? moment.isMoment(value) ? value.format('YYYY-MM-DD') : updatedPatientInfo.dateOfBirth
            //         : null,
            // };
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
                description: 'Cap nhat thành công'
            })
        }
    }

    const EventContent = (arg) => {
        const { event, view } = arg;
        const { extendedProps } = event;
        const isWeekOrDayView = view.type === 'timeGridWeek' || view.type === 'timeGridDay';

        if (isWeekOrDayView) {
            return (
                <div style={{ padding: '5px', fontSize: '12px' }}>
                    <Text strong>{event.title}</Text>
                    <div>
                        <Text type="secondary">Giờ: {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</Text>
                    </div>
                    <div>
                        <Text type="secondary">Bác sĩ: {extendedProps.doctorName}</Text>
                    </div>
                    <div>
                        <Text type="secondary">Loại: {typeMapping[extendedProps.type]}</Text>
                    </div>
                    <div>
                        <Text type="secondary">Trạng thái: </Text>
                        <Tag
                            color={
                                extendedProps.status === 'CONFIRMED' ? 'green' :
                                    extendedProps.status === 'PENDING' ? 'orange' :
                                        extendedProps.status === 'AVAILABLE' ? 'red' : 'default'
                            }
                        >
                            {statusMapping[extendedProps.status]}
                        </Tag>
                    </div>
                    <div>
                        <Text type="secondary">Giá: {extendedProps.amount ? `${extendedProps.amount.toLocaleString('vi-VN')} VND` : 'N/A'}</Text>
                    </div>
                </div>
            );
        }

        return <div>{event.title}</div>;
    };

    const events = schedule.map(s => ({
        id: s.id,
        title: `${s.doctorName} - ${typeMapping[s.type]}`,
        start: `${s.date}T${s.slot}:00`,
        end: `${s.date}T${s.slot}:30`,
        extendedProps: {
            status: s.status,
            amount: s.amount,
            doctorName: s.doctorName,
            type: s.type,
        },
        backgroundColor: s.status === 'CONFIRMED' ? '#52c41a' : s.status === 'PENDING' ? '#faad14' : '#f5222d',
        borderColor: s.status === 'CONFIRMED' ? '#52c41a' : s.status === 'PENDING' ? '#faad14' : '#f5222d',
    }));


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
                    <Spin tip="Đang tải..." />
                ) : (
                    <Card>
                        {activeSegment === 'Thông tin cá nhân' ? (
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
                                                        title="Cap nhat"
                                                        description="Bạn có chắc muốn cap nhat thong tin?"
                                                        onConfirm={() => { handleUpdateProfile() }}
                                                        okText="Có"
                                                        cancelText="Không"
                                                        placement="left"
                                                    >
                                                        <Button type="primary" >Luu</Button>
                                                    </Popconfirm>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                ) : (
                                    <p style={{ padding: '20px' }}>Không có thông tin bệnh nhân</p>
                                )}
                            </Card>


                        ) : (
                            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <div className="calendar-container">
                                    <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                        initialView="dayGridMonth"
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                                        }}
                                        events={events}
                                        eventContent={EventContent}
                                        // eventClick={handleEventClick}
                                        locale="vi"
                                        height="600px"
                                        eventTimeFormat={{
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        }}
                                        slotLabelFormat={{
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        }}
                                        noEventsContent="Chưa có lịch hẹn nào"
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