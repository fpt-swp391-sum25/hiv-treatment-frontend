import { useContext, useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Typography, Col, Row, Layout, theme, message, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, createHealthRecordAPI, fetchAllDoctorsAPI, fetchAllScheduleAPI, fetchAvailableSlotAPI, fetchDoctorProfileAPI, fetchScheduleByDateAPI, initiatePaymentAPI, registerScheduleAPI } from '../../services/api.service';
import { AuthContext } from '../../components/context/AuthContext';
import dayjs from 'dayjs';

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

    const doctorId = Form.useWatch('doctor', form);
    const date = Form.useWatch('date', form);
    const slot = Form.useWatch('slot', form);
    const type = Form.useWatch('type', form);

    const typeMapping = {
        APPOINTMENT: 'Khám',
        FOLLOW_UP: 'Tái khám',
        CONSULTATION: 'Tư vấn',
    };

    const navigate = useNavigate();

    useEffect(() => {
        loadDoctors();
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
            const schedule = availableSchedules.find(s => s.slot === slot && (!doctorId || s.doctorId === doctorId));
            setSelectedSchedule(schedule);
        } else {
            setSelectedSchedule(null);
        }
        if (type) {
            let amount;
            switch (type) {
                case 'Khám':
                    amount = 200000;
                    break;
                case 'Tái khám':
                    amount = 150000;
                    break;
                case 'Tư vấn':
                    amount = 100000;
                    break;
                default:
                    amount = 0;
            }
            setSelectedAmount(amount);
        } else {
            setSelectedAmount(null);
        }
    }, [slot, type, availableSchedules, doctorId]);

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
        console.log(">>>check doctor id", doctorId)
        try {
            const response = doctorId
                ? await fetchAllScheduleAPI(doctorId, dayjs(date).format('YYYY-MM-DD'))
                : await fetchScheduleByDateAPI(dayjs(date).format('YYYY-MM-DD'));
            if (response.data) {
                setAvailableSchedules(response.data);
                // Nhóm slot theo khung giờ
                const grouped = response.data.reduce((acc, schedule) => {
                    const key = schedule.slot;
                    if (!acc[key]) {
                        acc[key] = {
                            slot: schedule.slot,
                            startTime: schedule.slot.split('-')[0], // Lấy startTime từ slot
                            doctors: [],
                        };
                    }
                    acc[key].doctors.push({
                        id: schedule.id,
                        doctorId: schedule.doctorId,
                        doctorName: schedule.doctorName,
                    });
                    return acc;
                }, {});
                // Sắp xếp slot theo startTime
                const sortedSlots = Object.keys(grouped)
                    .sort((a, b) => {
                        const timeA = moment(grouped[a].startTime, 'HH:mm');
                        const timeB = moment(grouped[b].startTime, 'HH:mm');
                        return timeA.diff(timeB);
                    })
                    .reduce((acc, key) => {
                        acc[key] = grouped[key];
                        return acc;
                    }, {});
                setGroupedSlots(sortedSlots);
            } else {
                setAvailableSchedules([]);
                setGroupedSlots({});
            }
        } catch (error) {
            console.log(">>>>>>>>>>ERROR", error)
            message.error('Không thể tải danh sách khung giờ');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            const selectedSchedules = availableSchedules.filter(schedule => schedule.slot === values.slot);
            if (selectedSchedules.length === 0) {
                throw new Error('Lịch hẹn không hợp lệ');
            }

            let schedule;
            if (values.doctor) {
                schedule = selectedSchedules.find(schedule => schedule.doctorId === values.doctor);
                if (!schedule) {
                    throw new Error('Bác sĩ không có lịch hẹn cho khung giờ này');
                }
            } else {
                schedule = selectedSchedules[0];
            }

            const registerResponse = await registerScheduleAPI({
                scheduleId: schedule.id,
                patientId: user.id,
                type: values.type,
            });

            const createHealthRecordResponse = await createHealthRecordAPI(schedule.id);

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
            .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
            .replace(/\s+/g, ' ') // Chuẩn hóa dấu cách
            .trim();
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Content style={{ padding: '15px' }}>
                <div style={{
                    background: colorBgContainer,
                    padding: 15,
                    borderRadius: borderRadiusLG,
                }}>
                    <Row justify="center">
                        <Col span={16} style={{ background: 'white', borderRadius: '10px', margin: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            <Link href="/"><ArrowLeftOutlined style={{ margin: '15px' }} /> Về trang chủ</Link>
                            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                                <h1>Đặt lịch khám</h1>
                                <p>Vui lòng điền thông tin dưới đây để đặt lịch khám với bác sĩ chuyên khoa HIV</p>
                                <Form form={form} layout="vertical" onFinish={onFinish}>
                                    <Form.Item name="type" label="Loại dịch vụ" rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}>
                                        <Select placeholder="Chọn loại dịch vụ">
                                            <Select.Option value="Khám">Khám</Select.Option>
                                            <Select.Option value="Tái khám">Tái khám</Select.Option>
                                            <Select.Option value="Tư vấn">Tư vấn</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        name="doctor"
                                        label="Bác sĩ"
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Chọn bác sĩ (tùy chọn)"
                                            allowClear
                                            filterOption={(input, option) => {
                                                const searchText = normalizeString(input);
                                                const fullName = normalizeString(option.children);
                                                return fullName.includes(searchText);
                                            }}
                                        >
                                            {
                                                doctors.map(doctor => (
                                                    <Select.Option key={doctor.id} value={doctor.id}>
                                                        {doctor.fullName}
                                                    </Select.Option>
                                                ))
                                            }
                                        </Select>
                                    </Form.Item>
                                    <Row gutter={8}>
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
                                                    {Object.keys(groupedSlots).map(slot => (
                                                        <Select.Option key={slot} value={slot}>
                                                            {slot}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    {selectedSchedule && (
                                        <Descriptions bordered>
                                            <Descriptions.Item label="Loại lịch hẹn">{type}</Descriptions.Item>
                                            {/* <Descriptions.Item label="Bác sĩ">{selectedSchedule.doctorName}</Descriptions.Item> */}
                                            <Descriptions.Item label="Giá tiền">{selectedAmount ? selectedAmount.toLocaleString('vi-VN') : '0'} VND</Descriptions.Item>
                                        </Descriptions>
                                    )}
                                    <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Xác nhận đặt lịch
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </Col>
                        <Col span={4} style={{ margin: '20px' }}>
                            <div style={{ marginTop: 20 }}>
                                <h2>Thông tin hỗ trợ</h2>
                                <p><strong>Giờ làm việc:</strong> Thứ Hai - Thứ Sáu: 8:00 - 16:30</p>
                                <p><strong>Liên hệ hỗ trợ:</strong></p>
                                <p>Hotline: 1900 1234</p>
                                <p>Email: support@hivcarecenter.vn</p>
                                <h3>Lưu ý</h3>
                                <ul>
                                    <li>Vui lòng đến trước giờ hẹn 15 phút</li>
                                    <li>Mang theo giấy tờ tùy thân và thẻ BHYT (nếu có)</li>
                                    <li>Cập nhật thông tin sức khỏe gần nhất</li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout >
    );
};

export default Booking;