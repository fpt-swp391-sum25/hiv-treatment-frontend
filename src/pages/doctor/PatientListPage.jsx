import { Layout, Button, Table, Typography } from "antd";
import { useState, useEffect } from "react";
import { fetchUsersAPI, fetchScheduleAPI } from "../../services/api.service";
import { Outlet, useNavigate } from "react-router-dom";
import PageHeader from '../../components/client/PageHeader';

const { Content } = Layout;
const { Title } = Typography;

const PatientList = () => {
    const [data, setData] = useState([])
    
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
                const matchedPatient = patientList.find(p => p.id === item.patient.id);
                return {
                    id: item.id,
                    ...item,
                    patientCode: matchedPatient?.patientCode || 'N/A',
                    avatar: matchedPatient?.avatar || '',
                    fullName: matchedPatient?.fullName || 'Chưa rõ tên',
                };
            });

            setData(mergedData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        }
    };

    const handleViewDetail = (record) => {
        navigate(`/doctor/patient-list/${record.id}`);
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
                <Button type = "link" onClick={() => handleViewDetail(record)}>
                    Chi tiết
                </Button>
            ),
        },
    ]

    return (
        <Layout>
            <Content>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
                    <Title>Danh sách bệnh nhân</Title>
                </div>
                <Table columns={columns} dataSource={data} rowKey={(record) => record.id} />
            </Content>
            <Outlet />
        </Layout>
    )
}
export default PatientList;