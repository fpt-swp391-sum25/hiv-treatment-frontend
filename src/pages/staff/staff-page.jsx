import { Layout, Button, Table } from "antd";
import { useState, useEffect } from "react";
import { fetchUsersAPI, fetchScheduleAPI } from "../../services/api.service";
import { useNavigate } from "react-router-dom";
import AdminHeader from '../../components/layouts/admin/admin-header';

const { Content } = Layout;

const Staff = () => {
    const [data, setData] = useState([])
    const [schedule, setSchedule] = useState([])
    const [patient, setPatient] = useState([])
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

            setSchedule(scheduleList);
            setPatient(patientList);

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
        navigate(`/staff/patient-detail/${record.id}`);
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
            <AdminHeader />
            <Content>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
                    <h2>Danh sách bệnh nhân</h2>
                </div>
                <Table columns={columns} dataSource={data} rowKey={(record) => record.id} />
            </Content>
        </Layout>
    )
}
export default Staff;