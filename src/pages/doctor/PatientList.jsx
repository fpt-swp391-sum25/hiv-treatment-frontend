import { 
    Button, 
    Table, 
    Typography, 
    Input, 
    Tabs,
    Space,
    Spin,
    message
} from "antd";
import { 
    useState, 
    useEffect 
} from "react";
import { 
    useNavigate 
} from "react-router-dom";
import dayjs from 'dayjs';
import { 
    fetchScheduleAPI 
} from "../../services/schedule.service";
import { 
    fetchUsersAPI 
} from "../../services/user.service";
import { 
    getPaymentByScheduleIdAPI 
} from "../../services/payment.service";

const { Title } = Typography
const { TabPane } = Tabs

const LabTechnicianPatientList = () => {
    const [pendingData, setPendingData] = useState([])
    const [historyData, setHistoryData] = useState([])
    // Filter for "Đang chờ xử lý"
    const [pendingSearchName, setPendingSearchName] = useState('')
    // Filter for "Lịch sử"
    const [historySearchName, setHistorySearchName] = useState('')
    const [loading, setLoading] = useState(false)
    const [hasSearchedHistory, setHasSearchedHistory] = useState(false)
    
    const navigate = useNavigate()

    useEffect(() => {
        loadPendingData()
    }, [])

    // Tải dữ liệu cho tab "Đang chờ xử lý"
    const loadPendingData = async () => {
        setLoading(true)
        try {
            const [scheduleRes, patientRes] = await Promise.all([
                fetchScheduleAPI(),
                fetchUsersAPI(),
            ])

            const scheduleList = scheduleRes?.data || []
            const patientList = patientRes?.data || []

            // Lọc các lịch có bệnh nhân
            const validSchedules = scheduleList.filter(item => 
                item.patient && item.patient.id && item.date && item.slot
            )

            // Lấy thông tin thanh toán cho mỗi lịch khám
            const paymentPromises = validSchedules.map(item =>
                getPaymentByScheduleIdAPI(item.id).then(
                    res => ({ scheduleId: item.id, data: res.data })
                ).catch(() => ({ scheduleId: item.id, data: null }))
            )

            const payments = await Promise.all(paymentPromises)

            const mergedData = validSchedules.map((item) => {
                const patientId = item.patient?.id
                const matchedPatient = patientList.find(p => p.id === patientId)
                const matchedPayment = payments.find(p => p.scheduleId === item.id)
                
                return {
                    id: item.id,
                    ...item,
                    patientCode: matchedPatient?.displayId || 'N/A',
                    avatar: matchedPatient?.avatar || '',
                    fullName: matchedPatient?.fullName || 'Chưa rõ tên',
                    paymentStatus: matchedPayment?.data?.status || 'Chưa thanh toán',
                }
            })

            // Lọc dữ liệu cho tab "Đang chờ xử lý" (ngày hiện tại hoặc tương lai)
            const today = dayjs().startOf('day')
            const pendingList = mergedData.filter(item => {
                const itemDate = item.date ? dayjs(item.date).startOf('day') : null
                return itemDate && (itemDate.isSame(today) || itemDate.isAfter(today))
            }).sort((a, b) => {
                const dateTimeA = a.date && a.slot ? `${a.date} ${a.slot}` : a.date || ''
                const dateTimeB = b.date && b.slot ? `${b.date} ${b.slot}` : b.date || ''
                return dateTimeB.localeCompare(dateTimeA)
            })

            setPendingData(pendingList)
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error)
            message.error("Lỗi khi tải dữ liệu bệnh nhân đang chờ xử lý")
        } finally {
            setLoading(false)
        }
    }

    // Tải dữ liệu cho tab "Lịch sử" khi người dùng tìm kiếm hoặc hiển thị tất cả
    const loadHistoryData = async (searchName = '') => {
        setLoading(true)
        try {
            const [scheduleRes, patientRes] = await Promise.all([
                fetchScheduleAPI(),
                fetchUsersAPI(),
            ])

            const scheduleList = scheduleRes?.data || []
            const patientList = patientRes?.data || []

            // Lọc các lịch có bệnh nhân
            const validSchedules = scheduleList.filter(item => 
                item.patient && item.patient.id && item.date && item.slot
            )

            const mergedData = validSchedules.map((item) => {
                const patientId = item.patient?.id
                const matchedPatient = patientList.find(p => p.id === patientId)
                
                return {
                    id: item.id,
                    ...item,
                    patientCode: matchedPatient?.displayId || 'N/A',
                    avatar: matchedPatient?.avatar || '',
                    fullName: matchedPatient?.fullName || 'Chưa rõ tên',
                }
            })

            // Lọc dữ liệu cho tab "Lịch sử" (ngày đã qua)
            const today = dayjs().startOf('day')
            let historyList = mergedData.filter(item => {
                const itemDate = item.date ? dayjs(item.date).startOf('day') : null
                return itemDate && itemDate.isBefore(today)
            })

            // Lọc theo tên nếu có
            if (searchName) {
                historyList = historyList.filter(item => 
                    item.fullName.toLowerCase().includes(searchName.toLowerCase())
                )
            }

            // Sắp xếp theo ngày giảm dần (mới nhất lên đầu)
            historyList = historyList.sort((a, b) => {
                const dateTimeA = a.date && a.slot ? `${a.date} ${a.slot}` : a.date || ''
                const dateTimeB = b.date && b.slot ? `${b.date} ${b.slot}` : b.date || ''
                return dateTimeB.localeCompare(dateTimeA)
            })

            setHistoryData(historyList)
            setHasSearchedHistory(true)
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error)
            message.error("Lỗi khi tải dữ liệu lịch sử bệnh nhân")
        } finally {
            setLoading(false)
        }
    }

    // Lọc dữ liệu tab "Đang chờ xử lý" theo tên
    const filteredPendingData = pendingData.filter(item => 
        !pendingSearchName || 
        item.fullName.toLowerCase().includes(pendingSearchName.toLowerCase()) ||
        item.patientCode.toLowerCase().includes(pendingSearchName.toLowerCase())
    )

    const handleTabChange = (key) => {
        if (key === 'pending') {
            // Không cần làm gì vì dữ liệu đã được tải khi mở trang
        } else {
            // Reset dữ liệu lịch sử khi chuyển tab
            setHistoryData([])
            setHasSearchedHistory(false)
        }
    }

    const handleSearch = () => {
        loadHistoryData(historySearchName)
    }

    const handleViewDetail = (record) => {
        navigate(`/lab-technician/patient-detail/${record.id}`)
    }

    // Columns cho tab "Đang chờ xử lý" (có cột trạng thái thanh toán)
    const pendingColumns = [
        {
            title: 'Mã bệnh nhân',
            dataIndex: 'patientCode',
            key: 'patientCode',
        },
        {
            title: 'Ảnh',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar) =>
                avatar ? (
                    <img
                        src={
                            avatar.startsWith('data:image')
                                ? avatar
                                : `data:image/jpegbase64,${avatar}`
                        }
                        alt="avatar"
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                ) : 'Không có ảnh',
        },
        {
            title: 'Tên bệnh nhân',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Ngày khám',
            dataIndex: 'date',
            key: 'date',
            render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : '',
        },
        {
            title: 'Ca khám',
            dataIndex: 'slot',
            key: 'slot',
            render: (slot) => slot ? dayjs(slot, 'HH:mm:ss').format('HH:mm') : '',
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => {
                switch (status) {
                    case 'Đã thanh toán':
                        return <span style={{ color: '#52c41a' }}>{status}</span>
                    case 'Thanh toán thành công':
                        return <span style={{ color: '#52c41a' }}>{status}</span>
                    case 'Đang xử lý':
                        return <span style={{ color: '#1890ff' }}>{status}</span>
                    case 'Chưa thanh toán':
                        return <span style={{ color: '#f5222d' }}>{status}</span>
                    default:
                        return <span style={{ color: 'gray' }}>{status || 'Chưa cập nhật'}</span>
                }
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Button type="link" onClick={() => handleViewDetail(record)}>
                    Chi tiết
                </Button>
            ),
        },
    ]

    // Columns cho tab "Lịch sử" (không có cột trạng thái thanh toán)
    const historyColumns = [
        {
            title: 'Mã bệnh nhân',
            dataIndex: 'patientCode',
            key: 'patientCode',
        },
        {
            title: 'Ảnh',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (avatar) =>
                avatar ? (
                    <img
                        src={
                            avatar.startsWith('data:image')
                                ? avatar
                                : `data:image/jpegbase64,${avatar}`
                        }
                        alt="avatar"
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                ) : 'Không có ảnh',
        },
        {
            title: 'Tên bệnh nhân',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Ngày khám',
            dataIndex: 'date',
            key: 'date',
            render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : '',
        },
        {
            title: 'Ca khám',
            dataIndex: 'slot',
            key: 'slot',
            render: (slot) => slot ? dayjs(slot, 'HH:mm:ss').format('HH:mm') : '',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Button type="link" onClick={() => handleViewDetail(record)}>
                    Chi tiết
                </Button>
            ),
        },
    ]

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
                <Title>Danh sách bệnh nhân</Title>
            </div>
            <Tabs defaultActiveKey="pending" onChange={handleTabChange}>
                <TabPane tab="Đang chờ xử lý" key="pending">
                    <div style={{ marginBottom: 16 }}>
                        <Input
                            placeholder="Tìm kiếm theo tên bệnh nhân"
                            value={pendingSearchName}
                            onChange={e => setPendingSearchName(e.target.value)}
                            style={{ width: '100%', maxWidth: '400px' }}
                            allowClear
                        />
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', margin: '40px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Table 
                            columns={pendingColumns} 
                            dataSource={filteredPendingData} 
                            rowKey={(record) => record.id} 
                            locale={{ emptyText: 'Không có bệnh nhân nào đang chờ xử lý' }}
                        />
                    )}
                </TabPane>
                <TabPane tab="Lịch sử" key="history">
                    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                        <Input
                            placeholder="Tìm kiếm theo tên bệnh nhân"
                            value={historySearchName}
                            onChange={e => setHistorySearchName(e.target.value)}
                            style={{ width: 300, marginRight: 16 }}
                            onPressEnter={handleSearch}
                            allowClear
                        />
                        <Space>
                            <Button 
                                type="primary" 
                                onClick={handleSearch}
                            >
                                Tìm kiếm
                            </Button>
                            <Button 
                                onClick={() => loadHistoryData('')}
                            >
                                Hiển thị tất cả
                            </Button>
                        </Space>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', margin: '40px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        hasSearchedHistory && (
                            <Table 
                                columns={historyColumns} 
                                dataSource={historyData} 
                                rowKey={(record) => record.id} 
                                locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
                            />
                        )
                    )}
                </TabPane>
            </Tabs>
        </>
    )
}
export default LabTechnicianPatientList 