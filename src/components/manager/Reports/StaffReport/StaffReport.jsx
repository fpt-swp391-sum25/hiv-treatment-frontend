import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spin, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getStaffData } from '../../../../services/report.service';
import { STAFF_ROLES } from '../../../../types/report.types';
import './StaffReport.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const StaffReport = ({ dateRange, onError }) => {
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState({
        doctors: [],
        labTechnicians: [],
        managers: []
    });

    useEffect(() => {
        fetchStaffData();
    }, [dateRange]);

    const fetchStaffData = async () => {
        try {
            setLoading(true);
            const data = await getStaffData();
            setStaffData({
                doctors: Array.isArray(data.doctors) ? data.doctors : [],
                labTechnicians: Array.isArray(data.labTechnicians) ? data.labTechnicians : [],
                managers: Array.isArray(data.managers) ? data.managers : []
            });
        } catch (error) {
            console.error('Error fetching staff data:', error);
            onError(error);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán thống kê
    const statistics = {
        totalDoctors: staffData.doctors.length,
        totalLabTechs: staffData.labTechnicians.length,
        totalManagers: staffData.managers.length,
        totalStaff: staffData.doctors.length + staffData.labTechnicians.length + staffData.managers.length
    };

    // Dữ liệu cho biểu đồ phân bố
    const distributionData = [
        { name: 'Bác sĩ', value: statistics.totalDoctors },
        { name: 'Kỹ thuật viên', value: statistics.totalLabTechs },
        { name: 'Quản lý', value: statistics.totalManagers }
    ];

    // Cấu hình cột cho bảng nhân viên
    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            width: '20%',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: '10%',
            render: (role) => {
                switch (role) {
                    case STAFF_ROLES.DOCTOR:
                        return 'Bác sĩ';
                    case STAFF_ROLES.LAB_TECHNICIAN:
                        return 'Kỹ thuật viên';
                    case STAFF_ROLES.MANAGER:
                        return 'Quản lý';
                    default:
                        return role;
                }
            }
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '20%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: '15%',
        },
        {
            title: 'Số ca đã xử lý',
            dataIndex: 'casesHandled',
            key: 'casesHandled',
            width: '15%',
            render: (cases, record) => {
                if (record.role === STAFF_ROLES.DOCTOR) {
                    return `${cases || 0} ca khám`;
                } else if (record.role === STAFF_ROLES.LAB_TECHNICIAN) {
                    return `${cases || 0} xét nghiệm`;
                }
                return '-';
            }
        },
        {
            title: 'Hiệu suất',
            dataIndex: 'performance',
            key: 'performance',
            width: '10%',
            render: (performance) => {
                let color = '#52c41a'; // green
                if (performance < 50) {
                    color = '#f5222d'; // red
                } else if (performance < 80) {
                    color = '#faad14'; // yellow
                }
                return performance ? (
                    <span style={{ color }}>
                        {performance}%
                    </span>
                ) : '-';
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
        }
    ];

    // Tạo danh sách nhân viên cho bảng
    const staffList = [
        ...staffData.doctors.map(doc => ({ ...doc, role: STAFF_ROLES.DOCTOR })),
        ...staffData.labTechnicians.map(tech => ({ ...tech, role: STAFF_ROLES.LAB_TECHNICIAN })),
        ...staffData.managers.map(mgr => ({ ...mgr, role: STAFF_ROLES.MANAGER }))
    ];

    return (
        <Spin spinning={loading}>
            <div className="staff-report">
                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="statistics-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng nhân viên"
                                value={statistics.totalStaff}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Bác sĩ"
                                value={statistics.totalDoctors}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Kỹ thuật viên"
                                value={statistics.totalLabTechs}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Quản lý"
                                value={statistics.totalManagers}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ phân bố nhân sự */}
                <Card title="Phân bố nhân sự" className="chart-card">
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Bảng danh sách nhân viên */}
                <Card title="Danh sách nhân viên" className="table-card">
                    <Table
                        columns={columns}
                        dataSource={staffList}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} nhân viên`
                        }}
                    />
                </Card>
            </div>
        </Spin>
    );
};

export default StaffReport; 