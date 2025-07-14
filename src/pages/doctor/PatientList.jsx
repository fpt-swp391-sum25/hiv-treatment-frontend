import {
    Layout, Button, Table, Typography, Input,
    DatePicker, Select, Row, Col
} from "antd";
import { useState, useEffect, useContext } from "react";
import {
    fetchUsersAPI,
    fetchScheduleByDoctorIdAPI,
    fetchHealthRecordByScheduleIdAPI
} from "../../services/api.service";
import { Outlet, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import viVN from 'antd/es/date-picker/locale/vi_VN';
import { AuthContext } from "../../components/context/AuthContext";
dayjs.locale('vi');

const { Content } = Layout;
const { Title } = Typography;

const PatientList = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState([])
    const [searchText, setSearchText] = useState('');
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredData, setFilteredData] = useState([]);



    const navigate = useNavigate();

    useEffect(() => {
        const filtered = data.filter(item => {
            const matchesText =
                item.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                item.patientCode.toLowerCase().includes(searchText.toLowerCase());

            const dateObj = dayjs(item.date);
            const matchesYear = selectedYear ? dateObj.year() === selectedYear : true;
            const matchesMonth = selectedMonth ? dateObj.month() === selectedMonth.month() && dateObj.year() === selectedMonth.year() : true;
            const matchesDate = selectedDate ? dateObj.isSame(selectedDate, 'day') : true;

            return matchesText && matchesYear && matchesMonth && matchesDate;
        });

        setFilteredData(filtered);
    }, [searchText, selectedYear, selectedMonth, selectedDate, data]);

    useEffect(() => {
        loadData();
        console.log(">>>> check filter data", filteredData)
    }, []);

    const loadData = async () => {
        console.log(">>>>>>>>>>check user", user)
        try {
            const [scheduleRes, patientRes] = await Promise.all([
                fetchScheduleByDoctorIdAPI(user.id),
                fetchUsersAPI(),
            ]);

            const scheduleList = scheduleRes?.data || [];
            const patientList = patientRes?.data || [];

            const healthRecordPromises = scheduleList.map(item =>
                fetchHealthRecordByScheduleIdAPI(item.id).then(
                    res => ({ scheduleId: item.id, data: res.data }),
                    err => ({ scheduleId: item.id, data: null })
                )
            );

            const healthRecords = await Promise.all(healthRecordPromises);

            const mergedData = scheduleList.map((item) => {
                console.log("check schedule", scheduleList)
                if (!item?.patient?.id) return null;
                const matchedPatient = patientList.find(p => p.id === item.patient.id);
                const matchedHealthRecord = healthRecords.find(hr => hr.scheduleId === item.id);
                console.log(">>>>>>>>>>>> check matched patient", matchedPatient)
                return {
                    id: item.id,
                    ...item,
                    patientCode: matchedPatient?.displayId || 'N/A',
                    avatar: matchedPatient?.avatar || '',
                    fullName: matchedPatient?.fullName || 'Chưa rõ tên',
                    treatmentStatus: matchedHealthRecord?.data?.treatmentStatus || 'Chưa cập nhật',
                };
            }).filter(item => item !== null);

            setData(mergedData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        }
    };

    const handleViewDetail = (record) => {
        navigate(`/doctor/patients/${record.id}`);
    };

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
            title: 'Trạng thái điều trị',
            dataIndex: 'treatmentStatus',
            key: 'treatmentStatus',
            render: (status) => {
                switch (status) {
                    case 'Đang chờ khám':
                        return <span style={{ color: '#faad14' }}>{status}</span>;
                    case 'Đã khám':
                        return <span style={{ color: '#52c41a' }}>{status}</span>;
                    case 'Đã tư vấn':
                        return <span style={{ color: '#237804' }}>{status}</span>;
                    case 'Không đến':
                        return <span style={{ color: '#f5222d' }}>{status}</span>;
                    default:
                        return <span style={{ color: 'gray' }}>{status || 'Chưa cập nhật'}</span>;
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

    return (
        <Layout>
            <Row gutter={[16, 16]} style={{ margin: '3vh 1vw 0 1vw' }}>
                <Col xs={24} md={6}>
                    <Input
                        placeholder="Tìm theo tên hoặc mã bệnh nhân"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Select
                        placeholder="Lọc theo năm"
                        style={{ width: '100%' }}
                        allowClear
                        value={selectedYear}
                        onChange={value => setSelectedYear(value)}
                    >
                        {Array.from({ length: 6 }, (_, i) => 2025 + i).map(year => (
                            <Select.Option key={year} value={year}>
                                {year}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} md={6}>
                    <DatePicker
                        picker="month"
                        placeholder="Lọc theo tháng"
                        style={{ width: '100%' }}
                        value={selectedMonth}
                        onChange={(date) => setSelectedMonth(date)}
                        allowClear
                        locale={viVN}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <DatePicker
                        placeholder="Lọc theo ngày"
                        style={{ width: '100%' }}
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        allowClear
                        locale={viVN}
                    />
                </Col>
            </Row>

            <Content>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '15px', margin: '0 0 0 10px'
                }}>
                    <Title>Danh sách bệnh nhân</Title>
                </div>
                <Table style={{ margin: '0 10px 0 10px' }}
                    columns={columns}
                    dataSource={[...filteredData].sort((a, b) => {
                        if (a.treatmentStatus === 'Đang chờ khám' && b.treatmentStatus !== 'Đang chờ khám') return -1;
                        if (a.treatmentStatus !== 'Đang chờ khám' && b.treatmentStatus === 'Đang chờ khám') return 1;
                        return 0;
                    })}
                    rowKey={(record) => record.id}
                />
            </Content>
            <Outlet />
        </Layout>
    )
}
export default PatientList;