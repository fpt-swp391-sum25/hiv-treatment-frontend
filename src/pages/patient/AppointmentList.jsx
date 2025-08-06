import {
    Layout,
    message,
    Spin,
    Table,
    Button,
    Popconfirm,
    Card,
    Typography,
    DatePicker,
    notification,
    Tabs,
    Tag,
    Space,
    ConfigProvider,
    Modal,
    Popover
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
import {
    useContext,
    useEffect,
    useState
} from "react";
import {
    AuthContext
} from "../../components/context/AuthContext";
import PatientAppointmentHistory from "./PatientAppointmentHistory";
import {
    fetchSystemConfigurationsAPI,
    fetchServicePrices
} from "../../services/systemConfiguration.service";
import {
    cancelBookingAPI,
    retryPaymentAPI
} from "../../services/appointment.service";
import {
    fetchAllPatientScheduleAPI
} from "../../services/schedule.service";
import {
    fetchHealthRecordByScheduleIdAPI
} from "../../services/health-record.service";
import { getPaymentByScheduleIdAPI } from "../../services/payment.service";

const { Text, Title } = Typography;

dayjs.locale('vi');

const AppointmentList = () => {
    const { user } = useContext(AuthContext);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('appointment');
    const [monthFilter, setMonthFilter] = useState(null);
    const [servicePrices, setServicePrices] = useState({});
    const [minCancelHour, setMinCancelHour] = useState(24);

    useEffect(() => {
        loadAllSchedule();
        loadSystemConfig();
    }, []);

    const loadAllSchedule = async () => {
        setLoading(true);
        try {
            const response = await fetchAllPatientScheduleAPI(user.id);
            const now = dayjs()
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
                    return scheduleDate.isAfter(now);
                })
                .sort((a, b) => {
                    const dateA = dayjs(`${a.date} ${a.slot}`, 'DD-MM-YYYY HH:mm');
                    const dateB = dayjs(`${b.date} ${b.slot}`, 'DD-MM-YYYY HH:mm');
                    return dateA - dateB;
                });

            const withHealthStatus = await Promise.all(sorted.map(async item => {
                const healthRecord = await fetchHealthRecordByScheduleIdAPI(item.id)
                return { ...item, healthRecordStatus: healthRecord?.data?.treatmentStatus || null }

            }))
            const filtered = withHealthStatus
                .filter(item => item.healthRecordStatus !== 'Đã khám')
                .filter(item => item.healthRecordStatus !== 'Đã tư vấn');
            const paymentList = await Promise.all(
                filtered.map(item => getPaymentByScheduleIdAPI(item.id))
            );
            const joined = filtered.map((item, idx) => ({
                ...item,
                paymentStatus: paymentList[idx]?.data?.status || 'CHƯA THANH TOÁN',
                paymentDes: paymentList[idx]?.data?.description || 'N/A'
            }));
            setSchedule(joined);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const loadSystemConfig = async () => {
        try {
            const prices = await fetchServicePrices();
            setServicePrices(prices);

            const configRes = await fetchSystemConfigurationsAPI();
            const minCancelConfig = configRes?.data?.find(
                (item) => item.name === "Thời gian tối thiểu nếu hủy lịch (tiếng)"
            );
            const value = Number(minCancelConfig?.value);
            if (!isNaN(value) && value > 0) {
                setMinCancelHour(value);
            }
        } catch {
            message.error('Không thể tải cấu hình hệ thống');
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
        } catch {
            message.error("Lỗi khi tạo URL thanh toán.");
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
    const showCancelModal = (record) => {
        Modal.confirm({
            title: "Huỷ lịch hẹn?",
            content: (
                <div>
                    <div style={{ marginBottom: 12, color: "#888" }}>
                        Bạn có chắc muốn huỷ lịch hẹn dưới đây?
                    </div>
                    <div>
                        <p><b>Loại lịch:</b> {record.type}</p>
                        <p><b>Ngày:</b> {dayjs(record.date, "DD-MM-YYYY").format("DD/MM/YYYY")}</p>
                        <p><b>Giờ:</b> {record.slot ? dayjs(record.slot, "HH:mm:ss").format("HH:mm") : ""}</p>
                        <p><b>Bác sĩ:</b> {record.doctorName}</p>
                    </div>
                </div>
            ),
            okText: "Có",
            cancelText: "Không",
            onOk: () => handleCancelSchedule(record.id),
            okButtonProps: { loading: loading },
        });
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
                let color = 'default', label;
                switch (status) {
                    case 'Đã hủy': color = 'gold'; label = 'Lịch hẹn đã bị hủy'; break;
                    case 'Đang hoạt động': color = 'green'; label = 'Đang hoạt động'; break;
                    default: color = 'default';
                }
                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentDes',
            key: 'paymentDes',

        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (paymentStatus) => {
                let color, label;
                switch (paymentStatus) {
                    case 'Thanh toán thành công':
                        color = 'green'; label = 'Đã thanh toán'; break;
                    case 'Đã thanh toán':
                        color = 'green'; label = 'Đã thanh toán'; break;
                    case 'Thanh toán thất bại':
                        color = 'red'; label = 'Thanh toán thất bại'; break;
                    case 'Chờ thanh toán':
                        color = 'gold'; label = 'Đang chờ thanh toán'; break;
                    default:
                        color = 'default'; label = 'Chưa thanh toán';
                }
                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => {
                const { paymentStatus, status, paymentDes } = record;
                const appointmentDateTime = dayjs(`${record.date} ${record.slot}`, 'DD-MM-YYYY HH:mm')
                const now = dayjs()
                const canCancel = appointmentDateTime.diff(now, 'hour') >= minCancelHour;
                if (paymentStatus === 'Thanh toán thất bại' || (paymentDes === 'VNPay' && paymentStatus === 'Chờ thanh toán')) {
                    return (
                        <>
                            <Popconfirm
                                title="Thanh toán lại?"
                                description="Bạn có chắc muốn thanh toán lại?"
                                onConfirm={() => handleRetryPayment(record.id)}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button
                                    type="default"
                                >
                                    Thanh toán lại
                                </Button>
                            </Popconfirm>
                            <Button
                                style={{ marginLeft: 15 }}
                                className="custom-delete-btn"
                                icon={<DeleteOutlined />}
                                onClick={() => showCancelModal(record)}
                            >
                                Huỷ
                            </Button>
                        </>
                    );
                }
                if (paymentDes === 'Tiền mặt' && paymentStatus === 'Chờ thanh toán' && status === 'Đang hoạt động') {
                    if (canCancel) {

                        return (
                            <Button
                                className="custom-delete-btn"
                                icon={<DeleteOutlined />}
                                onClick={() => showCancelModal(record)}
                            >
                                Huỷ
                            </Button>
                        );
                    } else {
                        return (
                            <>
                                <Popover
                                    content={
                                        <div style={{ minWidth: 180 }}>
                                            <b>Không thể huỷ lịch</b>
                                            <div style={{ color: '#888', marginTop: 4 }}>
                                                Chỉ được huỷ trước {minCancelHour} giờ so với giờ hẹn.
                                            </div>
                                        </div>
                                    }
                                    title={null}
                                    placement="top"
                                    trigger="hover"
                                >
                                    <Button className="custom-delete-btn" icon={<DeleteOutlined />} disabled >
                                        Huỷ
                                    </Button>
                                </Popover>
                            </>
                        )
                    }
                }
                if (paymentDes === 'VNPay' && paymentStatus === 'Thanh toán thành công' && status === 'Đang hoạt động') {
                    if (canCancel) {

                        return (
                            <Button
                                className="custom-delete-btn"
                                icon={<DeleteOutlined />}
                                onClick={() => showCancelModal(record)}
                            >
                                Huỷ
                            </Button>
                        );
                    } else {
                        return (
                            <>
                                <Popover
                                    content={
                                        <div style={{ minWidth: 180 }}>
                                            <b>Không thể huỷ lịch</b>
                                            <div style={{ color: '#888', marginTop: 4 }}>
                                                Chỉ được huỷ trước {minCancelHour} giờ so với giờ hẹn.
                                            </div>
                                        </div>
                                    }
                                    title={null}
                                    placement="top"
                                    trigger="hover"
                                >
                                    <Button className="custom-delete-btn" icon={<DeleteOutlined />} disabled >
                                        Huỷ
                                    </Button>
                                </Popover>
                            </>
                        )
                    }
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
