import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Statistic } from 'antd';
import { UserOutlined, SolutionOutlined, ExperimentOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStaffData, getDoctorScheduleStats } from '../../../../services/report.service';
import './StaffReport.css';

const StaffReport = ({ dateRange }) => {
    const [staffData, setStaffData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getStaffData();
                setStaffData(data);
            } catch (error) {
                console.error('Error fetching staff data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const staffDistributionData = staffData ? [
        {
            name: 'Phân bố nhân sự',
            'Bác sĩ': staffData.doctors.length,
            'Kỹ thuật viên': staffData.labTechnicians.length,
            'Quản lý': staffData.managers.length,
        }
    ] : [];

    const columns = [
        {
            title: 'Tên nhân viên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        }
    ];

    return (
        <div className="staff-report">
            {/* Thống kê tổng quan */}
            <Row gutter={[16, 16]} className="statistics-row">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số bác sĩ"
                            value={staffData?.doctors.length || 0}
                            prefix={<UserOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số kỹ thuật viên"
                            value={staffData?.labTechnicians.length || 0}
                            prefix={<ExperimentOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số quản lý"
                            value={staffData?.managers.length || 0}
                            prefix={<SolutionOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ phân bố nhân sự */}
            <Card title="Biểu đồ phân bố nhân sự" className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={staffDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Bác sĩ" fill="#1890ff" />
                        <Bar dataKey="Kỹ thuật viên" fill="#52c41a" />
                        <Bar dataKey="Quản lý" fill="#faad14" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Bảng danh sách nhân sự */}
            <Card title="Danh sách nhân sự" className="table-card">
                <Table
                    columns={columns}
                    dataSource={staffData ? [...staffData.doctors, ...staffData.labTechnicians, ...staffData.managers] : []}
                    loading={loading}
                    rowKey="id"
                />
            </Card>
        </div>
    );
};

export default StaffReport; 