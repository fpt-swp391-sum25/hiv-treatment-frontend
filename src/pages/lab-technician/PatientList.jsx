import { Button, Table, Typography, Input, Select, Row, Col } from "antd";
import { useState, useEffect } from "react";
import { fetchUsersAPI, fetchScheduleAPI } from "../../services/api.service";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const LabTechnicianPatientList = () => {
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [searchName, setSearchName] = useState('');
    const [slotFilter, setSlotFilter] = useState('');
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
            });

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
        setFilteredData(filtered);
    }, [searchName, slotFilter, data]);

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
        },
        {
            title: 'Ca khám',
            dataIndex: 'slot',
            key: 'slot',
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
                            <Option key={slot} value={slot}>{slot}</Option>
                        ))}
                    </Select>
                </Col>
            </Row>
            <Table columns={columns} dataSource={filteredData} rowKey={(record) => record.id} />
        </>
    )
}
export default LabTechnicianPatientList; 