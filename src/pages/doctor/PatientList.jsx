import {
    Layout,
    Button,
    Table,
    Typography,
    Input,
    DatePicker,
    Select,
    Row,
    Col,
    Tabs,
    message,
    Space,
    Spin
} from "antd";
import {
    useMemo,
    useState,
    useEffect,
    useContext
} from "react";
import {
    Outlet,
    useNavigate,
    useSearchParams 
} from "react-router-dom";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import viVN from 'antd/es/date-picker/locale/vi_VN';
import {
    AuthContext
} from "../../components/context/AuthContext";
import {
    fetchScheduleByDoctorIdAPI
} from "../../services/schedule.service";
import {
    fetchUsersAPI
} from "../../services/user.service";
import {
    fetchHealthRecordByScheduleIdAPI
} from "../../services/health-record.service";
import {
    getPaymentByScheduleIdAPI
} from "../../services/payment.service";
dayjs.locale('vi');

const { Content } = Layout
const { Title } = Typography
const { TabPane } = Tabs

const PatientList = () => {
    const { user } = useContext(AuthContext)
    const [data, setData] = useState([])
    const [searchText, setSearchText] = useState('')
    const [activeTab, setActiveTab] = useState("waiting")
    const [loading, setLoading] = useState(false)
    const [hasSearchedExamined, setHasSearchedExamined] = useState(false)
    const [hasSearchedConsulted, setHasSearchedConsulted] = useState(false)
    const [hasSearchedAbsent, setHasSearchedAbsent] = useState(false)
    const [examinedSearchText, setExaminedSearchText] = useState('')
    const [consultedSearchText, setConsultedSearchText] = useState('')
    const [absentSearchText, setAbsentSearchText] = useState('')

    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
            handleTabChange(tabParam);
        }
    }, [tabParam]);

    const navigate = useNavigate()

    const normalizeString = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesText =
                normalizeString(item.fullName).includes(normalizeString(searchText)) ||
                normalizeString(item.patientCode).includes(normalizeString(searchText))
            return matchesText
        })
    }, [searchText, data])


    useEffect(() => {
        loadWaitingData()
    }, [])

    const loadWaitingData = async () => {
        setLoading(true)
        try {
            const [scheduleRes, patientRes] = await Promise.all([
                fetchScheduleByDoctorIdAPI(user.id),
                fetchUsersAPI(),
            ])

            const scheduleList = scheduleRes?.data || []
            const patientList = patientRes?.data || []

            const waitingSchedules = scheduleList.filter(schedule => {
                // Chỉ lấy các lịch có bệnh nhân
                return schedule.patient && schedule.patient.id && schedule.status == 'Đang hoạt động'
            })

            const healthRecordPromises = waitingSchedules.map(item =>
                fetchHealthRecordByScheduleIdAPI(item.id).then(
                    res => ({ scheduleId: item.id, data: res.data })
                ).catch(() => ({ scheduleId: item.id, data: null }))
            )

            const paymentPromises = waitingSchedules.map(item =>
                getPaymentByScheduleIdAPI(item.id).then(
                    res => ({ scheduleId: item.id, data: res.data })
                ).catch(() => ({ scheduleId: item.id, data: null }))
            )

            const [healthRecords, payments] = await Promise.all([
                Promise.all(healthRecordPromises),
                Promise.all(paymentPromises)
            ])

            const mergedData = waitingSchedules.map((item) => {
                const matchedPatient = patientList.find(p => p.id === item.patient.id)
                const matchedHealthRecord = healthRecords.find(hr => hr.scheduleId === item.id)
                const matchedPayment = payments.find(p => p.scheduleId === item.id)

                return {
                    id: item.id,
                    ...item,
                    patientCode: matchedPatient?.displayId || 'N/A',
                    avatar: matchedPatient?.avatar || '',
                    fullName: matchedPatient?.fullName || 'Chưa rõ tên',
                    treatmentStatus: matchedHealthRecord?.data?.treatmentStatus || 'Chưa cập nhật',
                    paymentStatus: matchedPayment?.data?.status || 'Chưa thanh toán',
                }
            }).filter(item => item.treatmentStatus === 'Đang chờ khám')

            setData(mergedData)
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu bệnh nhân đang chờ khám")
        } finally {
            setLoading(false)
        }
    }

    const loadTabData = async (tabKey, searchValue = '') => {
        setLoading(true)
        try {
            const [scheduleRes, patientRes] = await Promise.all([
                fetchScheduleByDoctorIdAPI(user.id),
                fetchUsersAPI(),
            ])

            const scheduleList = scheduleRes?.data || []
            const patientList = patientRes?.data || []

            // Chỉ lấy các lịch có bệnh nhân
            const validSchedules = scheduleList.filter(schedule =>
                schedule.patient && schedule.patient.id
            )

            const healthRecordPromises = validSchedules.map(item =>
                fetchHealthRecordByScheduleIdAPI(item.id).then(
                    res => ({ scheduleId: item.id, data: res.data })
                ).catch(() => ({ scheduleId: item.id, data: null }))
            )

            const paymentPromises = validSchedules.map(item =>
                getPaymentByScheduleIdAPI(item.id).then(
                    res => ({ scheduleId: item.id, data: res.data })
                ).catch(() => ({ scheduleId: item.id, data: null }))
            )

            const [healthRecords, payments] = await Promise.all([
                Promise.all(healthRecordPromises),
                Promise.all(paymentPromises)
            ])

            const mergedData = validSchedules.map((item) => {
                const matchedPatient = patientList.find(p => p.id === item.patient.id)
                const matchedHealthRecord = healthRecords.find(hr => hr.scheduleId === item.id)
                const matchedPayment = payments.find(p => p.scheduleId === item.id)

                return {
                    id: item.id,
                    ...item,
                    patientCode: matchedPatient?.displayId || 'N/A',
                    avatar: matchedPatient?.avatar || '',
                    fullName: matchedPatient?.fullName || 'Chưa rõ tên',
                    treatmentStatus: matchedHealthRecord?.data?.treatmentStatus || 'Chưa cập nhật',
                    paymentStatus: matchedPayment?.data?.status || 'Chưa thanh toán',
                }
            })

            // Lọc theo trạng thái điều trị tương ứng với tab
            let statusFilter = ''
            switch (tabKey) {
                case 'examined':
                    statusFilter = 'Đã khám'
                    break
                case 'consulted':
                    statusFilter = 'Đã tư vấn'
                    break
                case 'absent':
                    statusFilter = 'Không đến'
                    break
                default:
                    statusFilter = 'Đang chờ khám'
            }

            // Lọc theo trạng thái và từ khóa tìm kiếm
            const filteredByStatus = mergedData.filter(item => item.treatmentStatus === statusFilter)

            let result = filteredByStatus
            if (searchValue) {
                const normalizedSearch = normalizeString(searchValue)
                result = filteredByStatus.filter(item =>
                    normalizeString(item.fullName).includes(normalizedSearch) ||
                    normalizeString(item.patientCode).includes(normalizedSearch)
                )
            }

            setData(result)

            // Cập nhật trạng thái đã tìm kiếm cho tab tương ứng
            switch (tabKey) {
                case 'examined':
                    setHasSearchedExamined(true)
                    break
                case 'consulted':
                    setHasSearchedConsulted(true)
                    break
                case 'absent':
                    setHasSearchedAbsent(true)
                    break
                default:
                    break
            }
        } catch (error) {
            message.error(`Lỗi khi tải dữ liệu: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (key) => {
        setActiveTab(key)
        if (key === 'waiting') {
            loadWaitingData()
        } else {
            // Không tự động tải dữ liệu cho các tab khác
            setData([])
        }
    }

    const handleSearch = (tabKey, searchValue) => {
        loadTabData(tabKey, searchValue)
    }

    const handleViewDetail = (record) => {
        navigate(`/doctor/patients/${record.id}?tab=${activeTab}`);
    }

    const columns = [
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
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Ca khám',
            dataIndex: 'slot',
            key: 'slot',
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => {
                switch (status) {
                    case 'Thanh toán thành công':
                        return <span style={{ color: '#52c41a' }}>{status}</span>
                    case 'Thanh toán thành công':
                        return <span style={{ color: '#52c41a' }}>{status}</span>
                    case 'Đã thanh toán':
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
            title: 'Trạng thái điều trị',
            dataIndex: 'treatmentStatus',
            key: 'treatmentStatus',
            render: (status) => {
                switch (status) {
                    case 'Đang chờ khám':
                        return <span style={{ color: '#faad14' }}>{status}</span>
                    case 'Đã khám':
                        return <span style={{ color: '#52c41a' }}>{status}</span>
                    case 'Đã tư vấn':
                        return <span style={{ color: '#237804' }}>{status}</span>
                    case 'Không đến':
                        return <span style={{ color: '#f5222d' }}>{status}</span>
                    default:
                        return <span style={{ color: 'gray' }}>{status || 'Chưa cập nhật'}</span>
                }
            }
        },
        {
            key: 'action',
            render: (text, record) => (
                <Button type="link" onClick={() => handleViewDetail(record)}>
                    Chi tiết
                </Button>
            ),
        },
    ]

    // Create 4 lists for each appointment status
    const waitingList = filteredData.filter(item => item.treatmentStatus === 'Đang chờ khám')

    const renderSearchBar = (tabKey, searchValue, setSearchValue, hasSearched) => (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <Input
                placeholder="Tìm theo tên hoặc mã bệnh nhân"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ width: 300, marginRight: 16 }}
                onPressEnter={() => handleSearch(tabKey, searchValue)}
            />
            <Space>
                <Button
                    type="primary"
                    onClick={() => handleSearch(tabKey, searchValue)}
                >
                    Tìm kiếm
                </Button>
                <Button
                    onClick={() => handleSearch(tabKey, '')}
                >
                    Hiển thị tất cả
                </Button>
            </Space>
        </div>
    )

    return (
        <Layout>
            <Content>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '15px',
                    margin: '0 0 0 10px'
                }}>
                    <Title>Danh sách bệnh nhân</Title>
                </div>
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    <TabPane tab="Đang chờ khám" key="waiting">
                        <div style={{ margin: '0 10px 15px 10px' }}>
                            <Input
                                placeholder="Tìm theo tên hoặc mã bệnh nhân"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                style={{ width: '100%', maxWidth: '400px' }}
                            />
                        </div>
                        {loading ? (
                            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Table
                                style={{ margin: '0 10px 0 10px' }}
                                columns={columns}
                                dataSource={waitingList}
                                rowKey={(record) => record.id}
                                locale={{ emptyText: 'Không có bệnh nhân nào đang chờ khám' }}
                            />
                        )}
                    </TabPane>

                    <TabPane tab="Đã khám" key="examined">
                        {renderSearchBar('examined', examinedSearchText, setExaminedSearchText, hasSearchedExamined)}

                        {loading ? (
                            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            hasSearchedExamined && (
                                <Table
                                    style={{ margin: '0 10px 0 10px' }}
                                    columns={columns}
                                    dataSource={data}
                                    rowKey={(record) => record.id}
                                    locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
                                />
                            )
                        )}
                    </TabPane>

                    <TabPane tab="Đã tư vấn" key="consulted">
                        {renderSearchBar('consulted', consultedSearchText, setConsultedSearchText, hasSearchedConsulted)}

                        {loading ? (
                            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            hasSearchedConsulted && (
                                <Table
                                    style={{ margin: '0 10px 0 10px' }}
                                    columns={columns}
                                    dataSource={data}
                                    rowKey={(record) => record.id}
                                    locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
                                />
                            )
                        )}
                    </TabPane>

                    <TabPane tab="Không đến" key="absent">
                        {renderSearchBar('absent', absentSearchText, setAbsentSearchText, hasSearchedAbsent)}

                        {loading ? (
                            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            hasSearchedAbsent && (
                                <Table
                                    style={{ margin: '0 10px 0 10px' }}
                                    columns={columns}
                                    dataSource={data}
                                    rowKey={(record) => record.id}
                                    locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
                                />
                            )
                        )}
                    </TabPane>
                </Tabs>
            </Content>
            <Outlet />
        </Layout>
    )
}
export default PatientList