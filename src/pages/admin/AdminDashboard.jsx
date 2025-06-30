import { Card, Col, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { fetchAccountByRoleAPI, fetchScheduleAPI } from '../../services/api.service';

function getCurrentMonth() {
    const now = new Date();
    return now.getMonth() + 1; // JS month is 0-based
}
function getCurrentYear() {
    return new Date().getFullYear();
}

const AdminDashboard = () => {
    const [counts, setCounts] = useState({
        doctors: 0,
        labTechnicians: 0,
        managers: 0,
        patients: 0,
        newPatientsThisMonth: 0,
        schedulesByStatus: {},
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [doctors, labTechs, managers, patients, schedules] = await Promise.all([
                    fetchAccountByRoleAPI('DOCTOR'),
                    fetchAccountByRoleAPI('LAB_TECHNICIAN'),
                    fetchAccountByRoleAPI('MANAGER'),
                    fetchAccountByRoleAPI('PATIENT'),
                    fetchScheduleAPI(),
                ]);
                // Đếm số bệnh nhân mới đăng ký trong tháng
                const month = getCurrentMonth();
                const year = getCurrentYear();
                const newPatientsThisMonth = (patients.data || []).filter(p => {
                    if (!p.createdAt) return false;
                    const d = new Date(p.createdAt);
                    return d.getMonth() + 1 === month && d.getFullYear() === year;
                }).length;
                // Đếm số lượng lịch hẹn theo trạng thái
                const schedulesByStatus = {};
                (schedules.data || []).forEach(sch => {
                    const status = sch.status || 'Khác';
                    schedulesByStatus[status] = (schedulesByStatus[status] || 0) + 1;
                });
                setCounts({
                    doctors: doctors.data?.length || 0,
                    labTechnicians: labTechs.data?.length || 0,
                    managers: managers.data?.length || 0,
                    patients: patients.data?.length || 0,
                    newPatientsThisMonth,
                    schedulesByStatus,
                });
            } catch (error) {
                // Có thể thêm thông báo lỗi ở đây
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
    }

    return (
        <div style={{ padding: 32 }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Tổng số bác sĩ">{counts.doctors}</Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Tổng số kỹ thuật viên">{counts.labTechnicians}</Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Tổng số quản lý">{counts.managers}</Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Tổng số bệnh nhân">{counts.patients}</Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Bệnh nhân mới trong tháng">
                        {counts.newPatientsThisMonth}
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={16} lg={12}>
                    <Card title="Lịch hẹn theo trạng thái">
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {Object.entries(counts.schedulesByStatus).map(([status, count]) => (
                                <li key={status} style={{ marginBottom: 4 }}>
                                    <b>{status}:</b> {count}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashboard;