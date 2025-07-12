import { useContext, useEffect, useState } from 'react';
import {
    Form,
    Select,
    DatePicker,
    Button,
    Typography,
    Col,
    Row,
    Layout,
    message,
    Descriptions,
    Card,
    Divider,
} from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    MailOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import {
    fetchAllDoctorsAPI,
    fetchAllScheduleAPI,
    fetchScheduleByDateAPI,
    initiatePaymentAPI,
    registerScheduleAPI,
    createHealthRecordAPI,
    fetchSystemConfigurationsAPI,
} from '../../services/api.service';
import { AuthContext } from '../../components/context/AuthContext';
import dayjs from 'dayjs';
import { fetchServicePrices } from '../../services/systemConfiguration.service';

const { Link } = Typography;
const { Option } = Select;
const { Content } = Layout;
const dateFormat = 'DD-MM-YYYY';

const Booking = () => {
    const [form] = Form.useForm();
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [groupedSlots, setGroupedSlots] = useState({});
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [servicePrices, setServicePrices] = useState({});
    const [config, setConfig] = useState({});

    const doctorId = Form.useWatch('doctor', form);
    const date = Form.useWatch('date', form);
    const slot = Form.useWatch('slot', form);
    const type = Form.useWatch('type', form);

    const navigate = useNavigate();

    useEffect(() => {
        loadDoctors();
        loadSystemPrices();
        loadConfigs()
    }, []);

    useEffect(() => {
        if (date) {
            loadSchedules();
        } else {
            setAvailableSchedules([]);
            setGroupedSlots({});
            form.setFieldsValue({ slot: undefined });
        }
    }, [doctorId, date]);

    useEffect(() => {
        if (slot) {
            const schedule = availableSchedules.find(
                (s) => s.slot === slot && (!doctorId || s.doctorId === doctorId)
            );
            setSelectedSchedule(schedule);
        } else {
            setSelectedSchedule(null);
        }
        if (type) {
            let amount = 0;
            if (type === 'Khám') amount = Number(servicePrices['Giá tiền đặt lịch khám']) || 0;
            if (type === 'Tái khám') amount = Number(servicePrices['Giá tiền đặt lịch tái khám']) || 0;
            if (type === 'Tư vấn') amount = Number(servicePrices['Giá tiền đặt lịch tư vấn']) || 0;
            setSelectedAmount(amount);
        } else {
            setSelectedAmount(null);
        }
    }, [slot, type, availableSchedules, doctorId, servicePrices]);

    const loadConfigs = async () => {
        try {
            const res = await fetchSystemConfigurationsAPI();
            const configMap = {};
            (res.data || []).forEach(item => {
                configMap[item.name] = item.value;
            });
            setConfig(configMap);
        } catch (err) {
            console.error("Lỗi khi tải cấu hình:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const response = await fetchAllDoctorsAPI();
            if (response.data) {
                setDoctors(response.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách bác sĩ');
        } finally {
            setLoading(false);
        }
    };

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const response = doctorId
                ? await fetchAllScheduleAPI(doctorId, dayjs(date).format('YYYY-MM-DD'))
                : await fetchScheduleByDateAPI(dayjs(date).format('YYYY-MM-DD'));
            if (response.data) {
                setAvailableSchedules(response.data);

                // Nhóm slot theo startTime (HH:mm)
                const grouped = response.data.reduce((acc, schedule) => {
                    const key = schedule.slot; // ví dụ "08:00-09:00"
                    const startTime = schedule.slot.split('-')[0]; // "08:00"
                    if (!acc[startTime]) {
                        acc[startTime] = {
                            startTime,
                            slots: [],
                        };
                    }
                    acc[startTime].slots.push(schedule);
                    return acc;
                }, {});

                // Sắp xếp theo startTime
                const sorted = Object.keys(grouped)
                    .sort((a, b) => dayjs(a, 'HH:mm').diff(dayjs(b, 'HH:mm')))
                    .reduce((obj, key) => {
                        obj[key] = grouped[key];
                        return obj;
                    }, {});

                setGroupedSlots(sorted);
            } else {
                setAvailableSchedules([]);
                setGroupedSlots({});
            }
        } catch (error) {
            message.error('Không thể tải danh sách khung giờ');
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

    const onFinish = async (values) => {
        try {
            const selectedSchedules = availableSchedules.filter(
                (schedule) => schedule.slot === values.slot
            );
            if (selectedSchedules.length === 0) {
                throw new Error('Lịch hẹn không hợp lệ');
            }

            let schedule;
            if (values.doctor) {
                schedule = selectedSchedules.find((schedule) => schedule.doctor.id === values.doctor);
                if (!schedule) {
                    throw new Error('Bác sĩ không có lịch hẹn cho khung giờ này');
                }
            } else {
                schedule = selectedSchedules[0];
            }

            await registerScheduleAPI({
                scheduleId: schedule.id,
                patientId: user.id,
                type: values.type,
            });


            const paymentResponse = await initiatePaymentAPI({
                scheduleId: schedule.id,
                amount: selectedAmount,
            });

            window.location.href = paymentResponse.data;
        } catch (error) {
            message.error(error.message || 'Đặt lịch thất bại');
        }
    };

    const disabledDate = (current) => {
        const isBeforeToday = current && current < moment().startOf('day');
        const isSunday = current && current.day() === 0;
        return isBeforeToday || isSunday;
    };

    const normalizeString = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    return (
        <Layout>
            <Content style={{ padding: '20px 40px', minHeight: '600px', margin: '20px' }}>
                <Row gutter={24}>
                    {/* FORM booking chiếm nhiều diện tích */}
                    <Col xs={24} md={17}>
                        <Card
                            title={
                                <Link href="/" className="link">
                                    <ArrowLeftOutlined /> Về trang chủ
                                </Link>

                            }
                            bordered={false}
                            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                            <span style={{ fontSize: 18, fontWeight: 600 }}>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                Đặt lịch khám
                            </span>
                            <p style={{ marginTop: 16 }}>Vui lòng điền thông tin bên dưới để đặt lịch khám HIV</p>

                            <Form form={form} layout="vertical" onFinish={onFinish}>
                                <Form.Item
                                    name="type"
                                    label="Loại dịch vụ"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
                                >
                                    <Select placeholder="Chọn loại dịch vụ">
                                        <Option value="Khám">Khám</Option>
                                        <Option value="Tái khám">Tái khám</Option>
                                        <Option value="Tư vấn">Tư vấn</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item name="doctor" label="Bác sĩ">
                                    <Select
                                        showSearch
                                        placeholder="Chọn bác sĩ (tùy chọn)"
                                        allowClear
                                        filterOption={(input, option) =>
                                            normalizeString(option.children).includes(normalizeString(input))
                                        }
                                    >
                                        {doctors.map((doctor) => (
                                            <Option key={doctor.id} value={doctor.id}>
                                                {doctor.fullName}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="date"
                                            label="Ngày khám"
                                            rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
                                        >
                                            <DatePicker
                                                disabledDate={disabledDate}
                                                format={dateFormat}
                                                style={{ width: '100%' }}
                                                onChange={() => form.setFieldsValue({ slot: undefined })}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="slot"
                                            label="Khung giờ"
                                            rules={[{ required: true, message: 'Vui lòng chọn khung giờ' }]}
                                        >
                                            <Select
                                                placeholder="Chọn khung giờ"
                                                disabled={!date || !Object.keys(groupedSlots).length}
                                            >
                                                {Object.keys(groupedSlots).map((startTime) => (
                                                    <Option key={startTime} value={groupedSlots[startTime].slots[0].slot}>
                                                        {dayjs(startTime, 'HH:mm:ss').format('HH:mm')}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {selectedSchedule && (
                                    <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
                                        <Descriptions.Item label="Loại lịch hẹn">{type}</Descriptions.Item>
                                        <Descriptions.Item label="Giá tiền">
                                            {selectedAmount ? selectedAmount.toLocaleString('vi-VN') : '0'} VND
                                        </Descriptions.Item>
                                    </Descriptions>
                                )}

                                <Form.Item style={{ textAlign: 'right' }}>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Xác nhận đặt lịch
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>

                    {/* Hỗ trợ 30% */}
                    <Col xs={24} md={7}>
                        <Card
                            title={
                                <span style={{ fontSize: 16 }}>
                                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                                    Hỗ trợ
                                </span>
                            }
                            bordered={false}
                            style={{ borderRadius: 12, background: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                        >
                            <p>
                                <ClockCircleOutlined /> <strong>Giờ làm việc:</strong><br />
                                {config['Thời gian làm việc']}
                            </p>
                            <p>
                                <PhoneOutlined /> <strong>Hotline:</strong> {config['Đường dây nóng']}
                            </p>
                            <p>
                                <MailOutlined /> <strong>Email:</strong> {config['Email hỗ trợ']}
                            </p>
                            <Divider />
                            <h3>
                                <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                                Lưu ý
                            </h3>
                            <ul style={{ paddingLeft: 20 }}>
                                <li>Vui lòng đến trước giờ hẹn 15 phút</li>
                                <li>Mang theo giấy tờ tùy thân và thẻ BHYT (nếu có)</li>
                                <li>Cập nhật thông tin sức khỏe gần nhất</li>
                            </ul>
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Booking;
