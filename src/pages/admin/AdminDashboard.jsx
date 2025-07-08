import { Card, Col, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { fetchAccountByRoleAPI, fetchScheduleAPI } from '../../services/api.service';

import '../../styles/admin/AdminDashboard.css';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import ScheduleByDayChart from '../../components/admin/ScheduleByDayChart';

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
        totalUser: 0,
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
                    totalUser: doctors.data?.length
                    + labTechs.data?.length + managers.data?.length
                    + patients.data?.length || 0

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
                <Col xs={24} md={12}>
                    <Card title="Tổng số người dùng hệ thống" className="admin-dashboard-card">
                        <div className="dashboard-number">{counts.totalUser}</div>
                    </Card>
                    
                    <Card title="Phân loại nhân viên" className="pie-chart-dashboard-card">
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
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="Số bác sĩ" className="admin-dashboard-card">
                                <div className="dashboard-number">{counts.doctors}</div>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Số kỹ thuật viên" className="admin-dashboard-card">
                                <div className="dashboard-number">{counts.labTechnicians}</div>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Số quản lý" className="admin-dashboard-card">
                                <div className="dashboard-number">{counts.managers}</div>
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card title="Số bệnh nhân" className="admin-dashboard-card">
                                <div className="dashboard-number">{counts.patients}</div>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashboard;