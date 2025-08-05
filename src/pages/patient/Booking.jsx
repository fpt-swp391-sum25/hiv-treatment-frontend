import {
    useContext,
    useEffect,
    useState
} from 'react';
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
    Tag,
    Modal,
    Radio
} from 'antd';
import {
    ArrowLeftOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    MailOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useSearchParams
} from 'react-router-dom';
import {
    AuthContext
} from '../../components/context/AuthContext';
import {
    fetchServicePrices,
    fetchSystemConfigurationsAPI
} from '../../services/systemConfiguration.service';
import '../../styles/patient/Booking.css'
import {
    initiatePaymentAPI
} from '../../services/appointment.service';
import {
    fetchAllDoctorsAPI
} from '../../services/user.service';
import {
    fetchAllScheduleAPI,
    fetchScheduleByDateAPI,
    registerScheduleAPI
} from '../../services/schedule.service';
import { createCashPaymentAPI } from '../../services/payment.service';


const { Link } = Typography;
const { Option } = Select;
const { Content } = Layout;
const dateFormat = 'DD-MM-YYYY';

const SlotSelector = ({ slots, selected, onSelect, loading }) => (
    <div className="slot-grid-modern">
        {Object.keys(slots).length === 0 && !loading && (
            <div style={{ color: '#bbb', padding: 20, textAlign: 'center' }}>
                Vui lòng chọn ngày để xem khung giờ
            </div>
        )}
        {Object.keys(slots).map((startTime) => {
            const slot = slots[startTime].slots[0];
            return (
                <Button
                    key={startTime}
                    shape="round"
                    style={{
                        margin: 8,
                        width: 110,
                        fontWeight: selected === slot.slot ? 700 : 400,
                        background: selected === slot.slot ? '#e6f7ff' : '#fff'
                    }}
                    type={selected === slot.slot ? "primary" : "default"}
                    onClick={() => onSelect(slot.slot)}
                >
                    {dayjs(startTime, 'HH:mm:ss').format('HH:mm')}
                </Button>
            );
        })}
    </div>
);

const Booking = () => {
    const [form] = Form.useForm();
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams()
    const doctorIdParam = searchParams.get('doctorId')
    const [doctors, setDoctors] = useState([]);
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [groupedSlots, setGroupedSlots] = useState({});
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [servicePrices, setServicePrices] = useState({});
    const [config, setConfig] = useState({});
    const [isVisibleModal, setIsVisibleModal] = useState(false)
    const doctorId = Form.useWatch('doctor', form);
    const date = Form.useWatch('date', form);
    const slot = Form.useWatch('slot', form);
    const type = Form.useWatch('type', form);
    const typeParam = searchParams.get('type');

    const paymentOptions = [
        {
            value: "online",
            label: "Thanh toán trực tuyến",
            desc: "Chuyển khoản, ví điện tử,...",
        },
        {
            value: "cash",
            label: "Tiền mặt",
            desc: "Trả tiền khi đến khám",
        },
    ];

    useEffect(() => {
        loadDoctors();
        loadSystemPrices();
        loadConfigs();
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
        if (doctorIdParam && doctors.length > 0) {
            const exists = doctors.find(doc => doc.id === Number(doctorIdParam));
            if (exists && !form.getFieldValue('doctor')) {
                form.setFieldValue('doctor', exists.id);
            }
        }

    }, [doctorIdParam, doctors, form])

    useEffect(() => {
        if (typeParam && !form.getFieldValue('type')) {
            const allowedTypes = ['Khám', 'Tái khám', 'Tư vấn'];
            if (allowedTypes.includes(typeParam)) {
                form.setFieldValue('type', typeParam);
            }
        }
    }, [typeParam, form]);

    useEffect(() => {
        const doctorId = form.getFieldValue('doctor');
        if (slot) {
            const schedule = availableSchedules.find(
                (s) => s.slot === slot 
                && (!doctorId || s.doctor.id === doctorId) 
                && s.status !== 'Đang hoạt động'
                && s.status !== 'Đã hủy'
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
    }, [slot, type, availableSchedules, servicePrices]);

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
            if (response.data) setDoctors(response.data);
        } catch {
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
                const now = dayjs()
                let filteredData = response.data;

                if (dayjs(date).isSame(now, 'day')) {
                    filteredData = filteredData.filter(schedule => {
                        const slotStart = schedule.slot.split('-')[0];
                        const slotDateTime = dayjs(`${dayjs(date).format('YYYY-MM-DD')} ${slotStart}`, 'YYYY-MM-DD HH:mm');
                        return slotDateTime.isAfter(now);
                    });
                }

                const grouped = filteredData.reduce((acc, schedule) => {
                    const startTime = schedule.slot.split('-')[0];
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
        } catch {
            message.error('Không thể tải danh sách khung giờ');
        } finally {
            setLoading(false);
        }
    };

    const loadSystemPrices = async () => {
        try {
            const prices = await fetchServicePrices();
            setServicePrices(prices);
        } catch {
            message.error('Không thể tải giá dịch vụ');
        }
    };

    const disabledDate = (current) => {
        const isBeforeToday = current && current < dayjs().startOf('day');
        const isSunday = current && current.day() === 0;
        return isBeforeToday || isSunday;
    };

    const normalizeString = (str) => {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);

            const selectedSchedules = availableSchedules.filter(
                (schedule) => schedule.slot === values.slot
            );

            if (selectedSchedules.length === 0) {
                throw new Error('Lịch hẹn không hợp lệ');
            }

            let schedule;
            if (values.doctor) {
                schedule = selectedSchedules.find((s) => s.doctor.id === values.doctor
                && s.status !== 'Đang hoạt động'
                && s.status !== 'Đã hủy'
            );
                if (!schedule) throw new Error('Bác sĩ không có lịch hẹn cho khung giờ này');
            } else {
                schedule = selectedSchedules[0];
            }

            const regisRes = await registerScheduleAPI({
                scheduleId: schedule.id,
                patientId: user.id,
                type: values.type,
            });

            if (regisRes.status === 409 && regisRes.message.includes('already has')) {
                setIsVisibleModal(true)
                return
            }

            if (values.paymentMethod === 'online') {
                const paymentResponse = await initiatePaymentAPI({
                    scheduleId: schedule.id,
                    amount: selectedAmount,
                });
                window.location.href = paymentResponse.data;
            } else {
                await createCashPaymentAPI({
                    scheduleId: schedule.id,
                    amount: selectedAmount
                });
                Modal.success({
                    title: 'Đặt lịch thành công!',
                    content: (
                        <div>
                            Vui lòng thanh toán tiền mặt tại quầy khi đến khám.<br />
                            <b>Cảm ơn bạn đã sử dụng dịch vụ!</b>
                        </div>
                    ),
                    okText: 'Đóng'
                    // Có thể custom okButtonProps, className, icon,... tùy ý
                });
            }

        } catch (error) {
            message.error(error.message || 'Đặt lịch thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ background: '#fafcff' }}>
            <Content style={{ padding: 0, maxWidth: 1300, margin: '0 auto' }}>
                <Modal
                    title={<span style={{ color: 'red' }}>Thông báo</span>}
                    open={isVisibleModal}
                    onOk={() => { setIsVisibleModal(false) }}
                    onCancel={() => { setIsVisibleModal(false) }}
                    okText="Đóng"
                    okButtonProps={{ style: { display: 'none' } }}
                    cancelButtonProps={{ style: { display: 'none' } }}
                >
                    <p>Bạn đã có lịch hẹn trong ngày này.<br />Không thể đặt thêm!</p>
                </Modal>
                <Row gutter={[16, 16]} style={{ padding: '16px 8px' }}>
                    <Col xs={24} md={15} style={{ minWidth: 320 }}>
                        <Card
                            variant={false}
                            style={{
                                minHeight: 520,
                                borderRadius: 18,
                                boxShadow: '0 6px 32px rgba(44,62,80,0.09)',
                                background: '#fff',
                                marginBottom: 24,
                            }}
                            bodyStyle={{
                                padding: window.innerWidth >= 768 ? '32px 32px 24px 32px' : '24px 8px'
                            }}
                            title={
                                <Link href="/" className="link">
                                    <ArrowLeftOutlined /> Về trang chủ
                                </Link>
                            }
                            extra={
                                selectedSchedule ? (
                                    <Tag color="blue" style={{ fontSize: 16 }}>
                                        Đã chọn: {dayjs(date).format('DD/MM/YYYY')} {selectedSchedule?.slot?.slice(0, 5)}
                                    </Tag>
                                ) : null
                            }
                        >
                            <Typography.Title level={3} style={{ fontWeight: 800, marginBottom: 0 }}>Đặt lịch khám</Typography.Title>
                            <Typography.Text type="secondary">Hãy điền thông tin để đặt lịch nhanh chóng</Typography.Text>
                            <Divider />
                            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional" size="large">
                                <Form.Item
                                    name="type"
                                    label="Chọn loại dịch vụ"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
                                >
                                    <Select placeholder="Loại dịch vụ...">
                                        <Option value="Khám">Khám</Option>
                                        <Option value="Tái khám">Tái khám</Option>
                                        <Option value="Tư vấn">Tư vấn</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="doctor" label="Chọn bác sĩ (tùy chọn)">
                                    <Select
                                        showSearch allowClear placeholder="Lọc bác sĩ (gõ tên)"
                                        filterOption={(input, option) =>
                                            normalizeString(option.children).includes(normalizeString(input))
                                        }
                                    >
                                        {doctors.map((doctor) => (
                                            <Option key={doctor.id} value={doctor.id}>{doctor.fullName}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="date"
                                            label="Chọn ngày"
                                            rules={[{ required: true, message: 'Chọn ngày khám' }]}
                                        >
                                            <DatePicker
                                                disabledDate={disabledDate}
                                                format={dateFormat}
                                                style={{ width: '100%' }}
                                                onChange={() => form.setFieldsValue({ slot: undefined })}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="slot"
                                            label="Khung giờ"
                                            rules={[{ required: true, message: 'Chọn khung giờ' }]}
                                        >
                                            <SlotSelector
                                                slots={groupedSlots}
                                                selected={slot}
                                                onSelect={s => form.setFieldsValue({ slot: s })}
                                                loading={loading}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                {selectedSchedule && (
                                    <Descriptions
                                        bordered
                                        size="small"
                                        layout="vertical"
                                        style={{ margin: '18px 0', borderRadius: 8, background: '#f8fafc' }}
                                    >
                                        <Descriptions.Item label="Loại hẹn">{type}</Descriptions.Item>
                                        <Descriptions.Item label="Ngày khám">{dayjs(date).format('DD-MM-YYYY')}</Descriptions.Item>
                                        <Descriptions.Item label="Khung giờ">{selectedSchedule.slot?.slice(0, 5)}</Descriptions.Item>
                                        <Descriptions.Item label="Giá">
                                            <span style={{ fontWeight: 700, color: '#1677ff', fontSize: 18 }}>
                                                {selectedAmount ? selectedAmount.toLocaleString('vi-VN') : '--'} VND
                                            </span>
                                        </Descriptions.Item>
                                    </Descriptions>
                                )}
                                <Form.Item
                                    name="paymentMethod"
                                    label="Hình thức thanh toán"
                                    rules={[{ required: true, message: "Vui lòng chọn hình thức thanh toán" }]}
                                >
                                    <Radio.Group className="payment-block-group" style={{ width: "100%" }}>
                                        {paymentOptions.map(opt => (
                                            <label
                                                key={opt.value}
                                                className="payment-block-option"
                                                htmlFor={`pay-method-${opt.value}`}
                                                style={{ width: 220, cursor: "pointer", marginRight: 18 }}
                                            >
                                                <Radio
                                                    value={opt.value}
                                                    id={`pay-method-${opt.value}`}
                                                    style={{ marginRight: 8 }}
                                                />
                                                <div className="info">
                                                    <div className="label">{opt.label}</div>
                                                    <div className="desc">{opt.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item>
                                    <Button block type="primary" size="large" htmlType="submit" loading={loading} style={{ fontSize: 18, borderRadius: 8, height: 48 }}>
                                        Xác nhận đặt lịch
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                    <Col xs={24} md={9} style={{ minWidth: 250 }}>
                        <Card
                            variant={false}
                            style={{
                                borderRadius: 18,
                                background: 'linear-gradient(135deg, #e0f0ff 60%, #fff 100%)',
                                boxShadow: '0 0 0 0 transparent',
                                minHeight: 520
                            }}
                            bodyStyle={{ padding: 28, fontSize: 16 }}
                            title={<span><InfoCircleOutlined /> Hỗ trợ đặt khám</span>}
                        >
                            <div style={{ fontSize: 16, marginBottom: 18 }}>
                                <ClockCircleOutlined /> <b>Giờ làm việc:</b><br />{config['Thời gian làm việc']}
                            </div>
                            <div style={{ fontSize: 16, marginBottom: 10 }}>
                                <PhoneOutlined /> <b>Hotline:</b> {config['Đường dây nóng']}
                            </div>
                            <div style={{ fontSize: 16, marginBottom: 10 }}>
                                <MailOutlined /> <b>Email:</b> {config['Email hỗ trợ']}
                            </div>
                            <Divider />
                            <Typography.Title level={5}><ExclamationCircleOutlined /> Lưu ý khi đặt lịch</Typography.Title>
                            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                                <li>Đến sớm ít nhất 15 phút trước giờ hẹn</li>
                                <li>Mang theo giấy tờ tùy thân, thẻ BHYT (nếu có)</li>
                                <li>Điền thông tin sức khỏe chính xác, trung thực</li>
                            </ul>
                            <Divider />
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};
export default Booking;
