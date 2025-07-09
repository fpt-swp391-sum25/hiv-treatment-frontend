import { Button, Table, Typography, Input, Select, Row, Col } from "antd";
import { useState, useEffect } from "react";
import { fetchUsersAPI, fetchScheduleAPI } from "../../services/api.service";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import viVN from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const LabTechnicianPatientList = () => {
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [searchName, setSearchName] = useState('');
    const [slotFilter, setSlotFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [scheduleRes, patientRes] = await Promise.all([
                fetchScheduleAPI(),
                fetchUsersAPI(),
            ]);

            const scheduleList = scheduleRes?.data || [];
            const patientList = patientRes?.data || [];

            const mergedData = scheduleList.map((item) => {
                const patientId = item.patient?.id;
                const matchedPatient = patientList.find(p => p.id === patientId);
                return {
                    id: item.id,
                    ...item,
                    patientCode: matchedPatient?.displayId || 'N/A',
                    avatar: matchedPatient?.avatar || '',
                    fullName: matchedPatient?.fullName || 'Chưa rõ tên',
                };
            }).filter(item => item.patientCode !== 'N/A' && item.fullName !== 'Chưa rõ tên' && item.date && item.slot);

            setData(mergedData);
            setFilteredData(mergedData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        }
    };

    useEffect(() => {
        let filtered = data;
        if (searchName) {
            filtered = filtered.filter(item =>
                item.fullName.toLowerCase().includes(searchName.toLowerCase())
            );
        }
        if (slotFilter) {
            filtered = filtered.filter(item => item.slot === slotFilter);
        }
        if (dateFilter) {
            filtered = filtered.filter(item => {
                return item.date && item.date.slice(0, 10) === dateFilter.format('YYYY-MM-DD');
            });
        }
        // Sắp xếp theo ngày và giờ giảm dần (mới nhất lên đầu)
        filtered = filtered.slice().sort((a, b) => {
            // Nếu có cả ngày và giờ, nối lại để so sánh
            const dateTimeA = a.date && a.slot ? `${a.date} ${a.slot}` : a.date || '';
            const dateTimeB = b.date && b.slot ? `${b.date} ${b.slot}` : b.date || '';
            return dateTimeB.localeCompare(dateTimeA);
        });
        setFilteredData(filtered);
    }, [searchName, slotFilter, dateFilter, data]);

    // Lấy danh sách ca khám duy nhất
    const slotOptions = Array.from(new Set(data.map(item => item.slot))).filter(Boolean);

    const handleViewDetail = (record) => {
        navigate(`/lab-technician/patient-detail/${record.id}`);
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
            render: (avatar) =>
                avatar ? (
                    <img
                    src={
                        avatar.startsWith('data:image')
                        ? avatar
                        : `data:image/jpeg;base64,${avatar}`
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
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Input
                        placeholder="Tìm kiếm theo tên bệnh nhân"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col span={3}>
                    <Select
                        placeholder="Lọc theo ca khám"
                        value={slotFilter || undefined}
                        onChange={value => setSlotFilter(value)}
                        allowClear
                        style={{ width: '100%' }}
                    >
                        {slotOptions.map(slot => (
                            <Option key={slot} value={slot}>
                                {slot.slice(0,5)}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col span={5}>
                    <DatePicker
                        placeholder="Lọc theo ngày khám"
                        value={dateFilter}
                        onChange={setDateFilter}
                        allowClear
                        style={{ width: '100%' }}
                        locale={viVN}
                        format="DD/MM/YYYY"
                    />
                </Col>
            </Row>
            <Table columns={columns} dataSource={filteredData} rowKey={(record) => record.id} />
        </>
    )
}
export default LabTechnicianPatientList; 