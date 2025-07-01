import { Card, Col, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { fetchAccountByRoleAPI, fetchScheduleAPI } from '../../services/api.service';

import '../../styles/admin/AdminDashboard.css';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

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

                    <Card title="Tổng số bác sĩ" className="admin-dashboard-card">
                        <div className="dashboard-number">{counts.doctors}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Tổng số nhân viên" className="admin-dashboard-card">
                        <div className="dashboard-number">{counts.labTechnicians}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Tổng số quản lý" className="admin-dashboard-card">
                        <div className="dashboard-number">{counts.managers}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Tổng số bệnh nhân" className="admin-dashboard-card">
                        <div className="dashboard-number">{counts.patients}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card title="Bệnh nhân mới trong tháng" className="admin-dashboard-card">
                        <div className="dashboard-number">{counts.newPatientsThisMonth}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={16} lg={12}>
                    <Card title="Lịch hẹn theo trạng thái" className="admin-dashboard-card">
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
            <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
                <Col xs={24} md={12}>
                    <Card title="Phân loại nhân viên" className="admin-dashboard-card">
                        <Pie
                            data={{
                                labels: ['Bác sĩ', 'Kỹ thuật viên', 'Quản lý'],
                                datasets: [
                                    {
                                        data: [counts.doctors, counts.labTechnicians, counts.managers],
                                        backgroundColor: [
                                            '#2c7bbf', '#ff9800', '#4caf50'
                                        ],
                                        borderColor: [
                                            '#1565c0', '#f57c00', '#388e3c'
                                        ],
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: true, text: 'Phân loại nhân viên' },
                                },
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Phân loại lịch hẹn theo trạng thái" className="admin-dashboard-card">
                        <Pie
                            data={{
                                labels: Object.keys(counts.schedulesByStatus),
                                datasets: [
                                    {
                                        data: Object.values(counts.schedulesByStatus),
                                        backgroundColor: [
                                            '#4caf50', '#2c7bbf', '#ff9800', '#e91e63', '#9c27b0', '#607d8b', '#ffc107', '#795548'
                                        ],
                                        borderColor: [
                                            '#388e3c', '#1565c0', '#f57c00', '#ad1457', '#6a1b9a', '#455a64', '#ffa000', '#4e342e'
                                        ],
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: true, text: 'Phân loại lịch hẹn' },
                                },
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashboard;