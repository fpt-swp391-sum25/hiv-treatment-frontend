import {
    Button,
    Card,
    Descriptions,
    Layout,
    Spin
} from "antd";
import dayjs from "dayjs";
import {
    useEffect,
    useState
} from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import {
    fetchHealthRecordByScheduleIdAPI
} from "../../services/health-record.service";

const { Content } = Layout

const AppointmentResult = () => {

    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadResultDetail()
    }, [])

    const typeMapping = {
        APPOINTMENT: 'Đặt khám',
        FOLLOW_UP: 'Tái khám',
        CONSULTATION: 'Tư vấn',
        null: 'Chưa xác định',
        'Khám': 'Khám',
    };

    const loadResultDetail = async () => {
        setLoading(true)
        const response = await fetchHealthRecordByScheduleIdAPI(scheduleId)
        if (response.data) {
            setResult(response.data)
        }
        setLoading(false)
    }

    return (
        <Layout>
            <Content>
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
                    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>Chi tiết kết quả lịch hẹn</h2>
                        <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            {result ? (
                                <div style={{ padding: '20px' }}>
                                    <Descriptions title="Thông tin lịch hẹn" column={{ xs: 1, sm: 2 }} bordered>
                                        <Descriptions.Item label="Bác sĩ">{result.schedule?.doctor?.fullName || 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Loại">{typeMapping[result.schedule?.type] || 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Ngày">{result.schedule?.date ? dayjs(result.schedule.date).format('DD/MM/YYYY') : 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Giờ">
                                            {result.schedule?.slot
                                                ? `${dayjs(result.schedule.slot, 'HH:mm:ss').format('HH:mm')} - ${dayjs(result.schedule.slot, 'HH:mm:ss').add(30, 'minutes').format('HH:mm')}`
                                                : 'Chưa có'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                    <Descriptions title="Kết quả khám" column={{ xs: 1, sm: 2 }} bordered style={{ marginTop: '20px' }}>
                                        <Descriptions.Item label="Mã phòng khám">{result.roomCode || 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Chiều cao">{result.height ? `${result.height} cm` : 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Cân nặng">{result.weight ? `${result.weight} kg` : 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Nhóm máu">{result.bloodType || 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái HIV">{result.hivStatus || 'Chưa có'}</Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái điều trị">{result.treatmentStatus || 'Chưa có'}</Descriptions.Item>
                                    </Descriptions>
                                    {result.regimen ? (
                                        <Descriptions column={1} bordered size="small">
                                            <Descriptions.Item label="Tên phác đồ">{result.regimen.regimenName || 'Chưa có'}</Descriptions.Item>
                                            <Descriptions.Item label="Mô tả">{result.regimen.description || 'Chưa có'}</Descriptions.Item>
                                            <Descriptions.Item label="Chỉ định">{result.regimen.indications || 'Chưa có'}</Descriptions.Item>
                                            <Descriptions.Item label="Chống chỉ định">{result.regimen.contradications || 'Chưa có'}</Descriptions.Item>
                                            {result.regimen.components && Array.isArray(result.regimen.components) && (
                                                <Descriptions.Item label="Thành phần">
                                                    <ul>
                                                        {result.regimen.components.map((component, index) => (
                                                            <li key={index}>{component.name || JSON.stringify(component)}</li>
                                                        ))}
                                                    </ul>
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>
                                    ) : (
                                        'Chưa có'
                                    )}
                                    <Descriptions>
                                        <Descriptions.Item label="Ghi chú" span={2}>{result.note || 'Chưa có'}</Descriptions.Item>
                                    </Descriptions>
                                    <Button
                                        type="primary"
                                        onClick={() => navigate('/profile')}
                                        style={{ marginTop: '20px' }}
                                    >
                                        Quay lại
                                    </Button>
                                </div>
                            ) : (
                                <p style={{ padding: '20px' }}>Không có kết quả lịch hẹn</p>
                            )}
                        </Card>
                    </div>
                )}
            </Content>
        </Layout>

    )
}
export default AppointmentResult