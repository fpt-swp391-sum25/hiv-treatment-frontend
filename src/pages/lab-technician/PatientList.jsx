import {
    Button,
    Table,
    Typography,
    Input,
    Select,
    Row,
    Col,
    Tabs,
    message
} from "antd";
import {
    useState,
    useEffect
} from "react";
import {
    useNavigate,
    useLocation,
} from "react-router-dom";
import {
    DatePicker
} from "antd";
import viVN from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import {
    fetchScheduleAPI
} from "../../services/schedule.service";
import {
    fetchUsersAPI
} from "../../services/user.service";
import queryString from "query-string"; 

const { Title } = Typography
const { Option } = Select
const { TabPane } = Tabs

const LabTechnicianPatientList = () => {
    const [data, setData] = useState([])
    // Filter for "Đang chờ xử lý"
    const [pendingSearchName, setPendingSearchName] = useState('')
    const [pendingSlotFilter, setPendingSlotFilter] = useState('')
    const [pendingDateFilter, setPendingDateFilter] = useState(null)
    // Filter for "Lịch sử"
    const [historySearchName, setHistorySearchName] = useState('')
    const [historySlotFilter, setHistorySlotFilter] = useState('')
    const [historyDateFilter, setHistoryDateFilter] = useState(null)
    const [pendingFiltered, setPendingFiltered] = useState([])
    const [historyFiltered, setHistoryFiltered] = useState([])
    const navigate = useNavigate()
    const location = useLocation();
    const parsedQuery = queryString.parse(location.search);
    const [activeTab, setActiveTab] = useState(parsedQuery.tab || "pending");
    const [hasSearchedHistory, setHasSearchedHistory] = useState(false)

  useEffect(() => {
      setActiveTab(parsedQuery.tab || "pending");
  }, [location.search]);

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [scheduleRes, patientRes] = await Promise.all([
                fetchScheduleAPI(),
                fetchUsersAPI(),
            ])

            const scheduleList = scheduleRes?.data || []
            const patientList = patientRes?.data || []

            const mergedData = scheduleList
                .filter(item => item.status && item.status !== 'Đã hủy') 
                .map((item) => {
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
                .filter(item =>
                    item.patientCode !== 'N/A' &&
                    item.fullName !== 'Chưa rõ tên' &&
                    item.date &&
                    item.slot
                )

            setData(mergedData)
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error)
        }
    }


    // Split into 2 arrays: pending (now or future), history (before today)
    const today = dayjs().startOf('day')
    const pendingList = data.filter(item => {
        const itemDate = item.date ? dayjs(item.date).startOf('day') : null
        return itemDate && (itemDate.isSame(today) || itemDate.isAfter(today))
    })
    const historyList = data.filter(item => {
        const itemDate = item.date ? dayjs(item.date).startOf('day') : null
        return itemDate && itemDate.isBefore(today)
    })

    // Filter for each tab
    useEffect(() => {
        let filtered = pendingList
        if (pendingSearchName) {
            filtered = filtered.filter(item =>
                item.fullName.toLowerCase().includes(pendingSearchName.toLowerCase())
            )
        }
        if (pendingSlotFilter) {
            filtered = filtered.filter(item => item.slot === pendingSlotFilter)
        }
        if (pendingDateFilter) {
            filtered = filtered.filter(item => {
                return item.date && item.date.slice(0, 10) === pendingDateFilter.format('YYYY-MM-DD')
            })
        }
        filtered = filtered.slice().sort((a, b) => {
            const dateTimeA = a.date && a.slot ? `${a.date} ${a.slot}` : a.date || ''
            const dateTimeB = b.date && b.slot ? `${b.date} ${b.slot}` : b.date || ''
            return dateTimeB.localeCompare(dateTimeA)
        })
        setPendingFiltered(filtered)
    }, [pendingSearchName, pendingSlotFilter, pendingDateFilter, data])

    useEffect(() => {
        if (!hasSearchedHistory) {
            setHistoryFiltered([]); 
            return;
        }

        let filtered = historyList
        if (historySearchName) {
            filtered = filtered.filter(item =>
                item.fullName.toLowerCase().includes(historySearchName.toLowerCase())
            )
        }
        if (historySlotFilter) {
            filtered = filtered.filter(item => item.slot === historySlotFilter)
        }
        if (historyDateFilter) {
            filtered = filtered.filter(item => {
                return item.date && item.date.slice(0, 10) === historyDateFilter.format('YYYY-MM-DD')
            })
        }
        filtered = filtered.slice().sort((a, b) => {
            const dateTimeA = a.date && a.slot ? `${a.date} ${a.slot}` : a.date || ''
            const dateTimeB = b.date && b.slot ? `${b.date} ${b.slot}` : b.date || ''
            return dateTimeB.localeCompare(dateTimeA)
        })
        setHistoryFiltered(filtered)
    }, [historySearchName, historySlotFilter, historyDateFilter, data, hasSearchedHistory])


    // Get list for each tab
    const pendingSlotOptions = Array.from(new Set(pendingList.map(item => item.slot))).filter(Boolean)
    const historySlotOptions = Array.from(new Set(historyList.map(item => item.slot))).filter(Boolean)

    const handleViewDetail = (record) => {
        navigate(`/lab-technician/patient-detail/${record.id}`, {
            state: { fromTab: activeTab }  
        });
    };

    const normalizeString = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
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
            render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : '',
        },
        {
            title: 'Ca khám',
            dataIndex: 'slot',
            key: 'slot',
            render: (slot) => slot ? dayjs(slot, 'HH:mm:ss').format('HH:mm') : '',
        },
        {
            title: 'Action',
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
           <Tabs
                activeKey={activeTab}
                onChange={(key) => {
                    setActiveTab(key);
                    navigate(`?tab=${key}`);
                }}
            >
                <TabPane tab="Đang chờ xử lý" key="pending">
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <Input
                                placeholder="Tìm kiếm theo tên bệnh nhân"
                                value={pendingSearchName}
                                onChange={e => setPendingSearchName(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col span={3}>
                            <Select
                                placeholder="Lọc theo ca khám"
                                value={pendingSlotFilter || undefined}
                                onChange={value => setPendingSlotFilter(value)}
                                allowClear
                                style={{ width: '100%' }}
                            >
                                {pendingSlotOptions.map(slot => (
                                    <Option key={slot} value={slot}>
                                        {slot.slice(0, 5)}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={5}>
                            <DatePicker
                                placeholder="Lọc theo ngày khám"
                                value={pendingDateFilter}
                                onChange={setPendingDateFilter}
                                allowClear
                                style={{ width: '100%' }}
                                locale={viVN}
                                format="DD/MM/YYYY"
                            />
                        </Col>
                    </Row>
                    <Table columns={columns} dataSource={pendingFiltered} rowKey={(record) => record.id} />
                </TabPane>
                <TabPane tab="Lịch sử" key="history">
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <Input
                                placeholder="Tìm kiếm theo tên bệnh nhân"
                                value={historySearchName}
                                onChange={e => setHistorySearchName(e.target.value)}
                                allowClear
                                onPressEnter={() => setHasSearchedHistory(true)} // Tìm khi Enter
                            />
                        </Col>
                        <Col span={3}>
                            <Select
                                placeholder="Lọc theo ca khám"
                                value={historySlotFilter || undefined}
                                onChange={value => {
                                    setHistorySlotFilter(value);
                                    setHasSearchedHistory(true);
                                }}
                                allowClear
                                style={{ width: '100%' }}
                            >
                                {historySlotOptions.map(slot => (
                                    <Option key={slot} value={slot}>
                                        {slot.slice(0, 5)}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={5}>
                            <DatePicker
                                placeholder="Lọc theo ngày khám"
                                value={historyDateFilter}
                                onChange={(value) => {
                                    setHistoryDateFilter(value);
                                    setHasSearchedHistory(true);
                                }}
                                allowClear
                                style={{ width: '100%' }}
                                locale={viVN}
                                format="DD/MM/YYYY"
                            />
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                onClick={() => {
                                    if (!historySearchName.trim()) {
                                        message.warning('Vui lòng nhập tên bệnh nhân để tìm kiếm');
                                        return;
                                    }
                                    setHasSearchedHistory(true);
                                }}
                            >
                                Tìm kiếm
                            </Button>
                            <Button
                                style={{ marginLeft: 8 }}
                                onClick={() => {
                                    setHistorySearchName('');
                                    setHistorySlotFilter('');
                                    setHistoryDateFilter(null);
                                    setHasSearchedHistory(true);
                                }}
                            >
                                Hiển thị tất cả
                            </Button>
                        </Col>
                    </Row>

                    {hasSearchedHistory && (
                        <Table
                            columns={columns}
                            dataSource={historyFiltered}
                            rowKey={(record) => record.id}
                        />
                    )}
                </TabPane>
            </Tabs>
        </>
    )
}
export default LabTechnicianPatientList 