import {
    Layout, message, Spin, Table, Button, Popconfirm, Card, Typography,
    DatePicker, notification, Tabs, Tag, Space, ConfigProvider
} from "antd";
import {
    ClockCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    HistoryOutlined,
    DeleteOutlined,
    ScheduleOutlined,
    FilterOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import viVN from 'antd/es/locale/vi_VN';
import 'dayjs/locale/vi';
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/context/AuthContext";
import {
    cancelBookingAPI,
    fetchAllPatientScheduleAPI,
    retryPaymentAPI
} from "../../services/api.service";
import PatientAppointmentHistory from "./PatientAppointmentHistory";
import { fetchServicePrices } from "../../services/systemConfiguration.service";

const { Content } = Layout;
const { Text, Title } = Typography;

dayjs.locale('vi');

const AppointmentList = () => {
    const { user } = useContext(AuthContext);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('appointment');
    const [monthFilter, setMonthFilter] = useState(null);
    const [servicePrices, setServicePrices] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        loadAllSchedule();
        loadSystemPrices();
    }, []);

    const loadAllSchedule = async () => {
        setLoading(true);
        try {
            const response = await fetchAllPatientScheduleAPI(user.id);
            const today = dayjs().startOf('day');
            const sorted = response.data
                .map(item => ({
                    ...item,
                    doctorName: item.doctor?.fullName || 'Không xác định',
                    type: item.type || null,
                    status: item.status || null,
                    date: dayjs(item.date, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                }))
                .filter(item => {
                    const scheduleDate = dayjs(`${item.date} ${item.slot}`, 'DD-MM-YYYY HH:mm');
                    return scheduleDate.isSame(today, 'day') || scheduleDate.isAfter(today);
                })
                .sort((a, b) => {
                    const dateA = dayjs(`${a.date} ${a.slot}`, 'DD-MM-YYYY HH:mm');
                    const dateB = dayjs(`${b.date} ${b.slot}`, 'DD-MM-YYYY HH:mm');
                    return dateA - dateB;
                });

            setSchedule(sorted);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải lịch hẹn');
        } finally {
            setLoading(false);
        }
    };
    const loadSystemPrices = async () => {
        try {
            const prices = await fetchServicePrices();
            setServicePrices(prices);
        } catch (error) {
            message.error('Không thể tải giá dịch vụ');
        }
    };

    const handleRetryPayment = async (scheduleId) => {
        const retrySchedule = schedule.find(item => item.id === scheduleId);
        if (!retrySchedule) {
            message.error('Không tìm thấy lịch hẹn');
            return;
        }
        let amount = 0;
        if (retrySchedule.type === 'Khám') amount = Number(servicePrices['Giá tiền đặt lịch khám']) || 0;
        if (retrySchedule.type === 'Tái khám') amount = Number(servicePrices['Giá tiền đặt lịch tái khám']) || 0;
        if (retrySchedule.type === 'Tư vấn') amount = Number(servicePrices['Giá tiền đặt lịch tư vấn']) || 0;

        try {
            const response = await retryPaymentAPI({ scheduleId: scheduleId, amount: amount })
            if (response.data) {
                window.location.href = response.data;
            }
        } catch (error) {
            message.error("Lỗi khi tạo URL thanh toán.");
            console.error(error);
        }

    }

    const handleCancelSchedule = async (scheduleId) => {
        setLoading(true);
        try {
            const response = await cancelBookingAPI(scheduleId, user.id);
            if (response.data) {
                notification.success({
                    message: 'Huỷ lịch hẹn thành công',
                });
                loadAllSchedule();
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi huỷ lịch hẹn',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Khám': return 'blue';
            case 'Tái khám': return 'green';
            case 'Tư vấn': return 'orange';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: <><ScheduleOutlined /> Loại lịch</>,
            dataIndex: 'type',
            key: 'type',
            render: type => <Tag color={getTypeColor(type)}>{type}</Tag>,
        },
        {
            title: <><CalendarOutlined /> Ngày</>,
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: <><ClockCircleOutlined /> Giờ</>,
            dataIndex: 'slot',
            key: 'slot',
            render: slot => slot ? dayjs(slot, 'HH:mm:ss').format('HH:mm') : '',
        },
        {
            title: <><UserOutlined /> Bác sĩ</>,
            dataIndex: 'doctorName',
            key: 'doctorName',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                switch (status) {
                    case 'Đang chờ thanh toán': color = 'gold'; break;
                    case 'Đã thanh toán': color = 'green'; break;
                    case 'Đang hoạt động': color = 'blue'; break;
                    case 'Thanh toán thất bại': color = 'red'; break;
                    default: color = 'default';
                }
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => {
                if (['Đã thanh toán', 'Đang chờ thanh toán', 'Đang hoạt động'].includes(record.status)) {
                    return (
                        <Popconfirm
                            title="Huỷ lịch hẹn?"
                            description="Bạn có chắc muốn huỷ?"
                            onConfirm={() => handleCancelSchedule(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button type="primary" icon={<DeleteOutlined />} danger>
                                Huỷ
                            </Button>
                        </Popconfirm>
                    );
                } else if (record.status === 'Thanh toán thất bại') {
                    return (
                        <Popconfirm
                            title="Huỷ lịch hẹn?"
                            description="Bạn có chắc muốn huỷ?"
                            onConfirm={() => handleRetryPayment(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="dashed"
                                danger
                            >
                                Thanh toán lại
                            </Button>
                        </Popconfirm>

                    );
                }
                return null;
            }
        }
    ];

    const handleMonthFilterChange = (date) => {
        setMonthFilter(date ? date.format('MM-YYYY') : null);
    };

    const filteredSchedules = monthFilter
        ? schedule.filter(s => dayjs(s.date, 'DD-MM-YYYY').format('MM-YYYY') === monthFilter)
        : schedule;

    return (
        <ConfigProvider locale={viVN}>
            <Spin spinning={loading} tip="Đang tải...">
                <Card bordered={false} style={{ minHeight: '80vh' }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        type="card"
                        items={[
                            {
                                key: 'appointment',
                                label: <><ScheduleOutlined /> Lịch hẹn</>,
                            },
                            {
                                key: 'history',
                                label: <><HistoryOutlined /> Lịch sử</>,
                            }
                        ]}
                    />

                    {activeTab === 'appointment' && (
                        <div style={{ padding: 24, minHeight: '500px' }}>
                            <Card
                                title={<Title level={4}><ScheduleOutlined /> Danh sách lịch hẹn</Title>}
                                extra={
                                    <Space>
                                        <FilterOutlined />
                                        <Text>Lọc theo tháng:</Text>
                                        <DatePicker.MonthPicker
                                            format="MM/YYYY"
                                            onChange={handleMonthFilterChange}
                                            placeholder="Chọn tháng"
                                        />
                                    </Space>
                                }
                            >
                                <Table
                                    columns={columns}
                                    dataSource={filteredSchedules}
                                    rowKey="id"
                                    locale={{ emptyText: 'Không có lịch hẹn nào' }}
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <PatientAppointmentHistory />
                    )}
                </Card>
            </Spin>
        </ConfigProvider>
    );
};

export default AppointmentList;
