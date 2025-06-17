import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../components/context/auth.context"
import { fetchAllPatientScheduleAPI } from "../../services/api.service"
import { Layout, message, Spin, Table } from "antd"

const { Content } = Layout;

const ProfileDetail = () => {

    const { user } = useContext(AuthContext)
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(false);

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
    }, [])

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

    ];

    return (
        <Layout>
            <Content style={{ minHeight: "500px", padding: '15px' }}>
                <h2>Lịch hẹn của bạn</h2>
                {loading ? (
                    <Spin tip="Đang tải..." />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={schedule}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: 'Chưa có lịch hẹn nào' }}
                    />
                )}
            </Content>
        </Layout>
    )
}

export default ProfileDetail